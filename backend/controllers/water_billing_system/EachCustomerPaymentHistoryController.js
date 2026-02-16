import * as EachCustomerPaymentHistoryModel from '../../models/water_Billing_System/EachCustomerPaymentHistoryModel.js';

/**
 * Controller: Get Payment History
 * Fetches and structures the payment history for a specific customer account.
 * Separation of customer details and transaction history is performed here.
 */
export const getPaymentHistory = async (req, res) => {
    try {
        const { accountId } = req.params;

        // Validation
        if (!accountId) {
            return res.status(400).json({ success: false, message: "Account ID is required." });
        }

        // Fetch raw data from model
        const rawData = await EachCustomerPaymentHistoryModel.getCustomerPaymentHistory(accountId);

        // Check if customer exists
        if (rawData.length === 0) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        // Structure the data: Extract customer info once (from the first row)
        // Since we did a LEFT JOIN, customer data is present in every row.
        const customerDetails = {
            fullName: rawData[0].full_name,
            nic: rawData[0].nic,
            newBillNumber: rawData[0].new_bill_number,
            mailingAddress: rawData[0].mailing_address,
            currentBalance: rawData[0].current_balance // Added current balance to customer object for clarity
        };

        // Filter out rows where bill_id is null (in case of LEFT JOIN with no bills)
        // Map the rest to a clean history array
        const paymentHistory = rawData
            .filter(row => row.bill_id !== null)
            .map(row => ({
                id: row.bill_id,
                totalAmount: row.total_amount,
                paidAmount: row.paid_amount,
                paidDate: row.paid_date,
                previousDues: row.previous_dues,
                previousReading: row.previous_reading, 
                currentReading: row.current_reading,
                unitsConsumed: row.units_consumed
            }));

        return res.status(200).json({
            success: true,
            data: {
                customer: customerDetails,
                history: paymentHistory
            }
        });

    } catch (error) {
        console.error("Error fetching customer payment history:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};