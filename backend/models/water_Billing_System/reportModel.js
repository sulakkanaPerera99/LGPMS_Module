import db from '../../config/database.js';

export const getProjectCollectionReportModel = (sabhaCode, callback) => {
    const query = `
        SELECT 
            p.name AS project_name,
            p.code AS project_code,
            p.number AS project_number,
            
            -- 1. Users Count (මෙය නිවැරදියි)
            (
                SELECT COUNT(*) 
                FROM water_customer_accounts wca 
                WHERE wca.project_code = p.code 
                AND wca.sabha_code = p.sabha_code
            ) AS number_of_users,

            -- 2. Total Amount to Collect (JOIN භාවිතා කර නිවැරදි කළා)
            -- Bill එක අයිති Account එක සොයාගෙන, ඒ Account එකේ Project Code එක බලයි
            (
                SELECT COALESCE(SUM(wb.total_amount), 0) 
                FROM water_bills wb 
                INNER JOIN water_customer_accounts wca ON wb.account_id = wca.id
                WHERE wca.sabha_code = p.sabha_code
                AND wca.project_code = p.code -- ✅ හරියටම Project එක Match වෙනවා
            ) AS total_amount_to_collect,

            -- 3. Collected Amount (JOIN භාවිතා කර නිවැරදි කළා)
            (
                SELECT COALESCE(SUM(wb.paid_amount), 0) 
                FROM water_bills wb 
                INNER JOIN water_customer_accounts wca ON wb.account_id = wca.id
                WHERE wca.sabha_code = p.sabha_code
                AND wca.project_code = p.code -- ✅ හරියටම Project එක Match වෙනවා
            ) AS collected_amount

        FROM water_projects p
        WHERE p.sabha_code = ?
    `;

    db.query(query, [sabhaCode], (err, results) => {
        if (err) {
            console.error("SQL Error in Report Model:", err);
            return callback(err, null);
        }
        return callback(null, results);
    });
};