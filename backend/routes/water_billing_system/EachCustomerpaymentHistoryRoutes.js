import express from 'express';
import * as EachCustomerPaymentHistoryController from '../../controllers/water_billing_system/EachCustomerPaymentHistoryController.js';

const router = express.Router();

// Route to get specific customer payment history
router.get('/customer-payment-history/:accountId', EachCustomerPaymentHistoryController.getPaymentHistory);

export default router;
