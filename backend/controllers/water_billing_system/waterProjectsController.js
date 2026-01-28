import { insertProject, getProjectsBySabha, getProjectList as getProjectListModel } from "../../models/water_Billing_System/waterprojectsModel.js";

// --- Create New Project ---
export const addWaterProject = (req, res) => {
    const { name, code, number, sabha_code } = req.body;

    // Validation: අවශ්‍ය දත්ත තියෙනවද කියලා බලනවා
    if (!name || !code || !sabha_code) {
        return res.status(400).json({
            status: "error",
            message: "Project Name, Code and Sabha Code are required!"
        });
    }

    // Database එකට යවන්න Object එක හදාගන්නවා
    const projectData = {
        sabha_code: sabha_code,
        name: name,
        code: code,
        number: number,
        // created_at එක Database එකෙන් ඉබේම වැටෙනවා
    };

    insertProject(projectData, (err, results) => {
        if (err) {
            return res.status(500).json({ 
                status: "error", 
                message: "Database error occurred." 
            });
        }
        
        // සාර්ථක නම් Frontend එකට ID එකත් එක්ක පණිවිඩය යවනවා
        return res.status(201).json({
            status: "success",
            message: "Project added successfully",
            data: { 
                id: results.insertId, 
                ...projectData 
            }
        });
    });
};

// --- Get All Projects for Sabha ---
export const getSabhaProjects = (req, res) => {
    const sabha_code = req.params.sabha_code;
    const { search, sort } = req.query;

    if (!sabha_code) {
        return res.status(400).json({ message: "Sabha Code is missing" });
    }

    getProjectsBySabha(sabha_code, search, sort, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        return res.json(results);
    });
};

// --- Get Project List for Dropdown ---
export const getProjectList = (req, res) => {
    const sabha_code = req.params.sabha_code;

    if (!sabha_code) {
        return res.status(400).json({ message: "Sabha Code is missing" });
    }

    getProjectListModel(sabha_code, (err, results) => {
        if (err) return res.status(500).send(err);
        return res.json(results);
    });
};