import { getProjectCollectionReportModel } from '../../models/water_billing_system/reportModel.js';

/**
 * Controller: Get Project Collection Report
 * Generates a summary report of water project collections, including due amounts and collection percentages.
 */
export const getProjectCollectionReport = async (req, res) => {
    try {
        const { sabha_code } = req.params;

        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // Fetch raw data from the model
        const rows = await getProjectCollectionReportModel(sabha_code);

        // Perform Calculations (Due Amount & Collection Percentage)
        const reportData = rows.map((row, index) => {
            const total = Number(row.total_amount_to_collect || 0);
            const collected = Number(row.collected_amount || 0);
            
            const due = total - collected;
            
            // Percentage Calculation with Division by Zero check
            const percentage = total > 0 ? ((collected / total) * 100) : 0;

            return {
                id: index + 1,
                project_name: row.project_name,
                project_code: row.project_code,
                number_of_users: row.number_of_users,
                total_amount_to_collect: total,
                collected_amount: collected,
                due_amount: due,
                percentage: percentage.toFixed(2)
            };
        });

        return res.status(200).json({ success: true, data: reportData });

    } catch (err) {
        console.error("Controller Error (getProjectCollectionReport):", err);
        return res.status(500).json({ 
            success: false, 
            message: "Database Error", 
            error: err.message 
        });
    }
};