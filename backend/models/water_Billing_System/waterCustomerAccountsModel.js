import db from '../../config/database.js';

/**
 * Gets the count of existing customers for a specific project in a Sabha.
 * Used for generating the next serial number.
 */
export const getCustomerCountBySabhaAndProject = async (sabhaCode, projectCode) => {
    try {
        const query = 'SELECT COUNT(*) as count FROM water_customer_accounts WHERE sabha_code = ? AND project_code = ?';
        const [results] = await db.query(query, [sabhaCode, projectCode]);
        return results.length > 0 ? results[0].count : 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Inserts a new water customer and creates an initial history record.
 * Uses a transaction to ensure data integrity.
 */
export const insertCustomer = async (data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Insert into Main Customer Account Table
        const insertAccountQuery = 'INSERT INTO water_customer_accounts SET ?';
        const [result] = await connection.query(insertAccountQuery, data);
        
        const newCustomerId = result.insertId;

        // Step 2: Insert into History Table
        const insertHistoryQuery = `
            INSERT INTO water_customer_history 
            (customer_id, full_name, nic, is_samurdhi, is_active, valid_from, valid_to) 
            VALUES (?, ?, ?, ?, ?, NOW(), NULL)
        `;

        const historyValues = [
            newCustomerId,
            data.full_name,
            data.nic,
            data.is_samurdhi,
            1 // is_active = 1 (Active)
        ];

        await connection.query(insertHistoryQuery, historyValues);

        await connection.commit();
        return result;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Inserts a new general Sabha Customer (if they don't exist).
 */
export const insertSabhaCustomer = async (data) => {
    try {
        const query = `
            INSERT INTO sbha_cutomers 
            (sabha_code, cus_nic, cus_name, cus_address, cus_contact, cus_date) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        const values = [
            data.sabha_code,
            data.cus_nic,
            data.cus_name,
            data.cus_address,
            data.cus_contact
        ];

        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves all customers based on filters.
 */
export const getCustomersBySabha = async (sabhaCode, projectCode, filters = {}) => {
    try {
        let query = `
            SELECT
                id, nic, old_bill_number AS oldBillNumber,
                new_bill_number AS newBillNumber, full_name AS fullName,
                property_address AS propertyAddress, mailing_address AS mailingAddress,
                contact_info AS contactInfo, connection_type AS connectionType,
                project_code AS projectCode, is_samurdhi AS isSamurdhi,
                samurdhi_number AS samurdhiNumber, is_metered AS isMetered,
                status AS status
            FROM water_customer_accounts
            WHERE sabha_code = ?
        `;

        const params = [sabhaCode];

        if (projectCode) {
            query += " AND project_code = ?";
            params.push(projectCode);
        }

        const conditions = [];

        if (filters.search) {
            conditions.push(`(full_name LIKE ? OR nic LIKE ? OR old_bill_number LIKE ? OR new_bill_number LIKE ? OR project_code LIKE ?)`);
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filters.connectionTypes && filters.connectionTypes.length > 0) {
            const placeholders = filters.connectionTypes.map(() => '?').join(',');
            conditions.push(`connection_type IN (${placeholders})`);
            params.push(...filters.connectionTypes);
        }

        if (filters.status && filters.status.length > 0) {
            const placeholders = filters.status.map(() => '?').join(',');
            conditions.push(`status IN (${placeholders})`);
            params.push(...filters.status);
        }

        if (filters.isSamurdhi && filters.isSamurdhi.length > 0) {
            const placeholders = filters.isSamurdhi.map(() => '?').join(',');
            conditions.push(`is_samurdhi IN (${placeholders})`);
            params.push(...filters.isSamurdhi);
        }

        if (filters.isMetered && filters.isMetered.length > 0) {
            const placeholders = filters.isMetered.map(() => '?').join(',');
            conditions.push(`is_metered IN (${placeholders})`);
            params.push(...filters.isMetered);
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // Sorting Logic
        if (filters.sort) {
            switch (filters.sort) {
                case 'name_asc': query += ' ORDER BY full_name ASC'; break;
                case 'name_desc': query += ' ORDER BY full_name DESC'; break;
                case 'bill_asc': query += ' ORDER BY new_bill_number ASC'; break;
                case 'bill_desc': query += ' ORDER BY new_bill_number DESC'; break;
                default: query += ' ORDER BY full_name ASC';
            }
        } else {
            query += ' ORDER BY full_name ASC';
        }

        const [results] = await db.query(query, params);
        return results;

    } catch (error) {
        throw error;
    }
};

/**
 * Updates customer details. Handles ownership transfer (NIC change) by updating history.
 */
export const updateCustomer = async (customerId, data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get current NIC
        const checkQuery = 'SELECT nic FROM water_customer_accounts WHERE id = ?';
        const [results] = await connection.query(checkQuery, [customerId]);

        if (results.length === 0) {
            throw new Error("Customer not found");
        }

        const currentNIC = results[0].nic;
        const newNIC = data.nic;

        // 2. Update Main Account Table
        const updateAccountQuery = 'UPDATE water_customer_accounts SET ? WHERE id = ?';
        await connection.query(updateAccountQuery, [data, customerId]);

        // 3. Handle History based on NIC change
        if (currentNIC === newNIC) {
            // SCENARIO 1: Same NIC (Correction/Update)
            const updateHistoryQuery = `
                UPDATE water_customer_history 
                SET full_name = ?, is_samurdhi = ?
                WHERE customer_id = ? AND is_active = 1
            `;
            await connection.query(updateHistoryQuery, [data.full_name, data.is_samurdhi, customerId]);
            
            await connection.commit();
            return { message: "Customer details updated successfully (Status/Info Updated)" };

        } else {
            // SCENARIO 2: Different NIC (Ownership Transfer)
            
            // A. Close old history record
            const closeHistoryQuery = `
                UPDATE water_customer_history 
                SET is_active = 0, valid_to = NOW() 
                WHERE customer_id = ? AND is_active = 1
            `;
            await connection.query(closeHistoryQuery, [customerId]);

            // B. Insert new history record
            const insertHistoryQuery = `
                INSERT INTO water_customer_history 
                (customer_id, full_name, nic, is_samurdhi, is_active, valid_from, valid_to) 
                VALUES (?, ?, ?, ?, 1, NOW(), NULL)
            `;
            await connection.query(insertHistoryQuery, [customerId, data.full_name, data.nic, data.is_samurdhi]);

            await connection.commit();
            return { message: "Ownership transferred successfully (New Owner Registered)" };
        }

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Check if a Sabha Customer exists by NIC.
 */
export const getSabhaCustomerByNIC = async (nic) => {
    try {
        const query = `
            SELECT cus_name, cus_address, cus_contact, id 
            FROM sbha_cutomers 
            WHERE cus_nic = ? 
            LIMIT 1
        `;
        const [results] = await db.query(query, [nic]);
        return results[0]; // Returns row object or undefined
    } catch (error) {
        throw error;
    }
};