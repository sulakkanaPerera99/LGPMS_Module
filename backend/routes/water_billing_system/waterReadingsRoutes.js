import express from "express";
import { getPendingCustomersController, saveBatchReadingsController, getProjectCodesController, generateUnmeteredBills } from "../../controllers/water_billing_system/waterReadingsController.js";

const router = express.Router();

// Get project codes
router.get('/project-codes', getProjectCodesController);

// Get pending customers for readings
router.get('/pending-customers', getPendingCustomersController);

// Save batch readings
router.post('/batch', saveBatchReadingsController);

//Un metered readings
router.post('/generate-unmetered-bills', generateUnmeteredBills);

export default router;
