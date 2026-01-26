// controllers/water_billing_system/BillingfeesController.js

// Model එක Import කිරීම (අගට .js තිබිය යුතුයි)
import * as BillingFeesModel from '../../models/water_billing_system/BillingfeesModel.js';

export const addConfig = async (req, res) => {
    try {
        const { 
            projectCode, 
            connectionType, 
            isMetered, 
            fixedRate, 
            unitRanges, 
            otherCharges, 
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
            fixedRate,
            unitRanges,
            otherCharges,
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

        const processedConfigs = configs.map(config => ({
            id: config.id,
            projectCode: config.project_code,
            connectionType: config.connection_type,
            isMetered: Boolean(config.is_metered),
            fixedRate: config.fixed_rate,
            unitRanges: typeof config.unit_ranges === 'string' ? JSON.parse(config.unit_ranges) : config.unit_ranges,
            otherCharges: typeof config.other_charges === 'string' ? JSON.parse(config.other_charges) : config.other_charges,
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