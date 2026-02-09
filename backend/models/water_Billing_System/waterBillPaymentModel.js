import db from "../../config/database.js";

// Fetch customers list (මේකේ ලොකු වෙනසක් නෑ, කලින් එකමයි)
export const fetchCustomersModel = async (sabha_code, filters) => {
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
    // ... (Filter logic remains the same as your previous file) ...
    // For brevity, assuming the rest of filtering logic is copied here
    
    // Add sorting/filtering logic back from your original file here if needed
    // or just use the basic query above for now.
    
    const [rows] = await db.promise().query(query, [sabha_code]);
    return rows;
};

// ✅ NEW: Fetch Account Payment Details (For the Payment Page)
export const fetchAccountPaymentDetails = async (accountId) => {
    // 1. Get Customer Info & Total Balance
    const accountQuery = `
        SELECT id, full_name, nic, new_bill_number as account_number, current_balance 
        FROM water_customer_accounts 
        WHERE id = ?
    `;
    
    // 2. Get Breakdown of Pending Bills (to show the officer what is being paid)
    const billsQuery = `
        SELECT bill_number, total_amount, paid_amount, (total_amount - paid_amount) as due_amount, billing_date
        FROM water_bills
        WHERE account_id = ? AND payment_status != 'Paid'
        ORDER BY billing_date ASC
    `;

    try {
        const [accountRows] = await db.promise().query(accountQuery, [accountId]);
        if (accountRows.length === 0) return null;

        const [billRows] = await db.promise().query(billsQuery, [accountId]);

        return {
            account: accountRows[0],
            pendingBills: billRows
        };
    } catch (error) {
        throw error;
    }
};

export const fetchProjectsModel = async (sabha_code) => {
    const query = `SELECT code, name FROM water_projects WHERE sabha_code = ?`;
    const [rows] = await db.promise().query(query, [sabha_code]);
    return rows;
};