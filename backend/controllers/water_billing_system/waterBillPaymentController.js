import { 
    fetchCustomersModel, 
    fetchProjectsModel, 
    fetchAccountPaymentDetails, 
    fetchTempInvoicesBySubNIC,
    deleteTempInvoiceModel
} from "../../models/water_billing_system/waterBillPaymentModel.js";

/**
 * Controller: Get Water Customers List
 * Retrieves a list of customers for the dashboard/grid view.
 */
export const getWaterCustomers = async (req, res) => {
    try {
        const { sabha_code } = req.params;

        // Validate required parameter
        if (!sabha_code) {
            return res.status(400).json({ status: 'error', message: 'Sabha Code is required' });
        }

        // Fetch data from model passing query parameters
        const customers = await fetchCustomersModel(sabha_code, req.query); 
        
        return res.status(200).json(customers);

    } catch (error) {
        console.error("Controller Error (getWaterCustomers):", error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Controller: Get Account Details for Payment
 * Retrieves specific account details and pending bill breakdown for the payment processing page.
 */
export const getAccountDetailsForPayment = async (req, res) => {
    try {
        const { account_id } = req.params; 

        // Validate required parameter
        if (!account_id) {
            return res.status(400).json({ success: false, message: "Account ID is required" });
        }

        // Fetch detailed data from model
        const data = await fetchAccountPaymentDetails(account_id);

        // Handle case where account does not exist
        if (!data) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        // Return structured response matching frontend expectations
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
        console.error("Controller Error (getAccountDetailsForPayment):", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};

/**
 * Controller: Get Project List
 * Retrieves list of water projects for dropdown filtering.
 */
export const getProjectList = async (req, res) => {
    try {
        const { sabha_code } = req.params;

        if (!sabha_code) {
            return res.status(400).json({ status: 'error', message: 'Sabha Code is required' });
        }

        const projects = await fetchProjectsModel(sabha_code);
        
        return res.status(200).json(projects);

    } catch (error) {
        console.error("Controller Error (getProjectList):", error);
        return res.status(500).json({ error: error.message });
    }
};


export const getTempInvoices = async (req, res) => {
    try {
        const { sub_nic } = req.params;
        if (!sub_nic) {
            return res.status(400).json({ success: false, message: 'Sub NIC is required' });
        }
        const invoices = await fetchTempInvoicesBySubNIC(sub_nic);
        return res.status(200).json(invoices);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteTempInvoice = async (req, res) => {
    try {
        const { sub_nic, cus_nic } = req.params;
        const result = await deleteTempInvoiceModel(sub_nic, cus_nic);
        
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Record deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};