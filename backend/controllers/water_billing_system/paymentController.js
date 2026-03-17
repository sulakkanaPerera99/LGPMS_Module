import db from '../../config/database.js';
import * as paymentModel from "../../models/water_billing_system/paymentModel.js";
import { sendMobitelSMS } from "../../utils/mobitelSmsService.js";
import { calculateDynamicAmount } from '../../utils/BillCalculator.js';

const calculateTariffsForDate = ({ paymentDate, currentBillAmount, arrearsAmount, fineRules, discountRules }) => {
    let totalFines = 0;
    let totalDiscounts = 0;
    const today = new Date(paymentDate);
    const currentDayOfMonth = today.getDate();
    const totalOutstanding = currentBillAmount + arrearsAmount;

    // --- Fines Calculation ---
    if (fineRules && Array.isArray(fineRules)) {
        fineRules.forEach(rule => {
            let amountToFine = 0;

            // 1. පරණ හිඟ මුදල් (Arrears) තිබේ නම් ඒ මුළු මුදලටම දඩය බලපායි
            if (arrearsAmount > 0) {
                amountToFine += arrearsAmount;
            }

            // 2. අද දිනය නියමිත දිනට වඩා වැඩි නම් පමණක් වර්තමාන බිල්පත දඩයට යටත් කරයි
            const isPastDueDate = rule.date && currentDayOfMonth > rule.date;
            if (isPastDueDate && currentBillAmount > 0) {
                amountToFine += currentBillAmount;
            }

            // දඩය ගණනය කරන්නේ අදාල කරගත් මුදලට (Arrears පමණක් හෝ Arrears + Current) පමණි
            if (amountToFine > 0) {
                totalFines += calculateDynamicAmount([rule], amountToFine);
            }
        });
    }

    // --- Discounts Calculation ---
    if (discountRules && Array.isArray(discountRules)) {
        discountRules.forEach(rule => {
            if (rule.date && currentDayOfMonth <= rule.date) {
                totalDiscounts += calculateDynamicAmount([rule], currentBillAmount);
            }
        });
    }

    const netPayableAmount = totalOutstanding + totalFines - totalDiscounts;
    return {
        appliedFines: totalFines,
        appliedDiscounts: totalDiscounts,
        netPayableAmount: netPayableAmount
    };
};

export const getCalculatedPaymentDetails = async (req, res) => {
    try {
        const { account_id, payment_date, fine_rules, discount_rules } = req.body;
        const today = new Date(payment_date);

        // 1. Account එක පරීක්ෂා කිරීම (Account Exist ද බැලීමට පමණක් අවශ්‍ය නම්)
        const [accounts] = await db.query("SELECT id FROM water_customer_accounts WHERE id = ?", [account_id]);
        if (accounts.length === 0) return res.status(404).json({ status: 'error', message: 'Account not found.' });

        // 2. නොගෙවූ බිල්පත් ලබා ගැනීම
        const pendingBills = await paymentModel.getPendingBillsByAccount(db, account_id);
        let currentBillAmount = 0;
        let arrearsAmount = 0;

        pendingBills.forEach((bill, index) => {
            // වැදගත්ම දේ: cumulative total_amount එක වෙනුවට monthly_charge එක පාවිච්චි කරන්න
            // (ඔබේ DB එකේ තියෙන column name එක 'monthly_charge' නම් මෙය භාවිතා කරන්න)
            const monthCharge = parseFloat(bill.monthly_charge) || 0; 
            const paid = parseFloat(bill.paid_amount) || 0;
            const outstanding = monthCharge - paid;
            
            // බිල්පතේ දිනය අද දිනයට වඩා පරණ නම් එය Arrears වලට දානවා
            // හැබැයි array එකේ අන්තිමටම තියෙන බිල (Latest Bill) Current Bill එක විදියට සලකන්න පුළුවන්
            const isLatestBill = index === pendingBills.length - 1;

            if (!isLatestBill && new Date(bill.period_to || bill.billing_date) < today) {
                arrearsAmount += outstanding;
            } else {
                currentBillAmount += outstanding;
            }
        });

        // 3. Frontend එකෙන් එවන ලද Rules භාවිතයෙන් ගණනය කිරීම
        const tariffResult = calculateTariffsForDate({
            paymentDate: payment_date,
            currentBillAmount: currentBillAmount,
            arrearsAmount: arrearsAmount,
            fineRules: fine_rules || [],      // Request එකෙන් ගත් අගයන්
            discountRules: discount_rules || [] // Request එකෙන් ගත් අගයන්
        });

        // 4. අවසන් ප්‍රතිඵලය යැවීම
        return res.status(200).json({ 
            status: 'success', 
            data: { 
                ...tariffResult, 
                baseArrears: arrearsAmount, 
                baseCurrent: currentBillAmount 
            }
        });
    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

export const getEmpRates = async (req, res) => {
    try {
        const { sabha_code, emp_nic } = req.params;
        if (!sabha_code || !emp_nic) return res.status(400).json({ status: 'error', message: 'Sabha Code and NIC are required' });
        const rates = await paymentModel.fetchEmpSbRates(sabha_code, emp_nic);
        return res.status(200).json({ status: 'success', data: rates });
    } catch (error) {
        console.error("Controller Error (getEmpRates):", error);
        return res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};

export const processPayment = async (req, res) => {
    try {
        const { account_id, account_number, payment_amount, breakdowns, sub_nic, paymonth } = req.body;
        if (!account_id || !payment_amount || !breakdowns || breakdowns.length === 0) {
            return res.status(400).json({ status: 'error', message: "Invalid payment data." });
        }
        const customerDetails = await paymentModel.getCustomerDetails(account_id);
        if (!customerDetails) return res.status(404).json({ status: 'error', message: "Customer not found." });

        let savedRecords = [];
        let arrearsAmt = 0, finesAmt = 0, currentBillAmt = 0, excessAmt = 0;

        for (const item of breakdowns) {
            if (item.amount > 0 && item.sb_rate_head) {
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

        return res.status(200).json({
            status: 'success',
            message: `Processed ${savedRecords.length} records.`,
            invoiceIds: savedRecords
        });
    } catch (error) {
        console.error("Controller Error (processPayment):", error);
        return res.status(500).json({ status: 'error', message: 'Payment processing failed.' });
    }
};

export const getAccountSpecificTariffDetails = async (req, res) => {
    try {
        const { account_id } = req.params;
        const [account] = await db.query(`SELECT sabha_code, project_code, connection_type, is_samurdhi, is_metered FROM water_customer_accounts WHERE id = ?`, [account_id]);
        if (account.length === 0) return res.status(404).json({ status: 'error', message: 'Account not found' });
        
        const data = account[0];
        const query = `SELECT discounts, fines FROM water_billing_configurations WHERE sabha_code = ? AND connection_type = ? AND status = 1 AND (project_code <=> ?) AND (is_samurdhi <=> ?) AND (is_metered <=> ?)`;
        const [configs] = await db.query(query, [data.sabha_code, data.connection_type, data.project_code, data.is_samurdhi, data.is_metered]);
        
        if (configs.length === 0) return res.status(404).json({ status: 'error', message: 'No configuration found' });

        const discounts = typeof configs[0].discounts === 'string' ? JSON.parse(configs[0].discounts) : (configs[0].discounts || []);
        const fines = typeof configs[0].fines === 'string' ? JSON.parse(configs[0].fines) : (configs[0].fines || []);

        res.json({ status: 'success', data: { discounts, fines } });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};