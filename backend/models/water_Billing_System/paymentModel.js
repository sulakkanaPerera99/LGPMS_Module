/*import db from '../../config/database.js';

// 1. Get all pending bills for an account (Oldest First) - FIFO Logic
export const getPendingBillsByAccount = async (connection, accountId) => {
    const query = `
        SELECT id, total_amount, paid_amount, payment_status 
        FROM water_bills 
        WHERE account_id = ? 
        AND payment_status != 'Paid' 
        ORDER BY billing_date ASC, id ASC
    `;
    const [rows] = await connection.execute(query, [accountId]);
    return rows;
};

// 2. Update a specific bill (Paid Amount & Status)
export const updateBillPayment = async (connection, billId, newPaidAmount, newStatus) => {
    const query = `
        UPDATE water_bills 
        SET paid_amount = ?, 
            payment_status = ?, 
            paid_date = NOW() 
        WHERE id = ?
    `;
    await connection.execute(query, [newPaidAmount, newStatus, billId]);
};

// 3. Update Customer Master Balance
// Industrial Standard: Balance decreases when payment is made
export const updateCustomerBalance = async (connection, accountId, paymentAmount) => {
    // We deduct the payment amount from the current balance
    const query = `
        UPDATE water_customer_accounts 
        SET current_balance = current_balance - ? 
        WHERE id = ?
    `;
    await connection.execute(query, [paymentAmount, accountId]);
};

// 4. (Optional) Log the Transaction
export const logTransaction = async (connection, accountId, amount, type = 'PAYMENT') => {
    const query = `
        INSERT INTO payment_transactions (account_id, amount, transaction_type, date)
        VALUES (?, ?, ?, NOW())
    `;
    // await connection.execute(query, [accountId, amount, type]);
};
*/

//PIV එක ඇඩ් වෙන්නෙ මෙතනින්.//

import db from '../../config/database.js';

/**
 * Retrieves customer details including rate head information for payment processing.
 * Fetches basic info from 'water_customer_accounts' and the rate head from 'sb_rates_new' via a subquery.
 * * @param {number} accountId - The ID of the water customer account.
 * @returns {Promise<Object>} - Returns customer details object or undefined if not found.
 */
export const getCustomerDetails = async (accountId) => {
    try {
        const query = `
            SELECT 
                w.sabha_code,
                w.nic AS nic_number,
                w.full_name,
                w.contact_info AS contact_no,
                w.mailing_address AS address

            FROM water_customer_accounts w
            WHERE w.id = ? OR w.sabha_customer_id = ?
        `;

        

        // Execute query using the promise-based pool directly
        const [rows] = await db.query(query, [accountId, accountId]);
        return rows[0];

    } catch (error) {
        console.error("Database Error in getCustomerDetails:", error);
        throw error;
    }
};

/**
 * Saves payment transaction details to the 'tempory_invoice' table.
 * This table acts as a holding area before the final receipt is generated.
 * * @param {Object} data - The invoice data object containing customer and payment details.
 * @returns {Promise<Object>} - Returns the result of the insert operation (including insertId).
 */
// ✅ 1. නිලධාරියාට අදාළ Rate Heads ලබා ගැනීමේ Function එක
export const fetchEmpSbRates = async (sabha_code, emp_nic) => {
    try {
        const query = `
            SELECT iid, emp_sb_rates AS sb_rate_head
            FROM emp_sb_rates 
            WHERE emp_prs_code = ? 
            AND sb_emp_nic_main = ? 
            AND subjecttype = 'waterbill'
        `;
        const [rows] = await db.query(query, [sabha_code, emp_nic]);
        return rows;
    } catch (error) {
        console.error("Database Error in fetchEmpSbRates:", error);
        throw error;
    }
};

// ✅ 2. වෙන වෙනම Rate Heads සහ Amounts සහිතව Temporary Invoice එකට සේව් කිරීම
export const saveTemporaryInvoice = async (invoiceData) => {
    try {
        const query = `
            INSERT INTO tempory_invoice (
                sabha_code,
                cus_nic,
                cus_name,
                cus_contact,
                cus_address,
                sb_rate_head,
                description,
                amount,
                stamp,
                discount,
                shoptotalarrears,
                paymonth,
                vat,
                shopdid,
                date,
                sub_nic,
                date_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())
        `;

        const params = [
            invoiceData.sabha_code,
            invoiceData.cus_nic,
            invoiceData.cus_name,
            invoiceData.cus_contact,
            invoiceData.cus_address,
            invoiceData.sb_rate_head,    // ✅ ඩයිනමික් Rate Head එක
            invoiceData.description,     // ✅ 'Water Bill - Arrears' වැනි විස්තරයක්
            invoiceData.amount,          // ✅ බෙදී ගිය මුදල
            invoiceData.stamp || 0,
            invoiceData.discount || 0,
            invoiceData.shoptotalarrears || 0,
            invoiceData.paymonth,
            invoiceData.vat || 0,
            invoiceData.shopdid || 0,
            invoiceData.sub_nic
        ];

        const [result] = await db.query(query, params);
        return result;

    } catch (error) {
        console.error("Database Error in saveTemporaryInvoice:", error);
        throw error;
    }
};

