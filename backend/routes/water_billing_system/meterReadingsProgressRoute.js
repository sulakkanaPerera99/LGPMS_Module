
import express from 'express';
import { getProjectProgressController } from '../../controllers/water_billing_system/meterReadingsProgressController.js'; 


const router = express.Router();

router.get('/water-project-progress', getProjectProgressController);

export default router;