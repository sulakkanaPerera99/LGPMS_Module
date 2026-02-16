import db from '../../config/database.js';

/**
 * Inserts a new water project into the database.
 * Uses async/await to handle the promise-based connection.
 * * @param {Object} data - The project data object.
 * @returns {Promise<Object>} - The result of the insert operation.
 */
export const insertProject = async (data) => {
    try {
        const query = 'INSERT INTO water_projects SET ?';
        // With mysql2/promise, db.query returns [rows, fields]. We need rows (result).
        const [result] = await db.query(query, data);
        return result;
    } catch (error) {
        console.error("Error in insertProject:", error);
        throw error; // Propagate error to controller
    }
};

/**
 * Retrieves water projects filtered by Sabha code, with search and sorting capabilities.
 * Also counts registered users per project.
 * * @param {string} sabhaCode - The unique code of the Sabha.
 * @param {string} search - Search keyword for name or code.
 * @param {string} sort - Sort parameter (e.g., 'name_asc').
 * @returns {Promise<Array>} - Array of project objects.
 */
export const getProjectsBySabha = async (sabhaCode, search, sort) => {
    try {
        let query = `
            SELECT 
                p.id, 
                p.sabha_code, 
                p.name, 
                p.code, 
                p.number, 
                p.status, 
                COUNT(c.id) as registered_users 
            FROM water_projects p 
            LEFT JOIN water_customer_accounts c 
                ON c.project_code = p.code 
                AND c.sabha_code = p.sabha_code 
            WHERE p.sabha_code = ?
        `;
        
        const queryParams = [sabhaCode];

        // Apply Search Filters
        if (search) {
            query += ' AND (p.name LIKE ? OR p.code LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // Grouping results
        query += ' GROUP BY p.id, p.sabha_code, p.name, p.code, p.number, p.status';

        // Apply Sorting
        if (sort) {
            let field = sort;
            let direction = 'ASC';

            if (sort.endsWith('_desc')) {
                field = sort.slice(0, -5);
                direction = 'DESC';
            } else if (sort.endsWith('_asc')) {
                field = sort.slice(0, -4);
                direction = 'ASC';
            }

            // escapeId is available in the pool object of mysql2
            query += ` ORDER BY ${db.escapeId(field)} ${direction}`;
        }

        const [rows] = await db.query(query, queryParams);
        return rows;

    } catch (error) {
        console.error("Error in getProjectsBySabha:", error);
        throw error;
    }
};

/**
 * Retrieves a simple list of active water projects (code and name) for a Sabha.
 * Used for dropdowns or simple listings.
 * * @param {string} sabhaCode - The Sabha code.
 * @returns {Promise<Array>} - Array of active projects.
 */
export const getProjectList = async (sabhaCode) => {
    try {
        const query = "SELECT code, name FROM water_projects WHERE sabha_code = ? AND status = 1";
        const [rows] = await db.query(query, [sabhaCode]);
        return rows;
    } catch (error) {
        console.error("Error in getProjectList:", error);
        throw error;
    }
};

/**
 * Fetches the project number based on the project code.
 * * @param {string} projectCode - The project code.
 * @param {string} sabhaCode - The Sabha code.
 * @returns {Promise<string|null>} - The project number or null if not found.
 */
export const getProjectNumberByCode = async (projectCode, sabhaCode) => {
    try {
        const query = 'SELECT number as project_number FROM water_projects WHERE code = ? AND sabha_code = ?';
        const [rows] = await db.query(query, [projectCode, sabhaCode]);
        
        if (rows.length === 0) {
            return null;
        }
        return rows[0].project_number;
    } catch (error) {
        console.error("Error in getProjectNumberByCode:", error);
        throw error;
    }
};

/**
 * Updates an existing water project's details.
 * * @param {number} id - The ID of the project to update.
 * @param {Object} data - Object containing updated fields.
 * @returns {Promise<Object>} - The result of the update operation.
 */
export const updateProjectModel = async (id, data) => {
    try {
        const query = `
            UPDATE water_projects 
            SET 
                name = ?, 
                code = ?, 
                number = ?, 
                status = ?, 
                updated_by = ?, 
                updated_at = NOW() 
            WHERE id = ?
        `;

        const [result] = await db.query(
            query, 
            [data.name, data.code, data.number, data.status, data.updated_by, id]
        );
        return result;
    } catch (error) {
        console.error("Error in updateProjectModel:", error);
        throw error;
    }
};