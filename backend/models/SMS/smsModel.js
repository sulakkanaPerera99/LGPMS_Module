import db from '../../config/database.js';

// 1. SMS Config එකක් තිබේදැයි බැලීම සහ ලබා ගැනීම
export const getSmsConfig = async (sabhaCode) => {
    try {
        const query = "SELECT * FROM sms_configs WHERE sabha_code = ?";
        const [rows] = await db.query(query, [sabhaCode]);
        return rows[0] || null;
    } catch (error) {
        throw error;
    }
};

// 2. SMS Config එකක් Save හෝ Update කිරීම (Upsert Logic)
export const upsertSmsConfig = async (data) => {
    try {
        // පළමුව මෙම සභාවට දැනටමත් Config එකක් තිබේදැයි බලමු
        const existingConfig = await getSmsConfig(data.sabhaCode);

        if (existingConfig) {
            // Update Existing (Password එක හිස් නම් පරණ එකම තියන්න)
            let query = `
                UPDATE sms_configs 
                SET api_url = ?, username = ?, sender_id = ?, status = ?
            `;
            const params = [data.apiUrl, data.username, data.senderId, 1];

            // Password එක අලුතින් එවා ඇත්නම් පමණක් Update කරන්න
            if (data.password && data.password.trim() !== '') {
                query += `, password = ?`;
                params.push(data.password);
            }

            query += ` WHERE sabha_code = ?`;
            params.push(data.sabhaCode);

            const [result] = await db.query(query, params);
            return result;

        } else {
            // Insert New
            const query = `
                INSERT INTO sms_configs (sabha_code, api_url, username, password, sender_id, status)
                VALUES (?, ?, ?, ?, ?, 1)
            `;
            const [result] = await db.query(query, [
                data.sabhaCode, data.apiUrl, data.username, data.password, data.senderId
            ]);
            return result;
        }
    } catch (error) {
        throw error;
    }
};