import { fetchCustomersModel, fetchProjectsModel, fetchAccountPaymentDetails } from "../../models/water_billing_system/waterBillPaymentModel.js";

// List customers (Existing logic)
export const getWaterCustomers = async (req, res) => {

    try {
        const { sabha_code } = req.params;
        const customers = await fetchCustomersModel(sabha_code, req.query); // Pass query params for filtering
        return res.status(200).json(customers);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get Details for Payment Page (By Account ID)
export const getAccountDetailsForPayment = async (req, res) => {
    try {
        const { account_id } = req.params; // use Account ID 

        if (!account_id) {
            return res.status(400).json({ success: false, message: "Account ID is required" });
        }

        const data = await fetchAccountPaymentDetails(account_id);

        if (!data) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        return res.status(200).json({
            success: true,
            data: {
                accountId: data.account.id,
                customerName: data.account.full_name,
                accountNumber: data.account.account_number,
                nic: data.account.nic,
                totalOutstanding: data.account.current_balance, // Total Amount Due
                pendingBills: data.pendingBills // List of bills for display
            }
        });

    } catch (error) {
        console.error("Error fetching account details:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const getProjectList = async (req, res) => {
    try {
        const projects = await fetchProjectsModel(req.params.sabha_code);
        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};