import * as BillingFeesModel from '../../models/water_Billing_System/BillingfeesModel.js';
import db from '../../config/database.js'; 

/**
 * Controller to add a new billing configuration.
 */
export const addConfig = async (req, res) => {
    try {
        const { 
            projectCode, 
            connectionType, 
            isMetered, 
            isSamurdhi, 
            fixedRate, 
            unitRanges, 
            otherCharges, 
            discounts,
            fines, 
            sabha_code 
        } = req.body;

        // Strict Validation
        if (!connectionType || fixedRate === undefined || fixedRate === null || !sabha_code) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: connectionType, fixedRate, or sabha_code' 
            });
        }

        // එකම Sabha, Project, Type, Metered සහ Samurdhi status එක ඇති record එකක් තිබේදැයි බලමු.
        const [existing] = await db.query(
            `SELECT id FROM water_billing_configurations 
             WHERE sabha_code = ? AND project_code = ? AND connection_type = ? 
             AND is_metered = ? AND is_samurdhi = ? AND status = 1`,
            [
                sabha_code, 
                projectCode || 'General Config', 
                connectionType, 
                isMetered ? 1 : 0, 
                isSamurdhi ? 1 : 0
            ]
        );

        if (existing.length > 0) {
            // 409 Conflict is the usual status code for indicating Duplicate data
            return res.status(409).json({
                status: 'error',
                message: `Duplicate Entry: A configuration for ${connectionType} in ${projectCode || 'this project'} already exists.`
            });
        }

        const result = await BillingFeesModel.insertBillingConfig({
            projectCode,
            connectionType,
            isMetered,
            isSamurdhi,
            fixedRate,
            unitRanges,
            otherCharges,
            discounts,
            fines,
            sabha_code
        });

        return res.status(201).json({
            status: 'success',
            message: 'Billing configuration saved successfully',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error("Controller Error (addConfig):", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
};

/**
 * Controller to get configurations.
 * Handles data formatting (JSON parsing) for the frontend.
 */
export const getConfigs = async (req, res) => {
    try {
        const { sabha_code } = req.params;
        const { search, sort } = req.query;

        if (!sabha_code) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Sabha code is required' 
            });
        }

        const configs = await BillingFeesModel.getBillingConfigs(sabha_code, search, sort);

        // 1. Data Mapping (snake_case -> camelCase)
        const processedConfigs = configs.map(config => ({
            id: config.id,
            projectCode: config.project_code,
            connectionType: config.connection_type,
            isMetered: Boolean(config.is_metered),
            isSamurdhi: Boolean(config.is_samurdhi),
            fixedRate: config.fixed_rate,
            unitRanges: typeof config.unit_ranges === 'string' ? JSON.parse(config.unit_ranges) : (config.unit_ranges || []),
            otherCharges: typeof config.other_charges === 'string' ? JSON.parse(config.other_charges) : (config.other_charges || []),
            discounts: typeof config.discounts === 'string' ? JSON.parse(config.discounts) : (config.discounts || []),
            fines: typeof config.fines === 'string' ? JSON.parse(config.fines) : (config.fines || []),
            status: config.status,
            createdAt: config.created_at
        }));

        // 2. sort according to Status
        
        processedConfigs.sort((a, b) => b.status - a.status);

        return res.status(200).json({
            status: 'success',
            data: processedConfigs
        });

    } catch (error) {
        console.error("Controller Error (getConfigs):", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
};

/**
 * Controller to update configuration (Versioning).
 */
export const updateConfig = async (req, res) => {
    try {
        const { id } = req.params; // Old ID
        const { 
            projectCode, connectionType, isMetered, isSamurdhi, 
            fixedRate, unitRanges, otherCharges, discounts, fines, 
            sabha_code, user_nic 
        } = req.body;

        // Validation
        if (!id || !connectionType || fixedRate === null) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields' 
            });
        }

        await BillingFeesModel.updateBillingConfig(id, {
            projectCode,
            connectionType,
            isMetered,
            isSamurdhi,
            fixedRate,
            unitRanges,
            otherCharges,
            discounts,
            fines,
            sabha_code
        }, user_nic);

        return res.status(200).json({
            status: 'success',
            message: 'Configuration updated with new version successfully.'
        });

    } catch (error) {
        console.error("Controller Error (updateConfig):", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
};