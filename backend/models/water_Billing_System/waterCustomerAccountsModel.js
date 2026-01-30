import db from '../../config/database.js';

export const getCustomerCountBySabhaAndProject = (sabhaCode, projectCode) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM water_customer_accounts WHERE sabha_code = ? AND project_code = ?';
        db.query(query, [sabhaCode, projectCode], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.length > 0 ? results[0].count : 0);
        });
    });
};

export const insertCustomer = (data) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO water_customer_accounts SET ?';
        db.query(query, data, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

export const getCustomersBySabha = (sabhaCode, projectCode, filters = {}) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT
                id,
                nic,
                old_bill_number AS oldBillNumber,
                new_bill_number AS newBillNumber,
                full_name AS fullName,
                property_address AS propertyAddress,
                mailing_address AS mailingAddress,
                contact_info AS contactInfo,
                connection_type AS connectionType,
                project_code AS projectCode,
                is_samurdhi AS isSamurdhi,
                samurdhi_number AS samurdhiNumber,
                is_metered AS isMetered,
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

        // Search filter
        if (filters.search) {
            conditions.push(`(full_name LIKE ? OR nic LIKE ? OR old_bill_number LIKE ? OR new_bill_number LIKE ? OR project_code LIKE ?)`);
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Connection Types filter
        if (filters.connectionTypes && filters.connectionTypes.length > 0) {
            const placeholders = filters.connectionTypes.map(() => '?').join(',');
            conditions.push(`connection_type IN (${placeholders})`);
            params.push(...filters.connectionTypes);
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
            const placeholders = filters.status.map(() => '?').join(',');
            conditions.push(`status IN (${placeholders})`); // මෙතන column එකේ නම 'status' විය යුතුයි
            params.push(...filters.status);
        }

        // Samurdhi filter
        if (filters.isSamurdhi && filters.isSamurdhi.length > 0) {
            const placeholders = filters.isSamurdhi.map(() => '?').join(',');
            conditions.push(`is_samurdhi IN (${placeholders})`);
            params.push(...filters.isSamurdhi);
        }

        // Metered filter
        if (filters.isMetered && filters.isMetered.length > 0) {
            const placeholders = filters.isMetered.map(() => '?').join(',');
            conditions.push(`is_metered IN (${placeholders})`);
            params.push(...filters.isMetered);
        }

        // Status filter (currently all are 'Active', but keeping for future use)
        if (filters.status && filters.status.length > 0) {
            // Since status is hardcoded to 'Active', this won't filter anything currently
            // But keeping the structure for future expansion
        }

        // Append conditions to query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // Sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'name_asc':
                    query += ' ORDER BY full_name ASC';
                    break;
                case 'name_desc':
                    query += ' ORDER BY full_name DESC';
                    break;
                case 'bill_asc':
                    query += ' ORDER BY new_bill_number ASC';
                    break;
                case 'bill_desc':
                    query += ' ORDER BY new_bill_number DESC';
                    break;
                default:
                    query += ' ORDER BY full_name ASC';
            }
        } else {
            query += ' ORDER BY full_name ASC';
        }

        db.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};
