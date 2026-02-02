import express from 'express';
import { 
    getCustomerPaymentHistory
} from '../../controllers/water_billing_system/paymentHistoryController.js';

const router = express.Router();

// 2. අදාල Account එකේ History එක ගන්න Route එක (Account ID එකෙන්)
router.get('/payment-history/:account_id', getCustomerPaymentHistory);

export default router;