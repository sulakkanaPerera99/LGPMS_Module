
// ... (getPaymentHistoryByAccountId function එක වෙනස් කිරීමට අවශ්‍ය නැත) ...

export const getPaymentHistoryByAccountId = async (accountId) => {
    const query = `
        SELECT 
            wb.id,
            wb.bill_number,
            wb.paid_date,
            wb.paid_amount,
            wb.total_amount,
            wb.payment_status,
            wca.full_name,
            (wb.total_amount - COALESCE(wb.paid_amount, 0)) AS remaining_due,
            wb.created_at
        FROM 
            water_bills wb
        JOIN 
            water_customer_accounts wca ON wb.account_id = wca.id
        WHERE 
            wb.account_id = ?
        ORDER BY 
            COALESCE(wb.paid_date, wb.created_at) DESC
    `;

    try {
        const [rows] = await db.promise().query(query, [accountId]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// ✅ Updated Search Function
export const getAccountIdBySearchTerm = async (term) => {
    try {
        // 1. Try to find by Account ID, NIC, or Customer Bill Number in customer table
        // මෙතන 'new_bill_number' කියන තැනට ඔබේ table එකේ අදාළ column name එක දාන්න.
        const customerQuery = `
            SELECT id 
            FROM water_customer_accounts 
            WHERE id = ? OR nic = ? OR new_bill_number = ? 
            LIMIT 1
        `;
        
        // term එක තුන් වරක් pass කරන්න ඕන (id, nic, bill_number සඳහා)
        const [customerRows] = await db.promise().query(customerQuery, [term, term, term]);
        
        if (customerRows.length > 0) return customerRows[0].id;

        // 2. Try to find by Specific Invoice Number in bills table (Optional - මේකත් තියෙන එක හොඳයි)
        const billQuery = `SELECT account_id FROM water_bills WHERE bill_number = ? LIMIT 1`;
        const [billRows] = await db.promise().query(billQuery, [term]);

        if (billRows.length > 0) return billRows[0].account_id;

        return null;
    } catch (error) {
        throw error;
    }
};





//controller-------------------


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


//rotes

import express from 'express';
import { 
    getCustomerPaymentHistory
} from '../../controllers/water_billing_system/paymentHistoryController.js';

const router = express.Router();

// 2. අදාල Account එකේ History එක ගන්න Route එක (Account ID එකෙන්)
router.get('/payment-history/:account_id', getCustomerPaymentHistory);

export default router;





export const getCustomersHistoryBySabha = (sabhaCode, projectCode, filters = {}) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT 
                wca.id,
                wca.nic,
                wca.old_bill_number AS oldBillNumber,
                wca.new_bill_number AS newBillNumber,
                wca.full_name AS fullName,
                wca.contact_info AS contactInfo,
                wca.connection_type AS connectionType,
                wca.project_code AS projectCode,
                wca.is_samurdhi AS isSamurdhi,
                wca.samurdhi_number AS samurdhiNumber,
                wca.is_metered AS isMetered,
                wca.status AS status,
                
                -- ✅ FIX 1: current_balance NULL නම් 0 ලෙස එවන්න
                COALESCE(wca.current_balance, 0) AS currentBalance,

                -- ✅ FIX 2: Last Paid Date
                (
                    SELECT paid_date 
                    FROM water_bills wb 
                    WHERE wb.account_id = wca.id 
                    AND wb.paid_amount > 0 
                    ORDER BY wb.paid_date DESC 
                    LIMIT 1
                ) AS lastPaidDate,

                -- ✅ FIX 3: Last Paid Amount NULL නම් 0 ලෙස එවන්න
                COALESCE((
                    SELECT paid_amount 
                    FROM water_bills wb 
                    WHERE wb.account_id = wca.id 
                    AND wb.paid_amount > 0 
                    ORDER BY wb.paid_date DESC 
                    LIMIT 1
                ), 0) AS lastPaidAmount

            FROM water_customer_accounts wca
            WHERE wca.sabha_code = ?
        `;