// controllers/water_billing_system/BillingfeesController.js

import * as BillingFeesModel from '../../models/water_billing_system/BillingfeesModel.js';

export const addConfig = async (req, res) => {
    try {
        const { 
            projectCode, 
            connectionType, 
            isMetered, 
            isSamurdhi,   // <--- NEW: Samurdhi Status
            fixedRate, 
            unitRanges, 
            otherCharges, 
            discounts,    // <--- NEW: Discounts Array
            sabha_code 
        } = req.body;

        // Strict Validation
        if (!connectionType || fixedRate === undefined || fixedRate === null || !sabha_code) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: connectionType, fixedRate, or sabha_code' 
            });
        }

        const result = await BillingFeesModel.insertBillingConfig({
            projectCode,
            connectionType,
            isMetered,
            isSamurdhi,   // <--- Pass to Model
            fixedRate,
            unitRanges,
            otherCharges,
            discounts,    // <--- Pass to Model
            sabha_code
        });

        return res.status(201).json({
            status: 'success',
            message: 'Billing configuration saved successfully',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error("Error adding billing config:", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
};

export const getConfigs = async (req, res) => {
    try {
        const { sabha_code } = req.params;

        if (!sabha_code) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Sabha code is required' 
            });
        }

        const configs = await BillingFeesModel.getBillingConfigs(sabha_code);

        // Data Mapping (snake_case DB fields -> camelCase Frontend fields)
        const processedConfigs = configs.map(config => ({
            id: config.id,
            projectCode: config.project_code,
            connectionType: config.connection_type,
            isMetered: Boolean(config.is_metered),
            isSamurdhi: Boolean(config.is_samurdhi), // <--- NEW
            fixedRate: config.fixed_rate,
            
            // JSON Parsing checks
            unitRanges: typeof config.unit_ranges === 'string' ? JSON.parse(config.unit_ranges) : config.unit_ranges,
            otherCharges: typeof config.other_charges === 'string' ? JSON.parse(config.other_charges) : config.other_charges,
            discounts: typeof config.discounts === 'string' ? JSON.parse(config.discounts) : (config.discounts || []), // <--- NEW
            
            status: config.status, // <--- NEW
            createdAt: config.created_at
        }));

        return res.status(200).json({
            status: 'success',
            data: processedConfigs
        });

    } catch (error) {
        console.error("Error fetching billing configs:", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
};