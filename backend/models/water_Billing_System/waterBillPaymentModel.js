import db from "../../config/database.js";

/**
 * Fetches a list of active water customers for a specific Sabha.
 * * @param {string} sabha_code - The unique code of the Sabha.
 * @param {Object} filters - Optional query parameters for filtering (search, etc.).
 * @returns {Promise<Array>} - Returns an array of customer objects.
 */
export const fetchCustomersModel = async (sabha_code, filters) => {
    try {
        let query = `
            SELECT 
                a.id, 
                a.new_bill_number AS newBillNumber, 
                a.full_name AS fullName, 
                a.current_balance AS accountBalance
            FROM 
                water_customer_accounts a
            WHERE 
                a.sabha_code = ? 
                AND a.status = 1
        `;
        
        const params = [sabha_code];

        // Note: Logic to handle 'filters.search' can be appended here if required in the future.
        // For now, we order by name for better readability.
        query += ` ORDER BY a.full_name ASC`;

        // Executing query directly on the promise-based pool
        const [rows] = await db.query(query, params);
        return rows;

    } catch (error) {
        console.error("Database Error in fetchCustomersModel:", error);
        throw error;
    }
};

/**
 * Fetches detailed account information and pending bills for the payment page.
 * * @param {number} accountId - The primary key ID of the customer account.
 * @returns {Promise<Object|null>} - Returns an object containing account details and pending bills, or null if not found.
 */
export const fetchAccountPaymentDetails = async (accountId) => {
    try {
        // 1. Query to get Customer Basic Info & Total Balance
        const accountQuery = `
            SELECT id, full_name, nic, new_bill_number as account_number, current_balance 
            FROM water_customer_accounts 
            WHERE id = ?
        `;
        
        // 2. Query to get Breakdown of Pending/Partial Bills
        const billsQuery = `
            SELECT bill_number, total_amount, paid_amount, (total_amount - paid_amount) as due_amount, billing_date
            FROM water_bills
            WHERE account_id = ? AND payment_status != 'Paid'
            ORDER BY billing_date ASC
        `;

        // Execute Account Query
        const [accountRows] = await db.query(accountQuery, [accountId]);

        // If account does not exist, return null immediately
        if (accountRows.length === 0) return null;

        // Execute Bills Query
        const [billRows] = await db.query(billsQuery, [accountId]);

        // Return structured data
        return {
            account: accountRows[0],
            pendingBills: billRows
        };

    } catch (error) {
        console.error("Database Error in fetchAccountPaymentDetails:", error);
        throw error;
    }
};

/**
 * Fetches a list of Water Projects associated with a Sabha.
 * * @param {string} sabha_code - The unique code of the Sabha.
 * @returns {Promise<Array>} - Returns an array of project codes and names.
 */
export const fetchProjectsModel = async (sabha_code) => {
    try {
        const query = `SELECT code, name FROM water_projects WHERE sabha_code = ?`;
        const [rows] = await db.query(query, [sabha_code]);
        return rows;
    } catch (error) {
        console.error("Database Error in fetchProjectsModel:", error);
        throw error;
    }
};