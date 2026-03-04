import express from 'express';
import { fetchBillDetails } from '../../controllers/water_billing_system/onlineCustomerPaymentController.js';

const router = express.Router();

router.get('/fetch_details', fetchBillDetails);

export default router;