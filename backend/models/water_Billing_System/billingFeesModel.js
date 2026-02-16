import db from "../../config/database.js";

/**
 * Inserts a new billing configuration into the database.
 * * @param {Object} data - The configuration data object.
 * @returns {Promise<Object>} - The result of the insert operation (contains insertId).
 */
export const insertBillingConfig = async (data) => {
    try {
        const query = `
            INSERT INTO water_billing_configurations 
            (project_code, connection_type, is_metered, is_samurdhi, fixed_rate, unit_ranges, other_charges, discounts, status, sabha_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.projectCode || 'General Config',
            data.connectionType,
            data.isMetered ? 1 : 0,
            data.isSamurdhi ? 1 : 0,
            data.fixedRate,
            JSON.stringify(data.unitRanges || []),
            JSON.stringify(data.otherCharges || []),
            JSON.stringify(data.discounts || []),
            1, // Default Status is 1 (Active)
            data.sabha_code
        ];

        // Destructure to get the result object (ignore fields)
        const [result] = await db.query(query, values);
        return result;

    } catch (error) {
        console.error("Error in insertBillingConfig:", error);
        throw error;
    }
};

/**
 * Retrieves billing configurations based on Sabha code, search, and sort criteria.
 * * @param {string} sabha_code - The Sabha code.
 * @param {string} search - Search keyword.
 * @param {string} sort - Sort parameter.
 * @returns {Promise<Array>} - Array of configuration objects.
 */
export const getBillingConfigs = async (sabha_code, search, sort) => {
    try {
        let query = "SELECT * FROM water_billing_configurations WHERE sabha_code = ?";
        let params = [sabha_code];

        // Dynamic Search Logic
        if (search) {
            query += " AND (project_code LIKE ? OR connection_type LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Dynamic Sorting Logic
        if (sort) {
            switch (sort) {
                case 'code_asc':
                    query += " ORDER BY project_code ASC";
                    break;
                case 'code_desc':
                    query += " ORDER BY project_code DESC";
                    break;
                case 'type_asc':
                    query += " ORDER BY connection_type ASC";
                    break;
                case 'type_desc':
                    query += " ORDER BY connection_type DESC";
                    break;
                default:
                    query += " ORDER BY id DESC";
            }
        } else {
            query += " ORDER BY id DESC";
        }

        const [rows] = await db.query(query, params);
        return rows;

    } catch (error) {
        console.error("Error in getBillingConfigs:", error);
        throw error;
    }
};

/**
 * Updates a configuration by deactivating the old record and inserting a new one (Versioning).
 * Uses a Database Transaction to ensure data integrity.
 * * @param {number} oldId - The ID of the record to deactivate.
 * @param {Object} data - The new data to insert.
 * @param {string} userNic - The NIC of the user performing the update.
 * @returns {Promise<Object>} - The result of the new insertion.
 */
export const updateBillingConfig = async (oldId, data, userNic) => {
    // 1. Get a specific connection from the pool for the transaction
    const connection = await db.getConnection();

    try {
        // 2. Start Transaction
        await connection.beginTransaction();

        // Step A: Deactivate old record
        const deactivateQuery = `
            UPDATE water_billing_configurations 
            SET status = 0, effective_to = NOW() 
            WHERE id = ?
        `;
        await connection.query(deactivateQuery, [oldId]);

        // Step B: Insert new record with updated values
        const insertQuery = `
            INSERT INTO water_billing_configurations 
            (project_code, connection_type, is_metered, is_samurdhi, fixed_rate, unit_ranges, other_charges, discounts, status, created_by, effective_from, sabha_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW(), ?)
        `;

        const values = [
            data.projectCode,
            data.connectionType,
            data.isMetered ? 1 : 0,
            data.isSamurdhi ? 1 : 0,
            data.fixedRate,
            JSON.stringify(data.unitRanges || []),
            JSON.stringify(data.otherCharges || []),
            JSON.stringify(data.discounts || []),
            userNic,
            data.sabha_code
        ];

        const [insertResult] = await connection.query(insertQuery, values);

        // 3. Commit the Transaction
        await connection.commit();
        
        return insertResult;

    } catch (error) {
        // 4. Rollback in case of error
        await connection.rollback();
        console.error("Error in updateBillingConfig (Transaction Rolled Back):", error);
        throw error;
    } finally {
        // 5. Release the connection back to the pool
        connection.release();
    }
};