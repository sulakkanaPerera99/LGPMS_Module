import { insertProject, getProjectsBySabha, getProjectList as getProjectListModel, updateProjectModel } from "../../models/water_Billing_System/waterprojectsModel.js";

// ✅ Helper Function: Duplicate Error හඳුනා ගැනීමට
const handleDatabaseError = (err, res) => {
    console.error("Database Error:", err);

    // MySQL Duplicate Entry Error Code is 1062 or 'ER_DUP_ENTRY'
    if (err.code === 'ER_DUP_ENTRY') {
        let message = "This record already exists.";

        // Error message එක කියවා බලමු මොන Column එකද ඩ डुප්ලිකේට් වෙලා තියෙන්නේ කියලා
        if (err.sqlMessage.includes("code")) {
            message = "Project Code already exists! Please use a different code.";
        } else if (err.sqlMessage.includes("number")) {
            message = "Project Number already exists! Please use a different number.";
        } else if (err.sqlMessage.includes("name")) {
            message = "Project Name already exists! Please use a different name.";
        }

        // 409 Conflict status යවමු
        return res.status(409).json({ 
            status: "error", 
            message: message,
            error_code: "DUPLICATE_ENTRY"
        });
    }

    return res.status(500).json({ 
        status: "error", 
        message: "Database error occurred." 
    });
};


// --- Create New Project ---
export const addWaterProject = (req, res) => {
    const { name, code, number, sabha_code } = req.body;

    if (!name || !code || !sabha_code) {
        return res.status(400).json({ status: "error", message: "Project Name, Code and Sabha Code are required!" });
    }

    const projectData = {
        sabha_code: sabha_code,
        name: name,
        code: code,
        number: number,
    };

    insertProject(projectData, (err, results) => {
        //ERROR HANDLING
        if (err) return handleDatabaseError(err, res);
        
        return res.status(201).json({
            status: "success",
            message: "Project added successfully",
            data: { id: results.insertId, ...projectData }
        });
    });
};

// --- Get All Projects
export const getSabhaProjects = (req, res) => {
    const sabha_code = req.params.sabha_code;
    const { search, sort } = req.query;

    if (!sabha_code) return res.status(400).json({ message: "Sabha Code is missing" });

    getProjectsBySabha(sabha_code, search, sort, (err, results) => {
        if (err) return res.status(500).send(err);
        return res.json(results);
    });
};

// --- Get Project List
export const getProjectList = (req, res) => {
    const sabha_code = req.params.sabha_code;
    if (!sabha_code) return res.status(400).json({ message: "Sabha Code is missing" });

    getProjectListModel(sabha_code, (err, results) => {
        if (err) return res.status(500).send(err);
        return res.json(results);
    });
};

// --- Edit/Update Water Project ---
export const editWaterProject = (req, res) => {
    const id = req.params.id;
    const { name, code, number, status, userId } = req.body; 

    if (!id) return res.status(400).json({ status: "error", message: "Project ID is required" });
    if (!name || !code || !number) return res.status(400).json({ status: "error", message: "All fields are required!" });

    const updateData = {
        name: name,
        code: code,
        number: number,
        status: status,
        updated_by: userId
    };

    updateProjectModel(id, updateData, (err, results) => {
        //ERROR HANDLING
        if (err) return handleDatabaseError(err, res);

        if (results.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Project not found." });
        }

        return res.json({
            status: "success",
            message: "Project updated successfully",
            data: { id, ...updateData }
        });
    });
};


