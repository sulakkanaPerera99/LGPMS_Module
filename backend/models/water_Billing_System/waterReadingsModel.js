import db from '../../config/database.js';

export const getPendingCustomers = (sabhaCode, projectCode, month, year) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                c.id as account_id,
                c.new_bill_number as bill_number_ref,
                c.full_name,
                c.sabha_code,
                c.project_code,
                COALESCE((
                    SELECT current_reading
                    FROM water_meter_readings
                    WHERE account_id = c.id
                    AND reading_status = 1
                    ORDER BY reading_date DESC, id DESC
                    LIMIT 1
                ), 0) as last_reading
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
        db.query(query, [year, month, sabhaCode, projectCode], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

export const saveBatchReadings = (readings) => {
    return new Promise((resolve, reject) => {
        if (readings.length === 0) {
            return resolve([]);
        }

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
            1 // reading_status = 1
        ]);

        const query = `
            INSERT INTO water_meter_readings
            (account_id, bill_number, sabha_code, project_code, reading_date, year, month, previous_reading, current_reading, reader_id, reading_source, reading_status)
            VALUES ?
        `;

        db.query(query, [values], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

export const getProjectCodes = (sabhaCode) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT code, name FROM water_projects WHERE sabha_code = ? ORDER BY name';
        db.query(query, [sabhaCode], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};
