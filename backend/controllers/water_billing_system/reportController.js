import { getProjectCollectionReportModel } from '../../models/water_Billing_System/reportModel.js';

export const getProjectCollectionReport = (req, res) => {
    // URL එකෙන් sabha_code එක ගන්නවා
    const { sabha_code } = req.params;

    if (!sabha_code) {
        return res.status(400).json({ success: false, message: "Sabha Code is required" });
    }

    getProjectCollectionReportModel(sabha_code, (err, rows) => {
        if (err) {
            console.error("Controller Error:", err);
            return res.status(500).json({ success: false, message: "Database Error", error: err.message });
        }

        // ගණනය කිරීම් (Due Amount & Percentage)
        const reportData = rows.map((row, index) => {
            const total = Number(row.total_amount_to_collect || 0);
            const collected = Number(row.collected_amount || 0);
            
            const due = total - collected;
            
            // 0න් බෙදීම වැළැක්වීමට (Division by zero check)
            const percentage = total > 0 ? ((collected / total) * 100) : 0;

            return {
                id: index + 1,
                project_name: row.project_name,
                project_code: row.project_code,
                number_of_users: row.number_of_users,
                total_amount_to_collect: total,
                collected_amount: collected,
                due_amount: due,
                percentage: percentage.toFixed(2) // දශම ස්ථාන 2ක් පමණි
            };
        });

        return res.status(200).json({ success: true, data: reportData });
    });
};