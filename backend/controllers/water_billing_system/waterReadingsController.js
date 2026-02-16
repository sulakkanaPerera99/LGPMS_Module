import db from '../../config/database.js'; 
import { getPendingCustomers, getProjectCodes } from '../../models/water_Billing_System/waterReadingsModel.js';
import { calculateBill } from '../../utils/BillCalculator.js'; 

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
    // Note: 'db' is already a promise pool, so we don't need db.promise()
    // We get a dedicated connection for the transaction.
    const connection = await db.getConnection();

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
            // 🟢 STEP 3: Calculate Bill
            // =========================================================

            // Fetch Previous Dues
            const [customerAccount] = await connection.query(
                `SELECT current_balance FROM water_customer_accounts WHERE id = ?`,
                [reading.account_id]
            );

            let previous_dues = 0;
            if (customerAccount.length > 0 && customerAccount[0].current_balance) {
                previous_dues = parseFloat(customerAccount[0].current_balance);
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

            const periodFrom = `${reading.year}-${reading.month}-01`;
            // Calculate last day of the month correctly
            const periodTo = new Date(reading.year, reading.month, 0).toISOString().split('T')[0];

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

            processedCount++;
        }

        await connection.commit();
        
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