// models/water_billing_system/BillingfeesModel.js

import db from "../../config/database.js";

// Class එක ඉවත් කර, කෙලින්ම export const භාවිතා කරන්න.

// 1. Data ඇතුලත් කිරීමේ Function එක
export const insertBillingConfig = (data) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO billing_configurations 
            (project_code, connection_type, is_metered, fixed_rate, unit_ranges, other_charges, sabha_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.projectCode || 'General Config',
            data.connectionType,
            data.isMetered ? 1 : 0,
            data.fixedRate,
            JSON.stringify(data.unitRanges || []),
            JSON.stringify(data.otherCharges || []),
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
        const query = "SELECT * FROM billing_configurations WHERE sabha_code = ? ORDER BY id DESC";
        
        db.query(query, [sabha_code], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};