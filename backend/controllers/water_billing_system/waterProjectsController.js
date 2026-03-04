import { 
    insertProject, 
    getProjectsBySabha, 
    getProjectList as getProjectListModel, 
    updateProjectModel 
} from "../../models/water_billing_system/waterprojectsModel.js";

/**
 * Helper Function: Handles database errors, specifically targeting duplicate entries.
 * Returns appropriate HTTP status codes (409 for conflicts, 500 for server errors).
 * * @param {Object} err - The error object returned from the database.
 * @param {Object} res - The response object to send data back to the client.
 */
const handleDatabaseError = (err, res) => {
    console.error("Database Error:", err);

    // MySQL Duplicate Entry Error Code: 1062 or 'ER_DUP_ENTRY'
    if (err.code === 'ER_DUP_ENTRY') {
        let message = "This record already exists.";

        // Identify which field caused the duplication based on the SQL error message
        if (err.sqlMessage && err.sqlMessage.includes("code")) {
            message = "Project Code already exists! Please use a different code.";
        } else if (err.sqlMessage && err.sqlMessage.includes("number")) {
            message = "Project Number already exists! Please use a different number.";
        } else if (err.sqlMessage && err.sqlMessage.includes("name")) {
            message = "Project Name already exists! Please use a different name.";
        }

        return res.status(409).json({ 
            status: "error", 
            message: message,
            error_code: "DUPLICATE_ENTRY"
        });
    }

    // Default server error response
    return res.status(500).json({ 
        status: "error", 
        message: "Internal Server Error. Please try again later.",
        error: err.message 
    });
};


/**
 * Controller: Create New Water Project
 * Method: POST
 */
export const addWaterProject = async (req, res) => {
    const { name, code, number, sabha_code } = req.body;

    // Basic Validation
    if (!name || !code || !sabha_code) {
        return res.status(400).json({ 
            status: "error", 
            message: "Project Name, Code, and Sabha Code are required!" 
        });
    }

    const projectData = {
        sabha_code: sabha_code,
        name: name,
        code: code,
        number: number,
    };

    try {
        // Await the insertion from the model
        const result = await insertProject(projectData);
        
        return res.status(201).json({
            status: "success",
            message: "Project added successfully",
            data: { id: result.insertId, ...projectData }
        });

    } catch (error) {
        return handleDatabaseError(error, res);
    }
};


/**
 * Controller: Get All Projects for a specific Sabha
 * Method: GET
 * Supports search and sorting via query parameters.
 */
export const getSabhaProjects = async (req, res) => {
    const sabha_code = req.params.sabha_code;
    const { search, sort } = req.query;

    if (!sabha_code) {
        return res.status(400).json({ status: "error", message: "Sabha Code is missing" });
    }

    try {
        const results = await getProjectsBySabha(sabha_code, search, sort);
        return res.json(results);
    } catch (error) {
        console.error("Error fetching sabha projects:", error);
        return res.status(500).json({ 
            status: "error", 
            message: "Failed to retrieve projects." 
        });
    }
};


/**
 * Controller: Get a simplified list of Projects (ID & Name only)
 * Method: GET
 * Used for dropdowns or simple listings.
 */
export const getProjectList = async (req, res) => {
    const sabha_code = req.params.sabha_code;

    if (!sabha_code) {
        return res.status(400).json({ status: "error", message: "Sabha Code is missing" });
    }

    try {
        const results = await getProjectListModel(sabha_code);
        return res.json(results);
    } catch (error) {
        console.error("Error fetching project list:", error);
        return res.status(500).json({ 
            status: "error", 
            message: "Failed to retrieve project list." 
        });
    }
};


/**
 * Controller: Edit/Update Water Project Details
 * Method: PUT
 */
export const editWaterProject = async (req, res) => {
    const id = req.params.id;
    const { name, code, number, status, userId } = req.body; 

    // Validation
    if (!id) return res.status(400).json({ status: "error", message: "Project ID is required" });
    if (!name || !code || !number) {
        return res.status(400).json({ status: "error", message: "All fields are required!" });
    }

    const updateData = {
        name: name,
        code: code,
        number: number,
        status: status,
        updated_by: userId
    };

    try {
        const result = await updateProjectModel(id, updateData);

        // Check if any row was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Project not found or no changes made." });
        }

        return res.json({
            status: "success",
            message: "Project updated successfully",
            data: { id, ...updateData }
        });

    } catch (error) {
        return handleDatabaseError(error, res);
    }
};