import db from '../../config/database.js';

export const getLatestBillByShortNumber = async (shortAccountNumber) => {
    try {
        const query = `
            SELECT id, bill_number, monthly_charge, previous_dues, billing_date, period_from, period_to, previous_reading, current_reading, units_consumed
            FROM water_bills 
            WHERE bill_number LIKE ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        const [rows] = await db.query(query, [`${shortAccountNumber}%`]);
        return rows[0];

    } catch (error) {
        console.error("Database Error in getLatestBillByShortNumber:", error);
        throw error;
    }
};