import {

    getPaymentHistoryByAccountId,

    getAccountIdBySearchTerm

} from '../../models/water_billing_system/paymentHistoryModel.js';



export const getCustomerPaymentHistory = async (req, res) => {

    try {

        // We rename the param to 'searchTerm' for clarity,

        // though in routes.js it might still be defined as /:account_id

        // (It's better to keep the route param generic like /:search_term)

        const searchTerm = req.params.account_id || req.params.search_term;



        if (!searchTerm) {

            return res.status(400).json({

                success: false,

                message: "Search term (ID, NIC, or Bill Number) is required"

            });

        }



        // 1. Resolve the Account ID

        const accountId = await getAccountIdBySearchTerm(searchTerm);



        if (!accountId) {

            return res.status(404).json({

                success: false,

                message: "No customer found matching that ID, NIC, or Bill Number."

            });

        }



        // 2. Fetch History using the resolved Account ID

        const history = await getPaymentHistoryByAccountId(accountId);



        return res.status(200).json({

            success: true,

            data: history

        });



    } catch (error) {

        console.error("Error fetching payment history:", error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

            error: error.message

        });

    }

};