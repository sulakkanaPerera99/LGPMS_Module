// routes/water_billing_system/billingFeesRoute.js

import express from 'express';
// Controller එක import කරන විට අගට .js දැමීම අනිවාර්යයි
import * as billingFeesController from '../../controllers/water_billing_system/BillingfeesController.js';

const router = express.Router();

// POST: Add new billing configuration
router.post('/billing-fees', billingFeesController.addConfig);

// GET: Fetch configurations by sabha_code
router.get('/billing-fees/:sabha_code', billingFeesController.getConfigs);

export default router;