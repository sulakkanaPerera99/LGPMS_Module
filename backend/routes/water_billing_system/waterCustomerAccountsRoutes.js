import express from 'express';
import { registerCustomer, getAllCustomers, editCustomerDetails ,checkSabhaCustomer } from '../../controllers/water_billing_system/waterCustomerAccountsController.js';

const router = express.Router();

// This route path is relative to the prefix set in your main app file (e.g., index.js)
// If app.use('/api', waterCustomerRoutes), the full URL is POST /api/register-customer
router.post('/register-customer', registerCustomer);
router.get('/water-customers/:sabha_code', getAllCustomers);

// 2. Update Customer Route (PUT method)
// :id කියන්නේ අපි update කරන්න ඕන customer ගේ database ID එක.
router.put('/update-customer/:id', editCustomerDetails);

router.get('/check-sabha-customer/:nic', checkSabhaCustomer);

export default router;
