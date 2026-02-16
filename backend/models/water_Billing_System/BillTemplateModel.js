import db from "../../config/database.js";

/**
 * Retrieves detailed information for a specific water bill by its ID.
 * Joins with customer accounts, history, and pra_sabha tables to get comprehensive data for printing.
 * * @param {number} billId - The unique ID of the water bill.
 * @returns {Promise<Object|null>} - Returns the bill details object or null if not found.
 */
export const getBillById = async (billId) => {
    try {
        const query = `
            SELECT 
                wb.id, 
                wb.bill_number,
                wa.new_bill_number AS account_no,
                wb.billing_date,
                wb.period_from,
                wb.period_to,
                
                -- Customer Details (Prioritizing history record if available)
                COALESCE(ch.full_name, wa.full_name) AS full_name, 
                COALESCE(ch.nic, wa.nic) AS nic,
                wa.mailing_address AS address,

                -- Meter Readings
                wb.previous_reading,
                wb.current_reading,
                wb.units_consumed,
                
                -- Charges
                wb.water_consumption_charge, 
                wb.fixed_charge,
                wb.monthly_charge,
                wb.other_charges,
                wb.discounts, 
                wb.previous_dues,
                wb.total_amount,
                wb.payment_status,

                -- Sabha Details
                ps.sb_name_en,
                ps.sb_address,
                ps.sb_contact,
                ps.fax,
                ps.sb_email

            FROM water_bills wb
            LEFT JOIN water_customer_accounts wa ON wb.account_id = wa.id
            LEFT JOIN water_customer_history ch ON wb.customer_history_id = ch.id
            LEFT JOIN pra_sabha ps ON wb.sabha_code = ps.sb_code
            
            WHERE wb.id = ? 
        `;

        // Executing query using the promise-based pool
        const [rows] = await db.query(query, [billId]);
        
        // Return the first record or null if no match found
        return rows[0] || null;

    } catch (error) {
        console.error("Database Error in getBillById:", error);
        throw error;
    }
};

/**
 * Retrieves the last 12 bills for a specific customer account.
 * Useful for displaying bill history in the selection modal.
 * * @param {number} accountId - The unique ID of the customer account.
 * @returns {Promise<Array>} - Returns an array of the last 12 bill objects.
 */
export const getLastTwelveBills = async (accountId) => {
    try {
        const query = `
            SELECT 
                id, 
                bill_number, 
                billing_date, 
                period_from, 
                period_to, 
                monthly_charge,
                payment_status
            FROM water_bills 
            WHERE account_id = ? 
            ORDER BY billing_date DESC 
            LIMIT 12
        `;

        const [rows] = await db.query(query, [accountId]);
        return rows;

    } catch (error) {
        console.error("Database Error in getLastTwelveBills:", error);
        throw error;
    }
};