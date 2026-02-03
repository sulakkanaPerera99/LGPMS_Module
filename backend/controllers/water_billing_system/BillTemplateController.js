import * as WaterBillModel from '../../models/water_billing_system/BillTemplateModel.js';

// Get Bill Details for Printing
export const getBillDetails = async (req, res) => {
    try {
        const { id } = req.params;

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
            paymentStatus: bill.payment_status
        };

        return res.status(200).json(formattedBill);

    } catch (error) {
        console.error("Error fetching bill details:", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
};