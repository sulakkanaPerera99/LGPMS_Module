import db from '../../config/database.js';

/**
 * Retrieves the progress of meter readings for all projects within a specific Sabha for a given month and year.
 * Uses subqueries to count total active users and completed readings efficiently.
 * * * @param {string} sabhaCode - The unique code of the Sabha.
 * @param {number} month - The month to filter readings (1-12).
 * @param {number} year - The year to filter readings.
 * @returns {Promise<Array>} - Returns an array of project progress data.
 */
export const getProjectProgressModel = async (sabhaCode, month, year) => {
    try {
        /**
         * SQL Query Logic:
         * 1. Selects Project Code and Name from 'water_projects'.
         * 2. Subquery 1: Counts 'Active' customers (status = 1) for the project.
         * 3. Subquery 2: Counts entries in 'water_meter_readings' matching the project, month, and year.
         */
        const query = `
            SELECT 
                p.code,
                p.name,
                (
                    SELECT COUNT(*)
                    FROM water_customer_accounts c 
                    WHERE c.project_code = p.code 
                    AND c.sabha_code = p.sabha_code 
                    AND c.status = 1 
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

        // The order of params matches the ? placeholders in the query
        const params = [month, year, sabhaCode];

        // Execute query using the promise-based pool
        const [results] = await db.query(query, params);
        return results;

    } catch (err) {
        console.error("Database Error in getProjectProgressModel:", err);
        throw err;
    }
};