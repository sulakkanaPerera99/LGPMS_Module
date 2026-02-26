import db from '../../config/database.js';
import { sendMobitelSMS } from '../../utils/mobitelSmsService.js';
import * as SmsModel from '../../models/SMS/smsModel.js';
import { encrypt } from '../../utils/cryptoHelper.js';

// 1. Save or Update Configuration
export const saveConfiguration = async (req, res) => {
    const { sabha_code, api_url, username, password, sender_id } = req.body;

    try {
        // 1. මේ සභාවට දැනටමත් config එකක් තියෙනවාද කියා බලන්න
        const [existing] = await db.query("SELECT id FROM sms_configs WHERE sabha_code = ?", [sabha_code]);

        if (existing.length === 0) {
            // 2. අලුතින්ම ඇතුළත් කිරීම (Insert)
            console.log("No existing config. Inserting new record...");
            const encryptedPassword = password ? encrypt(password) : '';
            await db.query(
                `INSERT INTO sms_configs (sabha_code, api_url, username, password, sender_id, status) VALUES (?, ?, ?, ?, ?, 1)`,
                [sabha_code, api_url, username, encryptedPassword, sender_id]
            );
        } else {
            // 3. දැනට ඇති එක වෙනස් කිරීම (Update)
            console.log("Existing config found. Updating...");
            let query;
            let params;

            if (password && password.trim() !== '') {
                const encryptedPassword = encrypt(password);
                query = `UPDATE sms_configs SET api_url=?, username=?, password=?, sender_id=? WHERE sabha_code=?`;
                params = [api_url, username, encryptedPassword, sender_id, sabha_code];
            } else {
                query = `UPDATE sms_configs SET api_url=?, username=?, sender_id=? WHERE sabha_code=?`;
                params = [api_url, username, sender_id, sabha_code];
            }
            await db.query(query, params);
        }

        res.json({ status: 'success', message: 'Configuration saved successfully' });

    } catch (error) {
        console.error("--- SMS CONFIG ERROR ---", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// 2. Get Configuration (To show in UI)
export const getConfiguration = async (req, res) => {
    try {
        const { sabha_code } = req.params;
        const config = await SmsModel.getSmsConfig(sabha_code);

        if (config) {
            // Security: Password එක Front-end එකට යවන්නේ නෑ (හෝ Mask කරලා යවනවා)
            config.password = ''; 
            res.json({ status: 'success', data: config });
        } else {
            res.json({ status: 'success', data: null }); // No config yet
        }

    } catch (error) {
        console.error("Get Config Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch configuration.' });
    }
};

// 3. Send Custom Message (ඔබ එවූ කලින් කේතය එලෙසම)
export const sendCustomMessage = async (req, res) => {
    try {
        const { sabha_code, message, recipient_type, specific_ids } = req.body;

        if (!sabha_code || !message) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        let customers = [];

        // 1. යැවිය යුතු පාරිභෝගිකයින් තෝරා ගැනීම
        if (recipient_type === 'SPECIFIC' && Array.isArray(specific_ids)) {
            if(specific_ids.length === 0) return res.json({ status: 'success', message: 'No recipients selected.' });

            const placeholders = specific_ids.map(() => '?').join(',');
            const query = `SELECT id, contact_info FROM water_customer_accounts WHERE id IN (${placeholders}) AND sabha_code = ?`;
            const params = [...specific_ids, sabha_code];
            const [rows] = await db.query(query, params);
            customers = rows;

        } else {
            const [rows] = await db.query(
                "SELECT id, contact_info FROM water_customer_accounts WHERE sabha_code = ? AND status = 1", 
                [sabha_code]
            );
            customers = rows;
        }

        // 2. SMS යැවීම
        let count = 0;
        
        // Background Process ලෙස යැවීම (Await නොකර)
        customers.forEach((customer) => {
        let phoneNumber = customer.contact_info; 

        if (phoneNumber) {
            // --- 🟢 Phone Number Formatting Logic ---
            // මුලින්ම හිස්තැන් හෝ dash (-) තිබේ නම් ඒවා ඉවත් කරන්න
            phoneNumber = phoneNumber.toString().trim().replace(/[-\s]/g, '');

            if (phoneNumber.startsWith('0')) {
                // 0771234567 -> 94771234567
                phoneNumber = '94' + phoneNumber.substring(1);
            }

            setTimeout(() => {
                console.log(`Sending SMS to: ${phoneNumber}`); 
                sendMobitelSMS(sabha_code, phoneNumber, message)
                    .then(res => console.log(`Sent Success to ${phoneNumber}`))
                    .catch(err => console.error(`Failed to send to ${phoneNumber}:`, err));
            }, count * 200); 
            count++;
        }
    });

        return res.json({ 
            status: 'success', 
            message: `SMS process initiated for ${customers.length} customers.` 
        });

    } catch (error) {
        console.error("Bulk SMS Error:", error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};