import * as WaterBillModel from '../../models/water_billing_system/BillTemplateModel.js';

/**
 * Controller: Get Bill Details for Printing
 * Fetches specific bill data and maps database columns to frontend template properties.
 */
export const getBillDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch raw bill data from model
        const bill = await WaterBillModel.getBillById(id);

        if (!bill) {
            return res.status(404).json({
                status: 'error',
                message: 'Bill not found'
            });
        }

        // Data Mapping (DB Columns -> Frontend Template Props)
        const formattedBill = {
            id: bill.id,
            billNumber: bill.bill_number,
            accountNo: bill.account_no,
            billingDate: bill.billing_date,
            periodFrom: bill.period_from,
            periodTo: bill.period_to,
            
            // Customer Details (From Joined History Table)
            fullName: bill.full_name || 'N/A',
            nic: bill.nic || 'N/A',
            address: bill.address || 'N/A',

            // Meter Readings
            previousReading: bill.previous_reading,
            currentReading: bill.current_reading,
            unitsConsumed: bill.units_consumed,

            // Charges Breakdown
            waterConsumptionCharge: bill.water_consumption_charge,
            fixedCharge: bill.fixed_charge,
            monthlyCharge: bill.monthly_charge, // (Water + Fixed)
            
            // Other Financials
            otherCharges: bill.other_charges,
            discounts: bill.discounts,
            previousDues: bill.previous_dues,
            
            // Final Totals
            totalAmount: bill.total_amount,
            paymentStatus: bill.payment_status,

            // Sabha details
            sb_name_en: bill.sb_name_en,
            sb_address: bill.sb_address,
            sb_contact: bill.sb_contact,
            fax: bill.fax,
            sb_email: bill.sb_email
        };

        return res.status(200).json(formattedBill);

    } catch (error) {
        console.error("Controller Error (getBillDetails):", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
};

/**
 * Controller: Get Last 12 Bills for Selection
 * Fetches bill history for a specific account to allow user selection.
 */
export const getBillHistory = async (req, res) => {
    try {
        const { accountId } = req.params;

        // Validate required parameter
        if (!accountId) {
            return res.status(400).json({ success: false, message: "Account ID is required" });
        }

        // Fetch bill history from model
        const bills = await WaterBillModel.getLastTwelveBills(accountId);

        return res.status(200).json({
            success: true,
            data: bills
        });

    } catch (error) {
        console.error("Controller Error (getBillHistory):", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getBulkBillDetails = async (req, res) => {
    try {
        const { sabhaCode, projectCode, year, month } = req.query;

        if (!sabhaCode || !projectCode || !year) {
            return res.status(400).json({ success: false, message: "Sabha Code, Project Code, and Year are required." });
        }

        const bills = await WaterBillModel.getBulkBills(sabhaCode, projectCode, year, month);

        return res.status(200).json({
            success: true,
            data: bills
        });

    } catch (error) {
        console.error("Controller Error (getBulkBillDetails):", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};