import db from '../../config/database.js';

// Fetch bill details by ID
export const getBillById = async (connection, billId) => {
    const query = `
        SELECT id, tariff_id, total_amount, paid_amount, payment_status 
        FROM water_bills 
        WHERE id = ?
    `;
    const [rows] = await connection.execute(query, [billId]);
    return rows[0];
};

// Fetch discount configuration by Tariff ID
export const getDiscountByTariff = async (connection, tariffId) => {
    const query = `
        SELECT discounts 
        FROM billing_configurations 
        WHERE id = ?
    `;
    const [rows] = await connection.execute(query, [tariffId]);
    return rows[0];
};

// Update water_bills table
export const updateBillPayment = async (connection, billId, paidAmount, paymentStatus, discountAmount) => {
    const query = `
        UPDATE water_bills 
        SET paid_amount = ?, 
            payment_status = ?, 
            discounts = ?, 
            paid_date = NOW() 
        WHERE id = ?
    `;
    await connection.execute(query, [paidAmount, paymentStatus, discountAmount, billId]);
};

// Update water_customer_accounts table
export const updateCustomerBalance = async (connection, accountId, newBalance) => {
    const query = `
        UPDATE water_customer_accounts 
        SET current_balance = ? 
        WHERE id = ?
    `;
    await connection.execute(query, [newBalance, accountId]);
};
