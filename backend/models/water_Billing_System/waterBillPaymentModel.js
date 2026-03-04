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

        // 1. Search Logic (නම, NIC හෝ බිල්පත් අංකය අනුව සෙවීම)
        if (filters.search) {
            query += ` AND (a.full_name LIKE ? OR a.new_bill_number LIKE ? OR a.nic LIKE ?)`;
            const searchParam = `%${filters.search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // 2. Filter: Project Code
        if (filters.projectCode) {
            query += ` AND a.project_code = ?`;
            params.push(filters.projectCode);
        }

        // 3. Filter: Connection Types (උදා: 'Domestic,Commercial')
        if (filters.connectionTypes) {
            const types = filters.connectionTypes.split(',');
            query += ` AND a.connection_type IN (?)`;
            params.push(types);
        }

        // 4. Filter: Samurdhi Status ('Samurdhi' නම් 1, නැත්නම් 0 යැයි උපකල්පනය කර ඇත)
        if (filters.samurdhi) {
            const samurdhiValues = filters.samurdhi.split(',').map(val => val === 'Samurdhi' ? 1 : 0);
            query += ` AND a.is_samurdhi IN (?)`;
            params.push(samurdhiValues);
        }

        // 5. Filter: Metered Status
        if (filters.metered) {
            const meteredValues = filters.metered.split(',').map(val => val === 'Metered' ? 1 : 0);
            query += ` AND a.is_metered IN (?)`;
            params.push(meteredValues);
        }

        // 6. Sort Logic (තෝරාගත් අනුපිළිවෙළට පෙළගැස්වීම)
        if (filters.sort) {
            switch (filters.sort) {
                case 'name_desc':
                    query += ` ORDER BY a.full_name DESC`;
                    break;
                case 'bill_asc':
                    query += ` ORDER BY a.new_bill_number ASC`;
                    break;
                case 'bill_desc':
                    query += ` ORDER BY a.new_bill_number DESC`;
                    break;
                case 'name_asc':
                default:
                    query += ` ORDER BY a.full_name ASC`;
                    break;
            }
        } else {
            // Default Sorting
            query += ` ORDER BY a.full_name ASC`;
        }

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
            SELECT bill_number, monthly_charge, paid_amount, (total_amount - paid_amount) as due_amount, billing_date
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

export const fetchTempInvoicesBySubNIC = async (sub_nic) => {
    try {
        const query = `
            SELECT cus_name, cus_nic, amount 
            FROM tempory_invoice 
            WHERE sub_nic = ?
        `;
        const [rows] = await db.query(query, [sub_nic]);
        return rows;
    } catch (error) {
        console.error("Database Error in fetchTempInvoicesBySubNIC:", error);
        throw error;
    }
};

export const deleteTempInvoiceModel = async (sub_nic, cus_nic) => {
    try {
        const query = `DELETE FROM tempory_invoice WHERE sub_nic = ? AND cus_nic = ?`;
        const [result] = await db.query(query, [sub_nic, cus_nic]);
        return result;
    } catch (error) {
        console.error("Database Error in deleteTempInvoiceModel:", error);
        throw error;
    }
};