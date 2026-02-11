import express from 'express';
import * as waterBillController from '../../controllers/water_billing_system/BillTemplateController.js';
import {getBillHistory} from '../../controllers/water_billing_system/BillTemplateController.js';
const router = express.Router();

// Route to get single bill details by ID
router.get('/water-bills/:id', waterBillController.getBillDetails);
router.get('/water-bill-history/:accountId', getBillHistory);

export default router;