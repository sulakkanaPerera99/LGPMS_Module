import db from '../../config/database.js'; 
import { getPendingCustomers, getProjectCodes } from '../../models/water_Billing_System/waterReadingsModel.js';
import { calculateBill } from '../../utils/BillCalculator.js'; 
import { sendMobitelSMS } from '../../utils/mobitelSmsService.js'; // ✅ SMS Service එක Import කළා

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
            const billNumber = `${reading.bill_number_ref}/${reading.year}/${reading.month}`;

            // =========================================================
            // 🟢 STEP 4: Save Bill
            // =========================================================
            const billInsertQuery = `
                INSERT INTO water_bills 
                (account_id, customer_history_id, tariff_id, bill_number, reading_id, sabha_code, billing_date, period_from, period_to, 
                 previous_reading, current_reading, units_consumed, water_consumption_charge, fixed_charge, 
                 monthly_charge, other_charges, discounts, previous_dues, total_amount, payment_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            `;

            // 1. මේ account එකට අදාළව දැනටමත් readings තියෙනවද බලන්න query එකක්
            const [previousReadings] = await connection.query(
                'SELECT reading_date FROM water_meter_readings WHERE account_id = ? ORDER BY reading_date DESC LIMIT 1',
                [reading.account_id]
            );

            let periodFrom;

            if (previousReadings.length > 0) {
                // 2. දැනටමත් readings තිබේ නම්: අවසන් කියවීමේ දිනය (reading_date) ගමු
                periodFrom = previousReadings[0].reading_date;
            } else {
                // 3. කිසිදු reading එකක් නැති පළමු වතාව නම්: 
                // water_customer_accounts table එකෙන් last_reading_date එක ගමු
                const [customer] = await connection.query(
                    'SELECT last_reading_date FROM water_customer_accounts WHERE id = ?',
                    [reading.account_id]
                );
                
                // පාරිභෝගිකයාගේ last_reading_date එක පාවිච්චි කරනවා
                periodFrom = customer[0].last_reading_date;
            }

            // periodTo එක කියවන දිනය (current reading date) ලෙස ගමු
            const periodTo = reading.reading_date;

            await connection.query(billInsertQuery, [
                reading.account_id,
                customerHistoryId, 
                billData.applied_config_id, 
                billNumber,
                newReadingId,
                reading.sabha_code,
                periodFrom,
                periodTo,
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
            const formattedPeriodFrom = new Date(periodFrom).toISOString().split('T')[0];
            const formattedPeriodTo = new Date(periodTo).toISOString().split('T')[0];


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