import express from 'express';
import { getWaterCustomers, getProjectList, getBillDetails} from '../../controllers/water_billing_system/waterBillPaymentController.js';

const router = express.Router();

// Route to fetch active customers for bill payment
// Using a specific path to avoid conflict with general customer management routes
router.get('/water-payment-customers/:sabha_code', getWaterCustomers);

// Route to fetch projects for the filter dropdown
router.get('/water-payment-projects/:sabha_code', getProjectList);

router.get('/water-bill-details/:bill_number', getBillDetails);

export default router;
