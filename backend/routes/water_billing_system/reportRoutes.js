import express from 'express';
import { getProjectCollectionReport } from '../../controllers/water_billing_system/reportController.js';

const router = express.Router();

// Route: /api/reports/projects/:sabha_code
router.get('/projects/:sabha_code', getProjectCollectionReport);

export default router;