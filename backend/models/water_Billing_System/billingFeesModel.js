// models/water_billing_system/BillingfeesModel.js

import db from "../../config/database.js";

// 1. Data ඇතුලත් කිරීමේ Function එක
export const insertBillingConfig = (data) => {
    return new Promise((resolve, reject) => {
        // Updated Query with new columns
        const query = `
            INSERT INTO billing_configurations 
            (project_code, connection_type, is_metered, is_samurdhi, fixed_rate, unit_ranges, other_charges, discounts, status, sabha_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.projectCode || 'General Config',
            data.connectionType,
            data.isMetered ? 1 : 0,
            data.isSamurdhi ? 1 : 0,        // <--- NEW: Boolean -> TINYINT
            data.fixedRate,
            JSON.stringify(data.unitRanges || []),
            JSON.stringify(data.otherCharges || []),
            JSON.stringify(data.discounts || []), // <--- NEW: Array -> JSON String
            1,                              // <--- NEW: Default Status is 1 (Active)
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
export const getBillingConfigs = (sabha_code) => {
    return new Promise((resolve, reject) => {
        // Select all configs (Active and Inactive) for the admin view
        const query = "SELECT * FROM billing_configurations WHERE sabha_code = ? ORDER BY id DESC";
        
        db.query(query, [sabha_code], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};