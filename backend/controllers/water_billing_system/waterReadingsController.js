import db from '../../config/database.js'; 
import { getPendingCustomers, getProjectCodes } from '../../models/water_billing_system/waterReadingsModel.js';
import { calculateBill } from '../../utils/BillCalculator.js'; 
import { sendMobitelSMS } from '../../utils/mobitelSmsService.js';

// 1. Get Pending Customers
export const getPendingCustomersController = async (req, res) => {
    try {
        const { sabha_code, project_code, month, year } = req.query;
        
        if (!sabha_code || !project_code || !month || !year) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }
        
        const customers = await getPendingCustomers(sabha_code, project_code, parseInt(month), parseInt(year));
        
        res.json({ status: 'success', data: customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// 2. Save Batch Readings (One-by-One with Transaction for Billing)
export const saveBatchReadingsController = async (req, res) => {
    // We get a dedicated connection for the transaction.
    const connection = await db.getConnection();
    const smsQueue = []; // ✅ සාර්ථක බිල්පත් සඳහා යැවිය යුතු SMS මෙහි එකතු කරගනිමු

    try {
        const readings = req.body;

        if (!Array.isArray(readings) || readings.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Readings must be a non-empty array' });
        }

        await connection.beginTransaction();
        let processedCount = 0;

        for (const reading of readings) {
            // Basic Validation
            if (!reading.account_id || reading.current_reading === undefined || !reading.bill_number_ref) {
                throw new Error(`Invalid data (Missing ID, Reading, or Bill Ref) for Account ID: ${reading.account_id || 'Unknown'}`);
            }

            // Check for existing reading to prevent duplicate entry error
            const [existingReadings] = await connection.query(
                `SELECT id FROM water_meter_readings WHERE account_id = ? AND year = ? AND month = ?`,
                [reading.account_id, reading.year, reading.month]
            );

            if (existingReadings.length > 0) {
                console.warn(`Skipping duplicate reading for Account ID: ${reading.account_id}, Year: ${reading.year}, Month: ${reading.month}`);
                continue;
            }

            // =========================================================
            // 🟢 STEP 1: Parse Data from Bill Number (Reference Number)
            // =========================================================
            const billRef = String(reading.bill_number_ref).trim();
            
            if (billRef.length < 8) {
                throw new Error(`Invalid Bill Number format: ${billRef}`);
            }

            const typeCode = billRef.charAt(6);     
            const samurdhiCode = billRef.charAt(7); 
            const meteredCode = billRef.charAt(8);  

            // Mapping Logic
            let accountType = 'Domestic'; 
            if (typeCode === 'D') accountType = 'Domestic';
            else if (typeCode === 'C') accountType = 'Commercial';
            else if (typeCode === 'I') accountType = 'Construction/Industrial'; 
            
            const isSamurdhi = (samurdhiCode === 'S') ? 1 : 0;
            const isMetered = (meteredCode === 'M') ? 1 : 0;

            // =========================================================
            // 🟢 STEP 1.5: Get Customer History ID
            // =========================================================
            const [historyRows] = await connection.query(
                `SELECT id FROM water_customer_history 
                 WHERE customer_id = ? 
                 ORDER BY id DESC LIMIT 1`, 
                [reading.account_id]
            );

            let customerHistoryId = null;
            if (historyRows.length > 0) {
                customerHistoryId = historyRows[0].id;
            } else {
                // Fallback: Create new history record if missing
                const [currentAccount] = await connection.query(`SELECT * FROM water_customer_accounts WHERE id = ?`, [reading.account_id]);
                if(currentAccount.length > 0) {
                    const acc = currentAccount[0];
                    const [newHistory] = await connection.query(`
                        INSERT INTO water_customer_history 
                        (customer_id, connection_type, is_samurdhi, is_metered, status, created_at)
                        VALUES (?, ?, ?, ?, 'Active', NOW())
                    `, [acc.id, acc.connection_type, acc.is_samurdhi, acc.is_metered]);
                    customerHistoryId = newHistory.insertId;
                } else {
                     throw new Error(`Account not found for ID: ${reading.account_id}`);
                }
            }

            // =========================================================
            // 🟢 STEP 2: Save Meter Reading
            // =========================================================
            const readingInsertQuery = `
                INSERT INTO water_meter_readings 
                (account_id, sabha_code, bill_number, project_code, reading_date, year, month, previous_reading, current_reading, reader_id, reading_source, reading_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const safePreviousReading = reading.previous_reading !== undefined ? reading.previous_reading : 0;
            const safeReadingSource = reading.reading_source || 'Manual';
            const safeReaderId = reading.reader_id || 0; 
            const readingStatus = 1;

            const [readingResult] = await connection.query(readingInsertQuery, [
                reading.account_id,
                reading.sabha_code,       
                reading.bill_number_ref,  
                reading.project_code,     
                reading.reading_date,
                reading.year,
                reading.month,
                safePreviousReading,
                reading.current_reading,
                safeReaderId,             
                safeReadingSource,
                readingStatus             
            ]);

            const newReadingId = readingResult.insertId;

                        // =========================================================
            // 🟢 STEP 2.5: Fetch Data for SMS and Billing Calculations
            // =========================================================

            // 1. Account Table එකෙන්: Current Balance (Before Update), Status, Name, Mobile Number සහ New Bill Number
            const [customerAccountInfo] = await connection.query(
                `SELECT current_balance, status, contact_info AS mobile_number, full_name, new_bill_number 
                FROM water_customer_accounts 
                WHERE id = ?`,
                [reading.account_id]
            );

            let balanceBeforeUpdate = 0;
            let customerMobile = null;
            let customerName = 'Valued Customer';
            let accountStatus = 'Unknown';
            let newBillNumber = 'N/A';

            if (customerAccountInfo.length > 0) {
                balanceBeforeUpdate = parseFloat(customerAccountInfo[0].current_balance) || 0;
                accountStatus = (customerAccountInfo[0].status == 1) ? 'Active' : 'Inactive';
                customerMobile = customerAccountInfo[0].mobile_number;
                const rawName = customerAccountInfo[0].full_name || 'Valued Customer';
                customerName = rawName
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                newBillNumber = customerAccountInfo[0].new_bill_number;
            }

            //bil year and month

            const billYear = reading.year;
            const billMonth = reading.month;

            // 3. Water Bills Table (or Payments Table) එකෙන්: අවසන් වරට ගෙවූ මුදල සහ දිනය (Pending නොවන)
            // * මෙහිදී උපකල්පනය කරන්නේ payments යාවත්කාලීන වන්නේ water_bills table එකේ paid_amount / paid_date හරහා බවයි.
            const [lastPaymentInfo] = await connection.query(
                `SELECT total_amount, paid_date, payment_status, paid_amount
                FROM water_bills 
                WHERE account_id = ? AND payment_status IN ('Paid', 'Partial') 
                ORDER BY paid_date DESC LIMIT 1`,
                [reading.account_id]
            );

            let lastPaymentAmount = 0;
            let lastPaymentDate = 'N/A';

            if (lastPaymentInfo.length > 0) {
                lastPaymentAmount = parseFloat(lastPaymentInfo[0].paid_amount) || 0; 
                
                
                // දිනය YYYY-MM-DD ලෙස සකස් කිරීම
                if (lastPaymentInfo[0].paid_date) {
                    lastPaymentDate = new Date(lastPaymentInfo[0].paid_date).toISOString().split('T')[0];
                }
            }

            // =========================================================
            // 🟢 STEP 3: Calculate Bill
            // =========================================================

            // ✅ Fetch Previous Dues AND Mobile Number (SMS සඳහා)
            const [customerAccount] = await connection.query(
                `SELECT current_balance, contact_info AS mobile_number
                FROM water_customer_accounts WHERE id = ?`,
                [reading.account_id]
            );

            let previous_dues = 0;

            if (customerAccount.length > 0) {
                if (customerAccount[0].current_balance) {
                    previous_dues = parseFloat(customerAccount[0].current_balance);
                }
                if (customerAccount[0].mobile_number) {
                    customerMobile = customerAccount[0].mobile_number;
                }
            }

            // Note: pass 'connection' instead of 'dbPromise' so calculateBill uses the same transaction context
            const billData = await calculateBill(connection, {
                current_reading: reading.current_reading,
                previous_reading: safePreviousReading,
                sabha_code: reading.sabha_code,     
                project_code: reading.project_code, 
                connection_type: accountType, 
                is_samurdhi: isSamurdhi,      
                is_metered: isMetered
            }, previous_dues);

            // Bill Number Generate
            const billNumber = `${reading.bill_number_ref}-${reading.year}-${reading.month}`;

            // =========================================================
            // 🟢 STEP 4: Save Bill
            // =========================================================
            let periodFrom;

            // 1. කලින් readings තිබේදැයි බැලීම
            const [previousReadings] = await connection.query(
                'SELECT reading_date FROM water_meter_readings WHERE account_id = ? ORDER BY reading_date DESC LIMIT 1 OFFSET 1',
                [reading.account_id]
            );

            if (previousReadings.length > 0) {
                periodFrom = previousReadings[0].reading_date;
            } else {
                // 2. පළමු කියවීම නම්
                const [customerRows] = await connection.query(
                    'SELECT customer_type, created_at, last_reading_date FROM water_customer_accounts WHERE id = ?',
                    [reading.account_id]
                );

                if (customerRows.length > 0) {
                    const customer = customerRows[0];
                    // .toLowerCase() භාවිතා කිරීමෙන් 'New Customer' හෝ 'new customer' යන දෙකම පරීක්ෂා කළ හැක
                    if (customer.customer_type && customer.customer_type.toLowerCase() === 'new customer') {
                        periodFrom = customer.created_at;
                    } else {
                        periodFrom = customer.last_reading_date;
                    }
                } else {
                    periodFrom = new Date(); 
                }
            }
            const getSLDate = (dateVal) => {
                if (!dateVal) return null;
                let d = new Date(dateVal);
                // ශ්‍රී ලංකාවේ වේලාව (UTC+5:30) නිසා ඇති වන පරතරය අතින් එකතු කරමු
                const offset = 5.5 * 60 * 60 * 1000; 
                const slDate = new Date(d.getTime() + offset);
                return slDate.toISOString().split('T')[0];
            };

            // දින ආකෘතිය YYYY-MM-DD ලෙස සකස් කිරීම (වැදගත්)
            let formattedPeriodFrom = getSLDate(periodFrom);
            let formattedPeriodTo = getSLDate(reading.reading_date);

            const billInsertQuery = `
                INSERT INTO water_bills 
                (account_id, customer_history_id, tariff_id, bill_number, reading_id, sabha_code, billing_date, period_from, period_to, 
                 previous_reading, current_reading, units_consumed, water_consumption_charge, fixed_charge, 
                 monthly_charge, other_charges, discounts, previous_dues, total_amount, payment_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            `;

            await connection.query(billInsertQuery, [
                reading.account_id,
                customerHistoryId, 
                billData.applied_config_id, 
                billNumber,
                newReadingId,
                reading.sabha_code,
                formattedPeriodFrom, 
                formattedPeriodTo,   
                safePreviousReading,
                reading.current_reading,
                billData.units_consumed,
                billData.water_consumption_charge,
                billData.fixed_charge,
                billData.monthly_charge,
                billData.other_charges,
                billData.discounts,
                billData.previous_dues,
                billData.total_amount, 
            ]);

            await connection.query(
                `UPDATE water_customer_accounts SET current_balance = ? WHERE id = ?`,
                [billData.total_amount, reading.account_id]
            );

            // ✅ SMS යැවීම සඳහා දත්ත එකතු කර ගැනීම (Queue)
            // Transaction එක මැද SMS යැවීමෙන් වළකින්න. එය Fail වුවහොත් Rollback වන නිසා
            formattedPeriodFrom = new Date(formattedPeriodFrom).toISOString().split('T')[0];
            formattedPeriodTo = new Date(formattedPeriodTo).toISOString().split('T')[0];


            if (customerMobile) {
    smsQueue.push({
        sabha_code: reading.sabha_code,
        mobile: customerMobile,
        message: 
`WATER BILL - ${reading.sabha_code}\n` +
`Bill Ref : ${billYear}/${billMonth}\n` +
`A/C No : ${newBillNumber}\n` +
`${customerName}\n\n` +

`Balance B/F (Rs) : ${balanceBeforeUpdate.toFixed(2)}\n` +
`Last payment (Rs) : ${lastPaymentAmount.toFixed(2)}\n` +
`Last payment Date : ${lastPaymentDate}\n\n` +
//`Dues Previous (Rs) : ${balanceBeforeUpdate.toFixed(2)}\n\n` + 


`Status : ${accountStatus}\n` +
`Period : ${formattedPeriodFrom} to ${formattedPeriodTo}\n` +
`Consumption : ${reading.current_reading} - ${safePreviousReading} = ${billData.units_consumed} units\n` +
`Water Charge (Rs) : ${parseFloat(billData.water_consumption_charge).toFixed(2)}\n` +
`Monthly Charges : Rs. ${parseFloat(billData.monthly_charge).toFixed(2)}\n` +
`Total Due : Rs. ${parseFloat(billData.total_amount).toFixed(2)}\n\n` +

`Please settle within 14 days !.\n` +
`For any queries please contact ${reading.sabha_code} Water Board\n`+
'Thank you!'
    });
}

            processedCount++;
        }

        await connection.commit();
        
        // ✅ Transaction එක සාර්ථක වූ පසු SMS යැවීම ආරම්භ කිරීම
        // මෙය Background එකේ සිදුවන නිසා Response එක ප්‍රමාද නොවේ.
        if (smsQueue.length > 0) {
            processSMSQueue(smsQueue); 
        }

        res.json({ 
            status: 'success', 
            message: `Successfully saved ${processedCount} readings/bills.`,
            data: { insertedCount: processedCount } 
        });

    } catch (error) {
        if (connection) {
            try { await connection.rollback(); } catch (e) {}
        }
        console.error('Error saving batch:', error.message);
        res.status(500).json({ status: 'error', message: 'Transaction failed: ' + error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// ✅ Helper Function: SMS Queue එක Process කිරීම
async function processSMSQueue(queue) {
    console.log(`Starting to send ${queue.length} SMS messages...`);
    for (const item of queue) {
        try {
            // දුරකථන අංකය format කිරීම (071... -> 9471...)
            let formattedMobile = String(item.mobile).trim();
            if (formattedMobile.startsWith('0')) {
                formattedMobile = '94' + formattedMobile.substring(1);
            }

            console.log(`[SMS DEBUG] Sending to ${formattedMobile}`);

            // මෙහිදී await භාවිතා කිරීම වඩාත් සුදුසුයි loop එකක් ඇතුළේදී logs බලාගැනීමට
            const result = await sendMobitelSMS(item.sabha_code, formattedMobile, item.message);
            console.log(`SMS Sent Success for ${formattedMobile}:`, result);
            
        } catch (error) {
            console.error(`Failed to send SMS to ${item.mobile}:`, error.message);
        }
    }
}

// 3. Get Project Codes
export const getProjectCodesController = async (req, res) => {
    try {
        const { sabha_code } = req.query;
        if (!sabha_code) return res.status(400).json({ status: 'error', message: 'Missing sabha_code' });
        
        const projects = await getProjectCodes(sabha_code);
        res.json({ status: 'success', data: projects });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const generateUnmeteredBills = async (req, res) => {
    const connection = await db.getConnection();
    let generatedCount = 0;
    const smsQueue = []; // ✅ SMS එකතු කර ගැනීමට Queue එකක්
    
    const { sabha_code, project_code } = req.body;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    try {
        await connection.beginTransaction();

        // 1. පාරිභෝගිකයන් තෝරා ගැනීම (Customer details සහ Mobile number එකත් සමඟ)
        const [unmeteredCustomers] = await connection.query(`
            SELECT 
                c.id as account_id, c.sabha_code, c.project_code, 
                c.connection_type, c.is_samurdhi, c.is_metered,
                c.new_bill_number, c.current_balance, c.last_reading_date,
                c.created_at, c.full_name, c.contact_info as mobile_number,c.status,
                ch.id as customer_history_id
            FROM water_customer_accounts c
            LEFT JOIN water_customer_history ch ON c.id = ch.customer_id AND ch.is_active = 1
            WHERE c.is_metered = 0 
            AND c.status = 1 
            AND c.sabha_code = ? 
            AND (c.project_code <=> ?)
        `, [sabha_code, project_code]);

        if (unmeteredCustomers.length === 0) {
            await connection.rollback();
            return res.json({ status: 'success', message: 'No unmetered customers found for the selection.' });
        }

        for (const customer of unmeteredCustomers) {
            // 2. Duplicate Check
            const [existingBill] = await connection.query(
                `SELECT id FROM water_bills 
                 WHERE account_id = ? AND YEAR(billing_date) = ? AND MONTH(billing_date) = ?`,
                [customer.account_id, currentYear, currentMonth]
            );

            if (existingBill.length > 0) continue;

            // 3. Bill Calculation
            const billData = await calculateBill(connection, {
                current_reading: 0,
                previous_reading: 0, 
                sabha_code: customer.sabha_code,
                project_code: customer.project_code,
                connection_type: customer.connection_type,
                is_samurdhi: customer.is_samurdhi,
                is_metered: customer.is_metered
            }, parseFloat(customer.current_balance || 0));

            const billNumber = `${customer.new_bill_number}-${currentYear}-${currentMonth}`;
            
            const formattedPeriodFrom = new Date(customer.last_reading_date || customer.created_at).toISOString().slice(0, 10);
            const formattedPeriodTo = new Date().toISOString().slice(0, 10);

            // 5. Insert Bill
            const billInsertQuery = `
                INSERT INTO water_bills 
                (account_id, customer_history_id, tariff_id, bill_number, sabha_code, billing_date, period_from, period_to, 
                 previous_reading, current_reading, units_consumed, water_consumption_charge, fixed_charge, 
                 monthly_charge, other_charges, discounts, previous_dues, total_amount, payment_status, created_at)
                VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            `;

            await connection.query(billInsertQuery, [
                customer.account_id,
                customer.customer_history_id,
                billData.applied_config_id,
                billNumber,
                customer.sabha_code,
                formattedPeriodFrom,
                formattedPeriodTo,
                billData.fixed_charge,
                billData.monthly_charge,
                billData.other_charges,
                billData.discounts,
                billData.previous_dues,
                billData.total_amount
            ]);

            // 6. Update Customer Balance
            await connection.query(
                `UPDATE water_customer_accounts SET current_balance = ?, last_reading_date = NOW() WHERE id = ?`,
                [billData.total_amount, customer.account_id]
            );

            // 7. ✅ SMS දත්ත Queue එකට එකතු කිරීම
// ... (Insert Bill සහ Update Balance පියවර වලින් පසුව)

// 7. ✅ SMS දත්ත Queue එකට එකතු කිරීම
if (customer.mobile_number) {
    // නම Format කිරීම (Capitalize)
    const customerName = (customer.full_name || 'Valued Customer')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // පාරිභෝගිකයාගේ තත්වය (Status) - පළමු function එකේ භාවිතා කළ ආකාරයටම
    const accountStatus = (customer.status == 1) ? 'Active' : 'Inactive';

    // 🔴 අවසන් ගෙවීම් විස්තර ලබා ගැනීම
    // පළමු function එකේ ආකාරයටම 'Paid' හෝ 'Partial' බිල්පත් වලින් අවසන් ගෙවීම ලබා ගනී
    const [lastPaymentInfo] = await connection.query(
        `SELECT paid_amount, paid_date 
         FROM water_bills 
         WHERE account_id = ? AND payment_status IN ('Paid', 'Partial') 
         ORDER BY paid_date DESC LIMIT 1`,
        [customer.account_id]
    );

    let lastPaymentAmount = 0;
    let lastPaymentDate = 'N/A';
    if (lastPaymentInfo.length > 0) {
        lastPaymentAmount = parseFloat(lastPaymentInfo[0].paid_amount) || 0;
        lastPaymentDate = new Date(lastPaymentInfo[0].paid_date).toISOString().split('T')[0];
    }

    // දින නිවැරදිව format කිරීම (ISO String හරහා YYYY-MM-DD ලබා ගැනීම)
    const finalPeriodFrom = new Date(formattedPeriodFrom).toISOString().split('T')[0];
    const finalPeriodTo = new Date(formattedPeriodTo).toISOString().split('T')[0];

    smsQueue.push({
        sabha_code: customer.sabha_code,
        mobile: customer.mobile_number,
        message: 
            `WATER BILL - ${customer.sabha_code}\n` +
            `Bill Ref : ${currentYear}/${currentMonth}\n` +
            `A/C No : ${customer.new_bill_number}\n` +
            `${customerName}\n\n` +

            // Balance Before Update: මෙය පාරිභෝගිකයාගේ පෙර පැවති ශේෂයයි
            `Balance B/F (Rs) : ${parseFloat(customer.current_balance || 0).toFixed(2)}\n` +
            `Last payment (Rs) : ${lastPaymentAmount.toFixed(2)}\n` +
            `Last payment Date : ${lastPaymentDate}\n\n` +

            `Status : ${accountStatus}\n` +
            `Period : ${finalPeriodFrom} to ${finalPeriodTo}\n` +
            // Unmetered නිසා Consumption පේළිය මෙතනට අවශ්‍ය නොවේ (0 units බැවින්)
            `Monthly Charges : Rs. ${parseFloat(billData.monthly_charge).toFixed(2)}\n` +
            `Total Due : Rs. ${parseFloat(billData.total_amount).toFixed(2)}\n\n` +

            `Please settle within 14 days !.\n` +
            `For any queries please contact ${customer.sabha_code} Water Board\n` +
            `Thank you!`
    });
}

            generatedCount++;
        }

        await connection.commit();

        // 8. ✅ Transaction එක සාර්ථක නම් පමණක් SMS යැවීම ආරම්භ කරන්න
        if (smsQueue.length > 0) {
            processSMSQueue(smsQueue); 
        }

        res.json({ 
            status: 'success', 
            message: `Successfully generated ${generatedCount} automated bills.`,
            data: { generatedCount }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Automated Billing Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    } finally {
        if (connection) connection.release();
    }
};