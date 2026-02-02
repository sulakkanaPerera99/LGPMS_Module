import db from '../../config/database.js';

// ... (getPaymentHistoryByAccountId function එක වෙනස් කිරීමට අවශ්‍ය නැත) ...

export const getPaymentHistoryByAccountId = async (accountId) => {
    const query = `
        SELECT 
            wb.id,
            wb.bill_number,
            wb.paid_date,
            wb.paid_amount,
            wb.total_amount,
            wb.payment_status,
            wca.full_name,
            (wb.total_amount - COALESCE(wb.paid_amount, 0)) AS remaining_due,
            wb.created_at
        FROM 
            water_bills wb
        JOIN 
            water_customer_accounts wca ON wb.account_id = wca.id
        WHERE 
            wb.account_id = ?
        ORDER BY 
            COALESCE(wb.paid_date, wb.created_at) DESC
    `;

    try {
        const [rows] = await db.promise().query(query, [accountId]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// ✅ Updated Search Function
export const getAccountIdBySearchTerm = async (term) => {
    try {
        // 1. Try to find by Account ID, NIC, or Customer Bill Number in customer table
        // මෙතන 'new_bill_number' කියන තැනට ඔබේ table එකේ අදාළ column name එක දාන්න.
        const customerQuery = `
            SELECT id 
            FROM water_customer_accounts 
            WHERE id = ? OR nic = ? OR new_bill_number = ? 
            LIMIT 1
        `;
        
        // term එක තුන් වරක් pass කරන්න ඕන (id, nic, bill_number සඳහා)
        const [customerRows] = await db.promise().query(customerQuery, [term, term, term]);
        
        if (customerRows.length > 0) return customerRows[0].id;

        // 2. Try to find by Specific Invoice Number in bills table (Optional - මේකත් තියෙන එක හොඳයි)
        const billQuery = `SELECT account_id FROM water_bills WHERE bill_number = ? LIMIT 1`;
        const [billRows] = await db.promise().query(billQuery, [term]);

        if (billRows.length > 0) return billRows[0].account_id;

        return null;
    } catch (error) {
        throw error;
    }
};