import express from 'express';
import { registerCustomer, getAllCustomers } from '../../controllers/water_billing_system/waterCustomerAccountsController.js';

const router = express.Router();

// This route path is relative to the prefix set in your main app file (e.g., index.js)
// If app.use('/api', waterCustomerRoutes), the full URL is POST /api/register-customer
router.post('/register-customer', registerCustomer);
router.get('/water-customers/:sabha_code', getAllCustomers);

export default router;
