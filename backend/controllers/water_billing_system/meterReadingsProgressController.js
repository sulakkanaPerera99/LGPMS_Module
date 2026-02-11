import { getProjectProgressModel } from '../../models/water_Billing_System/meterReadingsProgressModel.js'; // Model එක Import කරගන්න

export const getProjectProgressController = async (req, res) => {
    try {
        const { sabha_code, month, year, sort_by, order } = req.query;

        // 1. Validation: අත්‍යවශ්‍ය දත්ත තිබේදැයි බැලීම
        if (!sabha_code || !month || !year) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters: sabha_code, month, or year' });
        }

        // 2. Model එක හරහා දත්ත ගෙන්වා ගැනීම
        const rawData = await getProjectProgressModel(sabha_code, parseInt(month), parseInt(year));

        // 3. Percentage එක ගණනය කිරීම සහ Data Format කිරීම
        let processedData = rawData.map(project => {
            const total = project.total_users || 0;
            const completed = project.completed_readings || 0;
            
            // ප්‍රතිශතය ගණනය කිරීම (0 න් බෙදීම වැළැක්වීමට check එකක්)
            const percentage = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

            return {
                project_code: project.code,
                project_name: project.name,
                total_users: total,
                completed_readings: completed,
                progress_percentage: parseFloat(percentage)
            };
        });

        // 4. Sorting Logic
        // sort_by = 'progress' හෝ 'users'
        // order = 'asc' (ආරෝහණ) හෝ 'desc' (අවරෝහණ)
        if (sort_by) {
            processedData.sort((a, b) => {
                let valA, valB;

                if (sort_by === 'progress') {
                    valA = a.progress_percentage;
                    valB = b.progress_percentage;
                } else if (sort_by === 'users') {
                    valA = a.total_users;
                    valB = b.total_users;
                } else {
                    return 0; // වෙනත් දෙයක් නම් sort නොකරයි
                }

                // Ascending or Descending
                return order === 'asc' ? valA - valB : valB - valA;
            });
        }

        // 5. ප්‍රතිඵලය යැවීම
        res.json({ status: 'success', data: processedData });

    } catch (error) {
        console.error('Error fetching project progress:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};