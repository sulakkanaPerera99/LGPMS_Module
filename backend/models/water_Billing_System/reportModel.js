import db from '../../config/database.js';

export const getProjectCollectionReportModel = (sabhaCode, callback) => {
    const query = `
        SELECT 
            p.name AS project_name,
            p.code AS project_code,
            p.number AS project_number,
            
            -- 1. Users Count
            (
                SELECT COUNT(*) 
                FROM water_customer_accounts wca 
                WHERE wca.project_code = p.code 
                AND wca.sabha_code = p.sabha_code
            ) AS number_of_users,

            -- 2. Total Amount to Collect
            -- Bill No එකේ 4,5 ඉලක්කම් (SUBSTRING) Project Number එකට සමානද බලයි
            (
                SELECT COALESCE(SUM(wb.total_amount), 0) 
                FROM water_bills wb 
                WHERE wb.sabha_code = p.sabha_code
                AND CAST(SUBSTRING(wb.bill_number, 4, 2) AS UNSIGNED) = p.number
            ) AS total_amount_to_collect,

            -- 3. Collected Amount
            (
                SELECT COALESCE(SUM(wb.paid_amount), 0) 
                FROM water_bills wb 
                WHERE wb.sabha_code = p.sabha_code
                AND CAST(SUBSTRING(wb.bill_number, 4, 2) AS UNSIGNED) = p.number
            ) AS collected_amount

        FROM water_projects p
        WHERE p.sabha_code = ?
    `;

    db.query(query, [sabhaCode], (err, results) => {
        if (err) {
            console.error("SQL Error in Report Model:", err); // Error එක Terminal එකේ පෙන්වයි
            return callback(err, null);
        }
        return callback(null, results);
    });
};