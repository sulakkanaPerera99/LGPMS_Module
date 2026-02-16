import db from "../../config/database.js";

/**
 * Retrieves payment history and account details for a specific customer.
 * Uses a LEFT JOIN to fetch customer details even if no bill history exists.
 * * @param {string|number} accountId - The unique ID of the customer account.
 * @returns {Promise<Array>} - Returns an array of objects containing customer and bill details.
 */
export const getCustomerPaymentHistory = async (accountId) => {
    try {
        const query = `
            SELECT 
                wca.full_name, 
                wca.nic, 
                wca.new_bill_number,
                wca.mailing_address,
                wca.current_balance,
                wb.id AS bill_id,
                wb.total_amount, 
                wb.paid_amount, 
                wb.paid_date, 
                wb.previous_dues,
                wb.previous_reading,
                wb.current_reading,
                wb.units_consumed
            FROM water_customer_accounts wca
            LEFT JOIN water_bills wb ON wca.id = wb.account_id
            WHERE wca.id = ?
            ORDER BY wb.paid_date DESC
        `;

        // Execute the query using the promise-based pool
        const [results] = await db.query(query, [accountId]);
        return results;

    } catch (err) {
        console.error("Database Error in getCustomerPaymentHistory:", err);
        throw err;
    }
};