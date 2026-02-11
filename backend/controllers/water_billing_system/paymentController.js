/*import db from '../../config/database.js';
import * as paymentModel from '../../models/water_Billing_System/paymentModel.js';

export const processPayment = async (req, res) => {
    // Input Validation
    const account_id = req.body.account_id || req.body.accountId;
    let payment_amount = Number(req.body.payment_amount || req.body.paymentAmount);

    console.log("Processing Account Payment (Single Connection):", { account_id, payment_amount });

    if (!account_id || payment_amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid Input: Account ID and positive Amount required." });
    }

    // Single Connection එක කෙලින්ම ගන්නවා
    const connection = db.promise();

    try {
        // 1. Transaction Start
        // Single Connection එකේදී Transaction පටන් ගත්තම, වෙනත් අයගේ Requests පෝලිමේ (Queue) තියෙන්න පුළුවන්.
        await connection.beginTransaction();

        // Step 1: Get all pending bills
        const pendingBills = await paymentModel.getPendingBillsByAccount(connection, account_id);
        
        let remainingPayment = payment_amount;
        let billsPaidCount = 0;

        // Step 2: FIFO Loop (මුදල් බෙදා හැරීම)
        for (const bill of pendingBills) {
            if (remainingPayment <= 0) break;

            const billTotal = Number(bill.total_amount);
            const alreadyPaid = Number(bill.paid_amount);
            const outstandingForThisBill = billTotal - alreadyPaid;

            let amountAllocated = 0;
            let newStatus = bill.payment_status;

            if (remainingPayment >= outstandingForThisBill) {
                // Full Payment for this bill
                amountAllocated = outstandingForThisBill;
                remainingPayment -= outstandingForThisBill;
                newStatus = 'Paid';
            } else {
                // Partial Payment
                amountAllocated = remainingPayment;
                remainingPayment = 0;
                newStatus = 'Partial';
            }

            // Update bill
            const newPaidTotal = alreadyPaid + amountAllocated;
            await paymentModel.updateBillPayment(connection, bill.id, newPaidTotal, newStatus);
            billsPaidCount++;
        }

        // Step 3: Update Customer Balance
        await paymentModel.updateCustomerBalance(connection, account_id, payment_amount);

        // Commit Transaction (වෙනස්කම් ස්ථිර කිරීම)
        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            data: {
                accountId: account_id,
                totalPaid: payment_amount,
                remainingOverpayment: remainingPayment > 0 ? remainingPayment : 0, 
                billsAffected: billsPaidCount
            }
        });

    } catch (error) {
        // Error එකක් ආවොත් ආපස්සට (Rollback) ගන්නවා
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
        }
        
        console.error("Payment Error:", error);
        return res.status(500).json({ success: false, message: "Payment failed", error: error.message });
    } 
    // වැදගත්: මෙතන 'finally' බ්ලොක් එකක් දාලා connection.release() කරන්නේ නෑ.
    // මොකද මේක Single Connection එකක් නිසා දිගටම Open වෙලා තියෙන්න ඕනේ.
};
*/
import db from '../../config/database.js';
import * as paymentModel from '../../models/water_Billing_System/paymentModel.js';

export const processPayment = async (req, res) => {
    try {
        // 1. Input Validation
        const account_id = req.body.account_id || req.body.accountId;
        let payment_amount = Number(req.body.payment_amount || req.body.paymentAmount);
        
        // ---------------------------------------------------------
        // ✅ UPDATE: Officer NIC ලබා ගැනීම (Frontend Support + Security)
        // ---------------------------------------------------------
        
        let sub_nic = null;

        // ක්‍රමය 1: Middleware (req.user) හරහා බලනවා
        if (req.user) {
            sub_nic = req.user.nic || req.user.emp_nic || req.user.id;
        }

        // ක්‍රමය 2: Middleware නැත්නම්, Frontend එකෙන් එවපු 'sub_nic' එක ගන්නවා
        if (!sub_nic && req.body.sub_nic) {
            sub_nic = req.body.sub_nic;
        }

        // NIC එක හොයාගන්න බැරි නම් Error එකක් යවනවා
        if (!sub_nic) {
            return res.status(400).json({ 
                success: false, 
                message: "Officer NIC (sub_nic) is missing. Please login again or check the request." 
            });
        }

        console.log("Using Officer NIC:", sub_nic);

        // ---------------------------------------------------------

        // Pay Month
        const paymonth = req.body.paymonth || new Date().toISOString().slice(0, 7); // YYYY-MM format

        if (!account_id || payment_amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid Input: Account ID and positive Amount required." });
        }

        // 2. Customer Details ලබා ගැනීම
        const customerDetails = await paymentModel.getCustomerDetails(account_id);

        if (!customerDetails) {
            return res.status(404).json({ success: false, message: "Customer not found for this Account ID." });
        }

        // 3. Data Object එක සකස් කිරීම
        const invoiceData = {
            sabha_code: customerDetails.sabha_code,
            cus_nic: customerDetails.nic_number,
            cus_name: customerDetails.full_name,
            cus_contact: customerDetails.contact_no || "",
            cus_address: customerDetails.address,
            sb_rate_head: customerDetails.rate_head || "WATER", // Model එකේ subquery එකෙන් එන අගය
            description: "Water Bill Payment",
            amount: payment_amount,
            stamp: 0,              
            discount: 0,           
            shoptotalarrears: 0,   
            paymonth: paymonth,
            vat: 0,                
            shopdid: 0,            
            sub_nic: sub_nic,      
        };

        // 4. Save to tempory_invoice table
        await paymentModel.saveTemporaryInvoice(invoiceData);

        return res.status(200).json({
            success: true,
            message: "Payment details saved to temporary invoice successfully.",
            data: invoiceData
        });

    } catch (error) {
        console.error("Temporary Invoice Save Error:", error);
        return res.status(500).json({ success: false, message: "Failed to save invoice", error: error.message });
    }
};