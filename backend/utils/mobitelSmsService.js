import axios from 'axios';
import db from '../config/database.js';

const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '94' + cleaned.substring(1);
    }
    return cleaned;
};

export const sendMobitelSMS = async (sabhaCode, mobileNumber, message) => {
    try {
        const [configs] = await db.query(
            "SELECT * FROM sms_configs WHERE sabha_code = ? AND status = 1", 
            [sabhaCode]
        );

        if (configs.length === 0) {
            console.error(`[SMS DEBUG] Config not found for Sabha: ${sabhaCode}`);
            return { success: false, message: "Configuration not found" };
        }

        const config = configs[0];
        const formattedMobile = formatPhoneNumber(mobileNumber);

        // API එක බලාපොරොත්තු වන පරාමිතීන් (Query Parameters)
        const params = new URLSearchParams({
            u: config.username,
            p: config.password,
            a: config.sender_id,
            r: formattedMobile,
            m: message, // Axios විසින් මෙය ස්වයංක්‍රීයව encode කරයි, නමුත් URLSearchParams වඩාත් සුරක්ෂිතයි
            t: 0
        });

        const fullUrl = `${config.api_url}?${params.toString()}`;
        //console.log(`[SMS DEBUG] Attempting to send via: ${fullUrl}`);

        // Axios GET request එක full URL එක සමඟ යවන්න
        const response = await axios.get(fullUrl);

        /* Mobitel Response eka terminal eke print karanna
        console.log("--- Mobitel API Response Start ---");
        console.log("Status Code:", response.status);
        console.log("Data:", response.data); 
        console.log("--- Mobitel API Response End ---");*/

        // Mobitel eken '0' enne nathuwa wena ekak awoth eka failed widiyata log karamu
        const apiStatus = (response.status === 200 && String(response.data).trim() === '0') ? 'SENT' : 'FAILED';

        await db.query(
            "INSERT INTO sms_logs (sabha_code, mobile_number, message, status, api_response) VALUES (?, ?, ?, ?, ?)",
            [sabhaCode, formattedMobile, message, apiStatus, String(response.data)]
        );

        return { success: true, data: response.data };

    } catch (error) {
        console.error("[SMS DEBUG] Axios Error:", error.message);
        return { success: false, error: error.message };
    }
};