import db from "../../config/database.js";

export const getCustomerPaymentHistory = (accountId) => {
    return new Promise((resolve, reject) => {
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
                wb.previous_dues
            FROM water_customer_accounts wca
            LEFT JOIN water_bills wb ON wca.id = wb.account_id
            WHERE wca.id = ?
            ORDER BY wb.paid_date DESC
        `;

        db.query(query, [accountId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};
