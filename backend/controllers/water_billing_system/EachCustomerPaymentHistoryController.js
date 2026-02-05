import * as EachCustomerPaymentHistoryModel from '../../models/water_Billing_System/EachCustomerPaymentHistoryModel.js';

export const getPaymentHistory = async (req, res) => {
    try {
        const { accountId } = req.params;

        if (!accountId) {
            return res.status(400).json({ success: false, message: "Account ID is required." });
        }

        const rawData = await EachCustomerPaymentHistoryModel.getCustomerPaymentHistory(accountId);

        if (rawData.length === 0) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        // Structure the data: Extract customer info once, then map the history
        const customerDetails = {
            fullName: rawData[0].full_name,
            nic: rawData[0].nic,
            newBillNumber: rawData[0].new_bill_number,
            mailingAddress: rawData[0].mailing_address
        };

        // Filter out rows where bill_id is null (in case of LEFT JOIN with no bills)
        const paymentHistory = rawData
            .filter(row => row.bill_id !== null)
            .map(row => ({
                id: row.bill_id,
                totalAmount: row.total_amount,
                paidAmount: row.paid_amount,
                paidDate: row.paid_date,
                previousDues: row.previous_dues,
                currentBalance: row.current_balance
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
