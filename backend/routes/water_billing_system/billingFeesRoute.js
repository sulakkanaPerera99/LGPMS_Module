// routes/water_billing_system/billingFeesRoute.js

import express from 'express';
import * as billingFeesController from '../../controllers/water_billing_system/billingFeesController.js';

const router = express.Router();

// POST: Add new billing configuration
router.post('/billing-fees', billingFeesController.addConfig);

// GET: Fetch configurations by sabha_code
router.get('/billing-fees/:sabha_code', billingFeesController.getConfigs);

router.put('/billing-fees/:id', billingFeesController.updateConfig);

export default router;