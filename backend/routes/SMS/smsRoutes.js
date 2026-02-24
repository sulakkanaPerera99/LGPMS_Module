import express from 'express';
import { sendCustomMessage, saveConfiguration, getConfiguration } from '../../controllers/SMS/smsController.js';

const router = express.Router();

// Send SMS
router.post('/send-custom', sendCustomMessage);

// Configuration Routes
router.post('/config', saveConfiguration);       // Save or Update
router.get('/config/:sabha_code', getConfiguration); // Get details

export default router;