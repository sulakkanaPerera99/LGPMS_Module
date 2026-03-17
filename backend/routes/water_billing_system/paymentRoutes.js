import express from 'express';
import { processPayment , getEmpRates, getAccountSpecificTariffDetails,getCalculatedPaymentDetails  } from '../../controllers/water_billing_system/paymentController.js';

const router = express.Router();

// Define the POST route for processing payments
router.post('/payments/process', processPayment);
router.get('/emp-rates/:sabha_code/:emp_nic', getEmpRates);
router.get('/account-tariff-details/:account_id', getAccountSpecificTariffDetails);
router.post("/water-billing/calculate-payable", getCalculatedPaymentDetails);

export default router;
