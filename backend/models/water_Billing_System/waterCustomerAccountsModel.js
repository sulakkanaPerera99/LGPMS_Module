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

export const getCustomersBySabha = (sabhaCode) => {
    return new Promise((resolve, reject) => {
        const query = `
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
                'Active' AS status
            FROM water_customer_accounts
            WHERE sabha_code = ?
        `;
        db.query(query, [sabhaCode], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};
