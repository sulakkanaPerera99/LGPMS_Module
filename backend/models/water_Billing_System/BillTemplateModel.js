import db from "../../config/database.js";

// ID එක මගින් බිල්පතේ විස්තර ලබා ගැනීම (For Bill Template)
export const getBillById = (billId) => {
    return new Promise((resolve, reject) => {
        // Controller එකට අවශ්‍ය සියලුම දත්ත මෙතනින් Select කර ඇත.
        const query = `
            SELECT 
                wb.id, 
                wb.bill_number,
                
                -- Account Details
                wa.new_bill_number AS account_no, -- Customer Account Number එක
                
                -- Dates
                wb.billing_date,
                wb.period_from AS period_from,    -- DB column එක start_date විය හැක
                wb.period_to AS period_to,        -- DB column එක end_date විය හැක

                -- Customer Details (From History or Accounts)
                -- Customer History එකෙන් හෝ Accounts Table එකෙන් නම ගන්න
                COALESCE(ch.full_name, wa.full_name) AS full_name, 
                COALESCE(ch.nic, wa.nic) AS nic,
                wa.mailing_address AS address,

                -- Meter Readings
                wb.previous_reading,
                wb.current_reading,
                wb.units_consumed AS units_consumed,      -- DB Column: units
                
                -- Charges Breakdown
                wb.monthly_charge AS water_consumption_charge, 
                wb.fixed_charge,

                -- Other Financials
                wb.other_charges,
                wb.discounts AS discounts, 
                wb.previous_dues AS previous_dues,     -- DB Column: arrears (හිඟ මුදල්)


                -- Final Totals
                wb.total_amount,
                wb.payment_status AS payment_status      -- DB Column: status

            FROM water_bills wb
            LEFT JOIN water_customer_accounts wa ON wb.account_id = wa.id
            LEFT JOIN water_customer_history ch ON wb.customer_history_id = ch.id
            
          
            WHERE wb.account_id = ? ORDER BY wb.created_at DESC LIMIT 1
        `;

        db.query(query, [billId], (err, result) => {
            if (err) {
                return reject(err);
            }
            // Result එකක් නැත්නම් null යවන්න, එවිට Controller එකේ 404 හසු කරගත හැක
            resolve(result[0] || null); 
        });
    });
};