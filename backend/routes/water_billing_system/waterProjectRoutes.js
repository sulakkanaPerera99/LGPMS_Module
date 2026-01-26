import express from "express";
import { addWaterProject, getSabhaProjects, getProjectList } from "../../controllers/water_billing_system/waterProjectsController.js";


const router = express.Router();

// දත්ත ඇතුලත් කිරීමට
router.post('/water-projects', addWaterProject);

// දත්ත ලබා ගැනීමට (සභා කේතය අනුව)
router.get('/water-projects/:sabha_code', getSabhaProjects);

// Dropdown සඳහා Project List එක ලබා ගැනීමට
router.get('/water-project-list/:sabha_code', getProjectList);

export default router;