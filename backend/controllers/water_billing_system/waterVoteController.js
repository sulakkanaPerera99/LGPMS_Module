import db from '../../config/database.js';

// 1. Configuration eka Save kirima ho Update kirima
export const configureVotes = async (req, res) => {
    const { sabha_code, fine_vote, arrears_vote, current_vote, excess_vote, user_nic } = req.body;

    if (!sabha_code || !fine_vote || !arrears_vote || !current_vote || !excess_vote) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Sabha code eka thiyeda balanna
        const [existing] = await db.execute('SELECT id FROM water_vote_configs WHERE sabha_code = ?', [sabha_code]);

        if (existing.length > 0) {
            // Thiyenawanam Update karanna
            await db.execute(
                `UPDATE water_vote_configs 
                 SET fine_vote=?, arrears_vote=?, current_vote=?, excess_vote=?, updated_by=? 
                 WHERE sabha_code=?`,
                [fine_vote, arrears_vote, current_vote, excess_vote, user_nic , sabha_code]
            );
        } else {
            // Nathnam Aluthin hadanna
            await db.execute(
                `INSERT INTO water_vote_configs 
                 (sabha_code, fine_vote, arrears_vote, current_vote, excess_vote, created_by, updated_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [sabha_code, fine_vote, arrears_vote, current_vote, excess_vote, user_nic , user_nic]
            );
        }

        res.status(200).json({ success: true, message: "Configuration saved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// 2. Sabha code eka anuwa data gannawa
export const getConfig = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM water_vote_configs WHERE sabha_code = ?', [req.params.sabha_code]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json(null);
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching config" });
    }
};