// models/water_billing_system/BillingfeesModel.js

import db from "../../config/database.js";

// 1. Data ඇතුලත් කිරීමේ Function එක
export const insertBillingConfig = (data) => {
    return new Promise((resolve, reject) => {
        // Updated Query with new columns
        const query = `
            INSERT INTO water_billing_configurations 
            (project_code, connection_type, is_metered, is_samurdhi, fixed_rate, unit_ranges, other_charges, discounts, status, sabha_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.projectCode || 'General Config',
            data.connectionType,
            data.isMetered ? 1 : 0,
            data.isSamurdhi ? 1 : 0,        // <--- Boolean -> TINYINT
            data.fixedRate,
            JSON.stringify(data.unitRanges || []),
            JSON.stringify(data.otherCharges || []),
            JSON.stringify(data.discounts || []), // <--- Array -> JSON String
            1,                              // <--- Default Status is 1 (Active)
            data.sabha_code
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

// 2. Data ලබා ගැනීමේ Function එක
export const getBillingConfigs = (sabha_code, search, sort) => {
    return new Promise((resolve, reject) => {
        
        // 1. Base Query
        let query = "SELECT * FROM water_billing_configurations WHERE sabha_code = ?";
        let params = [sabha_code];

        // 2. Dynamic Search Logic (SQL Injection Safe)
        if (search) {
            // Search in project_code OR connection_type
            query += " AND (project_code LIKE ? OR connection_type LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // 3. Dynamic Sorting Logic (Whitelist Approach)
        //use a switch statement to prevent SQL injection via ORDER BY
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
                    query += " ORDER BY id DESC"; // Default fallback
            }
        } else {
            query += " ORDER BY id DESC"; // Default if no sort provided
        }

        // 4. Execute Query
        db.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

export const updateBillingConfig = (oldId, data, userNic) => {
    return new Promise((resolve, reject) => {
        db.beginTransaction((err) => {
            if (err) return reject(err);

            // පියවර 1: පරණ Record එක Deactivate කිරීම
            const deactivateQuery = `
                UPDATE water_billing_configurations 
                SET 
                    status = 0, 
                    effective_to = NOW() 
                WHERE id = ?
            `;

            db.query(deactivateQuery, [oldId], (err, result) => {
                if (err) {
                    return db.rollback(() => reject(err));
                }

                // පියවර 2: අලුත් මිල ගණන් අලුත් පේළියක් ලෙස ඇතුලත් කිරීම
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
                    userNic,     // Edited User's NIC
                    data.sabha_code
                ];

                db.query(insertQuery, values, (err, insertResult) => {
                    if (err) {
                        return db.rollback(() => reject(err));
                    }

                    // සාර්ථක නම් Commit කරන්න
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => reject(err));
                        }
                        resolve(insertResult);
                    });
                });
            });
        });
    });
};