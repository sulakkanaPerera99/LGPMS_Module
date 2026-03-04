import { getCustomersHistoryBySabha1 } from '../../models/water_billing_system/paymentHistoryModel.js';

/**
 * Controller: Get All Customers with Payment History
 * Retrieves filtered list of customers along with their latest payment details.
 */
export const getAllCustomers = async (req, res) => {
    try {
        // 1. Extract URL Parameters and Query Parameters
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

        // 2. Validation (Sabha Code is mandatory)
        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // 3. Prepare Filters (Convert Frontend Strings -> DB Values)
        const filters = {};

        // Search Text
        if (search && search.trim()) {
            filters.search = search.trim();
        }

        // Sort Option
        if (sort) {
            filters.sort = sort;
        }

        // Connection Types (Convert comma-separated string to array)
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

        // 4. Call Model to Fetch Data
        const customers = await getCustomersHistoryBySabha1(sabha_code, projectCode, filters);

        // 5. Send Successful Response
        return res.status(200).json(customers);

    } catch (error) {
        console.error("❌ Controller Error (getAllCustomers):", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};