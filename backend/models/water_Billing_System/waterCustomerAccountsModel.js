import db from '../../config/database.js';

// 1. Get Customer Count
export const getCustomerCountBySabhaAndProject = (sabhaCode, projectCode) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM water_customer_accounts WHERE sabha_code = ? AND project_code = ?';
        db.query(query, [sabhaCode, projectCode], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0].count : 0);
        });
    });
};

// 2. Insert Customer (UPDATED with Transaction for History)
export const insertCustomer = (data) => {
    return new Promise((resolve, reject) => {
        
        // Transaction පටන් ගන්නවා (Tables දෙකටම හරියට වැටුනොත් විතරයි Save වෙන්නේ)
        db.beginTransaction((err) => {
            if (err) return reject(err);

            // Step 1: Main Customer Account එකට දත්ත දැමීම
            const insertAccountQuery = 'INSERT INTO water_customer_accounts SET ?';
            
            db.query(insertAccountQuery, data, (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        reject(err);
                    });
                }

                const newCustomerId = result.insertId; // අලුතින් හැදුනු ID එක

                // Step 2: History Table එකට දත්ත දැමීම
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

                db.query(insertHistoryQuery, historyValues, (err, historyResult) => {
                    if (err) {
                        // History එකේ Error එකක් ආවොත්, Account එකත් Cancel කරනවා (Rollback)
                        return db.rollback(() => {
                            reject(err);
                        });
                    }

                    // ඔක්කොම හරි නම් Save කරනවා
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                reject(err);
                            });
                        }
                        resolve(result);
                    });
                });
            });
        });
    });
};

export const insertSabhaCustomer = (data) => {
    return new Promise((resolve, reject) => { 
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

        db.query(query, values, (err, result) => {
            if (err) {
                return reject(err); // Error ආවොත් Reject කරනවා
            }
            resolve(result); // Result එක (insertId එක්ක) Controller එකට යවනවා
        });
    });
};

// 3. Get All Customers (No Change)
export const getCustomersBySabha = (sabhaCode, projectCode, filters = {}) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT
                id,
                nic,
                old_bill_number AS oldBillNumber,
                current_reading AS currentReading,
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

        db.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

export const updateCustomer = (customerId, data) => {
    return new Promise((resolve, reject) => {
        
        db.beginTransaction((err) => {
            if (err) return reject(err);

            // 1. දැනට තියෙන NIC එක ගන්න (Check කරන්න)
            const checkQuery = 'SELECT nic FROM water_customer_accounts WHERE id = ?';
            
            db.query(checkQuery, [customerId], (err, results) => {
                if (err || results.length === 0) {
                    return db.rollback(() => reject(err || new Error("Customer not found")));
                }

                const currentNIC = results[0].nic;
                const newNIC = data.nic;

                // 2. Main Account Table එක Update කරන්න (නම, NIC, Contact, Samurdhi, Status)
                const updateAccountQuery = 'UPDATE water_customer_accounts SET ? WHERE id = ?';
                
                db.query(updateAccountQuery, [data, customerId], (err, result) => {
                    if (err) {
                        return db.rollback(() => reject(err));
                    }

                    // --- (Decision Logic) ---
                    
                    if (currentNIC === newNIC) {
                        // SCENARIO 1: NIC එක සමානයි (Correction / Status Update Only)
                        // අලුත් Row එකක් දාන්නේ නෑ. තියෙන History Row එකේ නම හදනවා.
                        
                        const updateHistoryQuery = `
                            UPDATE water_customer_history 
                            SET full_name = ?, is_samurdhi = ?
                            WHERE customer_id = ? AND is_active = 1
                        `;
                        const historyParams = [data.full_name, data.is_samurdhi, customerId];

                        db.query(updateHistoryQuery, historyParams, (err) => {
                            if (err) return db.rollback(() => reject(err));
                            
                            db.commit((err) => {
                                if (err) return db.rollback(() => reject(err));
                                resolve({ message: "Customer details updated successfully (Status/Info Updated)" });
                            });
                        });

                    } else {
                        // SCENARIO 2: NIC එක වෙනස් (Ownership Transfer)
                        // පරණ History එක Close කරලා, අලුත් එකක් දාන්න.
                        
                        // A. පරණ Active Record එක Close කරන්න (valid_to දාන්න)
                        const closeHistoryQuery = `
                            UPDATE water_customer_history 
                            SET is_active = 0, valid_to = NOW() 
                            WHERE customer_id = ? AND is_active = 1
                        `;

                        db.query(closeHistoryQuery, [customerId], (err) => {
                            if (err) return db.rollback(() => reject(err));

                            // B. අලුත් History Record එකක් දාන්න
                            // මෙතනදී අලුත් අයිතිකරු නිසා is_active = 1 විය යුතුයි (data.status මොකක් වුනත්)
                            const insertHistoryQuery = `
                                INSERT INTO water_customer_history 
                                (customer_id, full_name, nic, is_samurdhi, is_active, valid_from, valid_to) 
                                VALUES (?, ?, ?, ?, 1, NOW(), NULL)
                            `;
                            
                            const historyValues = [
                                customerId, 
                                data.full_name, 
                                data.nic, 
                                data.is_samurdhi
                            ];

                            db.query(insertHistoryQuery, historyValues, (err) => {
                                if (err) return db.rollback(() => reject(err));

                                db.commit((err) => {
                                    if (err) return db.rollback(() => reject(err));
                                    resolve({ message: "Ownership transferred successfully (New Owner Registered)" });
                                });
                            });
                        });
                    }
                });
            });
        });
    });
};

//water customer adding process
export const getSabhaCustomerByNIC = (nic) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT cus_name, cus_address, cus_contact, id 
            FROM sbha_cutomers 
            WHERE cus_nic = ? 
            LIMIT 1
        `;
        db.query(query, [nic], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]); // පලමු result එක හෝ undefined
        });
    });
};