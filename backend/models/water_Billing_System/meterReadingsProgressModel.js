import db from '../../config/database.js'; // Database connection එක

export const getProjectProgressModel = (sabhaCode, month, year) => {
    return new Promise((resolve, reject) => {
        
        // SQL Query එක: 
        // 1. Projects table එකෙන් Project විස්තර ගන්නවා.
        // 2. Subquery 1: Customers table එකෙන් අදාල Project එකේ Active customers ගණන් කරනවා.
        // 3. Subquery 2: Readings table එකෙන් අදාල මාසයේ/වර්ෂයේ කියවීම් ගණන් කරනවා.
        
        const query = `
            SELECT 
                p.code,
                p.name,
                (
                    SELECT COUNT(*)
                    FROM water_customer_accounts c 
                    WHERE c.project_code = p.code 
                    AND c.sabha_code = p.sabha_code 
                    AND c.status = 1  -- Active Customers පමණක්
                ) AS total_users,
                (
                    SELECT COUNT(*) 
                    FROM water_meter_readings r 
                    WHERE r.project_code = p.code 
                    AND r.sabha_code = p.sabha_code 
                    AND r.month = ? 
                    AND r.year = ?
                ) AS completed_readings
            FROM 
                water_projects p
            WHERE 
                p.sabha_code = ?
        `;

        const params = [month, year, sabhaCode];

        db.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};