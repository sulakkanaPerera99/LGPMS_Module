import db from '../../config/database.js';
import * as paymentModel from '../../models/water_billing_system/paymentModel.js';

export const processPayment = async (req, res) => {
    // Input: Receive bill_id, account_id, payment_amount, and apply_discount
    // Support both snake_case (DB/API standard) and camelCase (Frontend standard)
    const bill_id = req.body.bill_id || req.body.billId;
    const account_id = req.body.account_id || req.body.accountId;
    
    let payment_amount = req.body.payment_amount;
    if (payment_amount === undefined) payment_amount = req.body.paymentAmount;

    let apply_discount = req.body.apply_discount;
    if (apply_discount === undefined) apply_discount = req.body.applyDiscount;

    console.log("Processing payment request:", { bill_id, account_id, payment_amount });

    // Basic Validation
    if (!bill_id || !account_id || payment_amount === undefined || Number(payment_amount) <= 0) {
        return res.status(400).json({ success: false, message: "Invalid input data. Bill ID, Account ID, and a positive Payment Amount are required." });
    }

    // Get a connection from the pool to ensure transaction safety
    let connection;
    try {
        connection = db.promise();
    } catch (err) {
        console.error("Database connection failed:", err);
        return res.status(500).json({ success: false, message: "Database connection failed.", error: err.message });
    }

    try {
        // Transaction Safety: Start Transaction
        await connection.beginTransaction();

        // Step 1: Fetch the bill details
        const bill = await paymentModel.getBillById(connection, bill_id);
        
        if (!bill) {
            throw new Error(`Bill not found for ID: ${bill_id}`);
        }

        // Step 2: Discount Logic
        let discountAmount = 0;
        if (apply_discount) {
            const config = await paymentModel.getDiscountByTariff(connection, bill.tariff_id);
            
            if (config && config.discounts) {
                // Handle JSON parsing if stored as string, or use directly if object
                let discounts = config.discounts;
                if (typeof discounts === 'string') {
                    try {
                        discounts = JSON.parse(discounts);
                    } catch (e) {
                        console.warn("Failed to parse discounts JSON:", e);
                        discounts = [];
                    }
                }

                // Logic to extract the discount value. 
                if (Array.isArray(discounts)) {
                    discountAmount = discounts.reduce((sum, item) => sum + (Number(item.amount) || Number(item) || 0), 0);
                } else if (typeof discounts === 'object') {
                    discountAmount = Number(discounts.amount) || 0;
                } else {
                    discountAmount = Number(discounts) || 0;
                }
            }
        }

        // Step 3: Calculations
        const currentPaidAmount = Number(bill.paid_amount) || 0;
        const paymentAmountNum = Number(payment_amount);
        const totalAmount = Number(bill.total_amount);

        // Final Total = total_amount - discount_amount
        const finalTotal = totalAmount - discountAmount;

        // Calculate New Paid Amount (Cumulative)
        const newPaidAmount = currentPaidAmount + paymentAmountNum;

        // Remaining Balance
        const remainingBalance = finalTotal - newPaidAmount;

        // Status Determination
        // Using a small buffer (0.5) to handle floating point errors
        const paymentStatus = remainingBalance <= 0.5 ? 'Paid' : 'Partial';

        // Step 4: Updates
        
        // Update water_bills
        await paymentModel.updateBillPayment(
            connection, 
            bill_id, 
            newPaidAmount, 
            paymentStatus, 
            discountAmount
        );

        // Update water_customer_accounts
        // Updating current_balance with the calculated Remaining Balance
        await paymentModel.updateCustomerBalance(connection, account_id, remainingBalance);

        // Commit the transaction
        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            data: {
                billId: bill_id,
                paidAmount: newPaidAmount,
                remainingBalance: remainingBalance,
                status: paymentStatus,
                discountApplied: discountAmount
            }
        });

    } catch (error) {
        // Rollback if any step fails
        if (connection) await connection.rollback();
        console.error("Payment processing error:", error);
        return res.status(500).json({ success: false, message: "Payment processing failed", error: error.message });
    } finally {
        // Release the connection back to the pool
        if (connection && typeof connection.release === 'function') {
            try {
                connection.release();
            } catch (e) {
                // Ignore error if connection is not from a pool (single connection)
            }
        }
    }
};