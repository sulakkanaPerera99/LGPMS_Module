import express from 'express';
const router = express.Router();
import * as waterController from '../../controllers/water_billing_system/waterVoteController.js';


// Vue eke axios post ekata:
router.post('/configure', waterController.configureVotes);

// Vue eke axios get ekata:
router.get('/:sabha_code', waterController.getConfig);

export default router;