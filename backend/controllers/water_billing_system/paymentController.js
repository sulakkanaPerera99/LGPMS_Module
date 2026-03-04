/*
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
import * as paymentModel from "../../models/water_billing_system/paymentModel.js";
import { sendMobitelSMS } from "../../utils/mobitelSmsService.js";

// ✅ 1. Employee Rate Heads යැවීමේ Endpoint එක
export const getEmpRates = async (req, res) => {
    try {
        const { sabha_code, emp_nic } = req.params;

        if (!sabha_code || !emp_nic) {
            return res.status(400).json({ status: 'error', message: 'Sabha Code and NIC are required' });
        }

        const rates = await paymentModel.fetchEmpSbRates(sabha_code, emp_nic);
        return res.status(200).json({ status: 'success', data: rates });

    } catch (error) {
        console.error("Controller Error (getEmpRates):", error);
        return res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

// ✅ 2. Payment Process කිරීම (Array එකක් ලෙස භාර ගැනීම)
export const processPayment = async (req, res) => {
    try {
        const { account_id, account_number, payment_amount, breakdowns, sub_nic, paymonth } = req.body;

        if (!account_id || !payment_amount || !breakdowns || breakdowns.length === 0) {
            return res.status(400).json({ status: 'error', message: "Invalid payment data." });
        }

        const customerDetails = await paymentModel.getCustomerDetails(account_id);
        if (!customerDetails) {
            return res.status(404).json({ status: 'error', message: "Customer not found." });
        }

        let savedRecords = [];
        
        // SMS එකට අවශ්‍ය දත්ත ගබඩා කර ගැනීමට variables
        let arrearsAmt = 0;
        let finesAmt = 0;
        let currentBillAmt = 0;
        let excessAmt = 0;

        for (const item of breakdowns) {
            if (item.amount > 0 && item.sb_rate_head) {
                // SMS එක සඳහා කාණ්ඩය අනුව මුදල් එකතු කිරීම
                // මෙහි 'category' යන්න ඔබේ Front-end එකෙන් එන නමට අනුව ගලපා ගන්න
                const cat = item.category.toLowerCase();
                if (cat.includes('arrears')) arrearsAmt += item.amount;
                else if (cat.includes('fine')) finesAmt += item.amount;
                else if (cat.includes('current')) currentBillAmt += item.amount;
                else if (cat.includes('excess')) excessAmt += item.amount;

                const invoiceData = {
                    sabha_code: customerDetails.sabha_code,
                    cus_nic: account_number,
                    cus_name: customerDetails.full_name,
                    cus_contact: customerDetails.contact_no || "",
                    cus_address: customerDetails.address || customerDetails.mailing_address,
                    sb_rate_head: item.sb_rate_head,
                    description: `
Payment details for A/C: ${account_number}.
Total amount to pay: Rs.${payment_amount.toFixed(2)}

Breakdown:
- Arrears: Rs.${arrearsAmt.toFixed(2)}
- Fines: Rs.${finesAmt.toFixed(2)}
- Current Bill: Rs.${currentBillAmt.toFixed(2)}
- Excess: Rs.${excessAmt.toFixed(2)}`,
                    amount: item.amount,
                    stamp: 0,
                    discount: 0,
                    shoptotalarrears: 0,
                    paymonth: paymonth || new Date().toISOString().slice(0, 7),
                    vat: 0,
                    shopdid: 0,
                    sub_nic: sub_nic,
                };

                const result = await paymentModel.saveTemporaryInvoice(invoiceData);
                savedRecords.push(result.insertId);
            }
        }

        // --- SMS යැවීමේ කොටස ආරම්භය ---
        if (savedRecords.length > 0) {
            try {
                const contactNo = customerDetails.contact_no;
                const sabhaCode = customerDetails.sabha_code;

                if (contactNo) {
                    const smsMsg =
`Dear ${customerDetails.full_name},
Payment details for A/C: ${account_number}.
Total amount to pay: Rs.${payment_amount.toFixed(2)}

Breakdown:
- Arrears: Rs.${arrearsAmt.toFixed(2)}
- Fines: Rs.${finesAmt.toFixed(2)}
- Current Bill: Rs.${currentBillAmt.toFixed(2)}
- Excess: Rs.${excessAmt.toFixed(2)}

Please kindly visit the cashier to pay the relevant charges for your bill.
Thank you!
${sabhaCode} Water Board`.trim();

                    // ඔබ පාවිච්චි කරන SMS utility එක මෙහිදී කැඳවන්න
                    sendMobitelSMS(sabhaCode, contactNo, smsMsg)
                        .then(() => console.log(`Payment SMS sent to ${contactNo}`))
                        .catch(err => console.error("Payment SMS Error:", err));
                }
            } catch (smsErr) {
                console.error("SMS Generation Error:", smsErr);
            }
        }
        // --- SMS යැවීමේ කොටස අවසානය ---

        return res.status(200).json({
            status: 'success',
            message: `Payment processed successfully. Saved ${savedRecords.length} records and SMS sent.`,
            invoiceIds: savedRecords
        });

    } catch (error) {
        console.error("Controller Error (processPayment):", error);
        return res.status(500).json({ status: 'error', message: 'Payment processing failed.' });
    }
};
// discounts and fines fetching
export const getAccountSpecificTariffDetails = async (req, res) => {
    try {
        const { account_id } = req.params;
        
        // 1. මුලින්ම පාරිභෝගිකයාගේ වර්තමාන තොරතුරු ලබා ගන්න
        const [account] = await db.query(`
            SELECT sabha_code, project_code, connection_type, is_samurdhi, is_metered 
            FROM water_customer_accounts 
            WHERE id = ?`, [account_id]);

        if (account.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Account not found' });
        }

        const data = account[0];

        // 2. එම දත්ත වලට ගැලපෙන Configuration එක සොයන්න (ඔබේ calculateBill එකේ ඇති Query එකමයි)
        // Updated to use NULL-safe comparison (<=>) to handle NULL values properly
        const query = `
            SELECT discounts, fines FROM water_billing_configurations 
            WHERE sabha_code = ? 
            AND connection_type = ? 
            AND status = 1 
            AND (project_code <=> ?)
            AND (is_samurdhi <=> ?)
            AND (is_metered <=> ?)
        `;

        const [configs] = await db.query(query, [
            data.sabha_code,
            data.connection_type,
            data.project_code,
            data.is_samurdhi,
            data.is_metered
        ]);

        if (configs.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No configuration found' });
        }

        // 3. JSON දත්ත Parse කර පිරිසිදු ලැයිස්තුවක් ලෙස යවන්න
        const config = configs[0];
        const discounts = typeof config.discounts === 'string' ? JSON.parse(config.discounts) : (config.discounts || []);
        const fines = typeof config.fines === 'string' ? JSON.parse(config.fines) : (config.fines || []);

        res.json({
            status: 'success',
            data: {
                discounts: discounts,
                fines: fines
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};