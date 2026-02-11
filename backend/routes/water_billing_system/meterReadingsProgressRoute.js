
import express from 'express';
import { getProjectProgressController } from '../../controllers/water_billing_system/meterReadingsProgressController.js'; 
// ⚠️ ඉහත path එක ඔයාගේ controller file එක තියෙන තැනට හරියටම ගැලපෙන්න ඕන.

const router = express.Router();

// GET request එකක් විදියට දත්ත ගන්න නිසා
router.get('/water-project-progress', getProjectProgressController);

export default router;