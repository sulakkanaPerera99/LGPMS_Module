import db from '../../config/database.js';

/**
 * Retrieves the project collection report data for a specific Sabha.
 * Calculates number of users, total collectible amount, and total collected amount per project.
 * * @param {string} sabhaCode - The unique code of the Sabha.
 * @returns {Promise<Array>} - Returns an array of project collection data.
 */
export const getProjectCollectionReportModel = async (sabhaCode) => {
    try {
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
                -- Calculates the sum of all generated bill amounts for this project
                (
                    SELECT COALESCE(SUM(wb.total_amount), 0) 
                    FROM water_bills wb 
                    INNER JOIN water_customer_accounts wca ON wb.account_id = wca.id
                    WHERE wca.sabha_code = p.sabha_code
                    AND wca.project_code = p.code
                ) AS total_amount_to_collect,

                -- 3. Collected Amount
                -- Calculates the sum of paid amounts for this project
                (
                    SELECT COALESCE(SUM(wb.paid_amount), 0) 
                    FROM water_bills wb 
                    INNER JOIN water_customer_accounts wca ON wb.account_id = wca.id
                    WHERE wca.sabha_code = p.sabha_code
                    AND wca.project_code = p.code
                ) AS collected_amount

            FROM water_projects p
            WHERE p.sabha_code = ?
        `;

        // Execute query using promise-based pool
        const [results] = await db.query(query, [sabhaCode]);
        return results;

    } catch (err) {
        console.error("SQL Error in getProjectCollectionReportModel:", err);
        throw err;
    }
};