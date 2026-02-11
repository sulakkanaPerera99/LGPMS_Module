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
    // මේ Table එක ඔයාගේ DB එකේ තියෙනවා නම් විතරක් මේක පාවිච්චි කරන්න
    // await connection.execute(query, [accountId, amount, type]);
};
*/

import db from '../../config/database.js';

// 1. Get Customer Details by Account ID
// tempory_invoice එක පුරවන්න ඕන කරන විස්තර ටික මෙතනින් ගන්නවා.
// ඔයාගේ customer table එකේ column names (nic_number, full_name etc.) හරියටම බලලා වෙනස් කරගන්න.
// 1. Get Customer Details by Account ID
export const getCustomerDetails = async (accountId) => {
    const query = `
        SELECT 
            w.sabha_code,
            w.nic AS nic_number,
            w.full_name,
            w.contact_info AS contact_no,
            w.mailing_address AS address,
            
            -- ✅ මෙන්න වෙනස් කරපු කොටස (Subquery)
            (
                SELECT sb_rate_head 
                FROM sb_rates_new 
                WHERE sb_rate_head_name = 'water bills' 
                AND rate_sb_code = w.sabha_code -- සභා කෝඩ් එක ගැලපෙන එක විතරක් ගන්න
                LIMIT 1
            ) AS rate_head

        FROM water_customer_accounts w
        WHERE w.id = ? OR w.sabha_customer_id = ?
    `;

    const [rows] = await db.promise().execute(query, [accountId, accountId]);
    return rows[0];
};

// 2. Save to tempory_invoice table
export const saveTemporaryInvoice = async (data) => {
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
        data.sabha_code,
        data.cus_nic,
        data.cus_name,
        data.cus_contact,
        data.cus_address,
        data.sb_rate_head,
        data.description,
        data.amount,
        data.stamp,             // 0
        data.discount,          // 0
        data.shoptotalarrears,  // 0
        data.paymonth,
        data.vat,               // 0
        data.shopdid,           // 0
        data.sub_nic
    ];

    const [result] = await db.promise().execute(query, params);
    return result;
};