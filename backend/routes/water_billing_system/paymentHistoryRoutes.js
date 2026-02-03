import express from 'express';
import { 
    getAllCustomers
} from '../../controllers/water_billing_system/paymentHistoryController.js';

const router = express.Router();

// 2. අදාල Sabha එකේ Customers History එක ගන්න Route එක
router.get('/payment-history/:sabha_code', getAllCustomers);

export default router;