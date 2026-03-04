import * as billModel from '../../models/water_billing_system/onlineCustomerPaymentModel.js';

export const fetchBillDetails = async (req, res) => {
    try {
        const { accNo } = req.query;

        if (!accNo) {
            return res.status(400).json({ status: 'error', message: 'Account number is required' });
        }

        const bill = await billModel.getLatestBillByShortNumber(accNo);

        if (bill) {
            return res.status(200).json({
                status: 'success',
                data: bill
            });
        } else {
            return res.status(404).json({
                status: 'error',
                message: 'Bill details not found for this account number'
            });
        }

    } catch (error) {
        console.error("Controller Error (fetchBillDetails):", error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};