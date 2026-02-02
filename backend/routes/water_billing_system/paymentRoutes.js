import express from 'express';
import { processPayment } from '../../controllers/water_billing_system/paymentController.js';

const router = express.Router();

// Define the POST route for processing payments
router.post('/payments/process', processPayment);

export default router;
