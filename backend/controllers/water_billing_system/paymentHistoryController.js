import { getCustomersHistoryBySabha1 } from '../../models/water_Billing_System/paymentHistoryModel.js';

export const getAllCustomers = async (req, res) => {
    try {
        // 1. URL Parameters සහ Query Parameters ලබා ගැනීම
        const { sabha_code } = req.params;
        const { 
            search, 
            sort, 
            connectionTypes, 
            samurdhi, 
            metered, 
            status, 
            projectCode 
        } = req.query;

        // 2. Validation (සභා කේතය අනිවාර්යයි)
        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // 3. Filters සකසා ගැනීම (Frontend String -> DB Integers)
        const filters = {};

        // Search Text
        if (search && search.trim()) {
            filters.search = search.trim();
        }

        // Sort Option
        if (sort) {
            filters.sort = sort;
        }

        // Connection Types (Array එකක් බවට පත් කිරීම)
        if (connectionTypes) {
            filters.connectionTypes = connectionTypes.split(',').map(type => type.trim()).filter(Boolean);
        }

        // Samurdhi Filter Logic (Samurdhi -> 1, Not Samurdhi -> 0)
        if (samurdhi) {
            filters.isSamurdhi = samurdhi.split(',').map(val => {
                const v = val.trim();
                if (v === 'Samurdhi') return 1;
                if (v === 'Not Samurdhi') return 0;
                return null;
            }).filter(val => val !== null);
        }

        // Metered Filter Logic (Metered -> 1, Not Metered -> 0)
        if (metered) {
            filters.isMetered = metered.split(',').map(val => {
                const v = val.trim();
                if (v === 'Metered') return 1;
                if (v === 'Not Metered') return 0;
                return null;
            }).filter(val => val !== null);
        }

        // Status Filter Logic (Active -> 1, Inactive -> 0)
        if (status) {
            filters.status = status.split(',').map(val => {
                const v = val.trim().toLowerCase();
                if (v === 'active' || v === '1') return 1;
                if (v === 'inactive' || v === '0') return 0;
                return null;
            }).filter(val => val !== null);
        }

        // 4. Model එක Call කිරීම (දත්ත ලබා ගැනීම)
        // **වැදගත්:** මෙය තිබිය යුත්තේ Response එක යවන්න කලින්.
        const customers = await getCustomersHistoryBySabha1(sabha_code, projectCode, filters);

        // 5. Debugging (Console එකේ බලාගැනීමට)
        if (customers.length > 0) {
            console.log(`✅ Controller: ${customers.length} records found.`);
            // පළමු රෙකෝඩ් එකේ sample එකක් print කරන්න
            // console.log("Sample:", customers[0]); 
        } else {
            console.log("⚠️ Controller: No customers found.");
        }

        // 6. සාර්ථක ප්‍රතිචාරය යැවීම
        return res.status(200).json(customers);

    } catch (error) {
        console.error("❌ Controller Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};