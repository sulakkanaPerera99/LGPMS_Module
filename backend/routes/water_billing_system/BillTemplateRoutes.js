import express from 'express';
import * as waterBillController from '../../controllers/water_billing_system/BillTemplateController.js';
import {getBillHistory} from '../../controllers/water_billing_system/BillTemplateController.js';
const router = express.Router();

// Route to get single bill details by ID
// Example Usage: GET /api/water-bills/15
router.get('/water-bills/:id', waterBillController.getBillDetails);
router.get('/water-bill-history/:accountId', getBillHistory);

export default router;