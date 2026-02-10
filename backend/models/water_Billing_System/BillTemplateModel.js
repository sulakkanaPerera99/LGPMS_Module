import db from "../../config/database.js";

// 1. Get Specific Bill Details (For the Template) - (Existing Logic Improved)
export const getBillById = (billId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                wb.id, 
                wb.bill_number,
                wa.new_bill_number AS account_no,
                wb.billing_date,
                wb.period_from,
                wb.period_to,
                
                -- Customer Details
                COALESCE(ch.full_name, wa.full_name) AS full_name, 
                COALESCE(ch.nic, wa.nic) AS nic,
                wa.mailing_address AS address,

                -- Meter Readings
                wb.previous_reading,
                wb.current_reading,
                wb.units_consumed,
                
                -- Charges
                wb.water_consumption_charge, 
                wb.fixed_charge,
                wb.other_charges,
                wb.discounts, 
                wb.previous_dues,
                wb.total_amount,
                wb.payment_status,

                -- ✅ ADDED: Pradeshiya Sabha Details (From pra_sabha table)
                ps.sb_name_en,
                ps.sb_address,
                ps.sb_contact,
                ps.fax,
                ps.sb_email

            FROM water_bills wb
            LEFT JOIN water_customer_accounts wa ON wb.account_id = wa.id
            LEFT JOIN water_customer_history ch ON wb.customer_history_id = ch.id
            
            -- ✅ ADDED: Join with pra_sabha table using sabha_code
            LEFT JOIN pra_sabha ps ON wb.sabha_code = ps.sb_code
            
            WHERE wb.id = ? 
        `; // Note: Changed to WHERE wb.id = ? to select specific bill

        db.query(query, [billId], (err, result) => {
            if (err) return reject(err);
            resolve(result[0] || null); 
        });
    });
};

// ✅ 2. NEW: Get Last 12 Bills List (For the Selection Modal)
export const getLastTwelveBills = (accountId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                id, 
                bill_number, 
                billing_date, 
                period_from, 
                period_to, 
                monthly_charge,
                payment_status
            FROM water_bills 
            WHERE account_id = ? 
            ORDER BY billing_date DESC 
            LIMIT 12
        `;

        db.query(query, [accountId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};