import db from '../../config/database.js';

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