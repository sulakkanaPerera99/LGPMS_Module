import { getPendingCustomers, saveBatchReadings, getProjectCodes } from '../../models/water_Billing_System/waterReadingsModel.js';

export const getPendingCustomersController = async (req, res) => {
    try {
        const { sabha_code, project_code, month, year } = req.query;

        if (!sabha_code || !project_code || !month || !year) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required parameters: sabha_code, project_code, month, year'
            });
        }

        const customers = await getPendingCustomers(sabha_code, project_code, parseInt(month), parseInt(year));

        res.json({
            status: 'success',
            data: customers
        });
    } catch (error) {
        console.error('Error fetching pending customers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

export const saveBatchReadingsController = async (req, res) => {
    try {
        const readings = req.body;

        if (!Array.isArray(readings) || readings.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Readings must be a non-empty array'
            });
        }

        // Validate each reading
        for (const reading of readings) {
            if (!reading.account_id || !reading.current_reading || !reading.reading_date) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Each reading must have account_id, current_reading, and reading_date'
                });
            }
        }

        const result = await saveBatchReadings(readings);

        res.json({
            status: 'success',
            message: `${readings.length} readings saved successfully`,
            data: {
                insertedCount: result.affectedRows
            }
        });
    } catch (error) {
        console.error('Error saving batch readings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

export const getProjectCodesController = async (req, res) => {
    try {
        const { sabha_code } = req.query;

        if (!sabha_code) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required parameter: sabha_code'
            });
        }

        const projects = await getProjectCodes(sabha_code);

        res.json({
            status: 'success',
            data: projects
        });
    } catch (error) {
        console.error('Error fetching project codes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};
