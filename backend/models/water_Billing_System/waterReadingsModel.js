import db from '../../config/database.js';

/**
 * Retrieves customers who have NOT yet had a meter reading for the specified month/year.
 * It calculates the last known reading to be used as the 'previous reading' for the new entry.
 * * @param {string} sabhaCode 
 * @param {string} projectCode 
 * @param {number} month 
 * @param {number} year 
 * @returns {Promise<Array>} List of pending customers
 */
export const getPendingCustomers = async (sabhaCode, projectCode, month, year) => {
    try {
        const query = `
            SELECT
                c.id as account_id,
                c.new_bill_number as bill_number_ref,
                c.full_name,
                c.sabha_code,
                c.project_code,
                c.contact_info as mobile_number,
                COALESCE(
                    (
                        SELECT current_reading
                        FROM water_meter_readings
                        WHERE account_id = c.id
                        AND reading_status = 1
                        ORDER BY reading_date DESC, id DESC
                        LIMIT 1
                    ), 
                    c.current_reading, 
                    0
                ) as last_reading
            FROM water_customer_accounts c
            LEFT JOIN water_meter_readings r
                ON c.id = r.account_id
                AND r.year = ?
                AND r.month = ?
                AND r.reading_status = 1
            WHERE c.sabha_code = ?
                AND c.project_code = ?
                AND r.id IS NULL
                AND c.status = 1
            ORDER BY c.new_bill_number
        `;

        const [results] = await db.query(query, [year, month, sabhaCode, projectCode]);
        return results;
    } catch (error) {
        throw error;
    }
};

/**
 * Saves a batch of meter readings. 
 * Note: This function is primarily for raw insertion. 
 * However, your Controller logic handles complex insertions one-by-one with billing calculation.
 * If you need a bulk insert helper, this is it.
 * * @param {Array} readings - Array of reading objects
 * @returns {Promise<Object>} - Insert result
 */
export const saveBatchReadings = async (readings) => {
    try {
        if (readings.length === 0) {
            return [];
        }

        // Prepare bulk insert values
        const values = readings.map(reading => [
            reading.account_id,
            reading.bill_number_ref,
            reading.sabha_code,
            reading.project_code,
            reading.reading_date,
            reading.year,
            reading.month,
            reading.previous_reading,
            reading.current_reading,
            reading.reader_id,
            reading.reading_source,
            1 // reading_status = 1 (Active)
        ]);

        const query = `
            INSERT INTO water_meter_readings
            (account_id, bill_number, sabha_code, project_code, reading_date, year, month, previous_reading, current_reading, reader_id, reading_source, reading_status)
            VALUES ?
        `;

        // Bulk insert using [values] array of arrays
        const [result] = await db.query(query, [values]);
        return result;

    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves a list of water projects (code and name) for a specific Sabha.
 * * @param {string} sabhaCode 
 * @returns {Promise<Array>} List of projects
 */
export const getProjectCodes = async (sabhaCode) => {
    try {
        const query = 'SELECT code, name FROM water_projects WHERE sabha_code = ? ORDER BY name';
        const [results] = await db.query(query, [sabhaCode]);
        return results;
    } catch (error) {
        throw error;
    }
};