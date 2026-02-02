import { fetchCustomersModel, fetchProjectsModel } from "../../models/water_billing_system/waterBillPaymentModel.js";

export const getWaterCustomers = async (req, res) => {
    try {
        const { sabha_code } = req.params;
        const { search, sort, projectCode, connectionTypes, samurdhi, metered } = req.query;

        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        const filters = {
            search: search ? search.trim() : null,
            sort: sort || 'name_asc',
            projectCode: projectCode || null,
            connectionTypes: connectionTypes ? connectionTypes.split(',').map(t => t.trim()).filter(Boolean) : [],
            // Samurdhi Filter Logic
            isSamurdhi: undefined,
            // Metered Filter Logic
            isMetered: undefined
        };

        // Process Samurdhi Filter
        if (samurdhi) {
            const samurdhiArr = samurdhi.split(',');
            if (samurdhiArr.includes('Samurdhi') && !samurdhiArr.includes('Not Samurdhi')) {
                filters.isSamurdhi = 1;
            } else if (!samurdhiArr.includes('Samurdhi') && samurdhiArr.includes('Not Samurdhi')) {
                filters.isSamurdhi = 0;
            }
        }

        // Process Metered Filter
        if (metered) {
            const meteredArr = metered.split(',');
            if (meteredArr.includes('Metered') && !meteredArr.includes('Not Metered')) {
                filters.isMetered = 1;
            } else if (!meteredArr.includes('Metered') && meteredArr.includes('Not Metered')) {
                filters.isMetered = 0;
            }
        }

        const customers = await fetchCustomersModel(sabha_code, filters);
        
        return res.status(200).json(customers);

    } catch (error) {
        console.error("Error fetching water customers for payment:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getProjectList = async (req, res) => {
    try {
        const { sabha_code } = req.params;
        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        const projects = await fetchProjectsModel(sabha_code);
        return res.status(200).json(projects);

    } catch (error) {
        console.error("Error fetching project list:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
