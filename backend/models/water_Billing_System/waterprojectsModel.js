import db from '../../config/database.js';

// For waterProjectsController.js (callback-style)
export const insertProject = (data, callback) => {
    const query = 'INSERT INTO water_projects SET ?';
    db.query(query, data, callback);
};

export const getProjectsBySabha = (sabhaCode, search, sort, callback) => {
    let query = `SELECT p.id, p.sabha_code, p.name, p.code, p.number, COUNT(c.id) as registered_users FROM water_projects p LEFT JOIN water_customer_accounts c ON c.project_code = p.code AND c.sabha_code = p.sabha_code WHERE p.sabha_code = ?`;
    const queryParams = [sabhaCode];

    if (search) {
        query += ' AND (p.name LIKE ? OR p.code LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY p.id, p.sabha_code, p.name, p.code, p.number';

    if (sort) {
        let field = sort;
        let direction = 'ASC';

        if (sort.endsWith('_desc')) {
            field = sort.slice(0, -5);
            direction = 'DESC';
        } else if (sort.endsWith('_asc')) {
            field = sort.slice(0, -4);
            direction = 'ASC';
        }

        query += ` ORDER BY ${db.escapeId(field)} ${direction}`;
    }

    db.query(query, queryParams, callback);
};

export const getProjectList = (sabhaCode, callback) => {
    const query = 'SELECT name, code FROM water_projects WHERE sabha_code = ?';
    db.query(query, [sabhaCode], callback);
};


// For waterCustomerAccountsController.js (Promise-style)
export const getProjectNumberByCode = (projectCode, sabhaCode) => {
    return new Promise((resolve, reject) => {
        // Querying by 'code' column and selecting the 'number' column as project_number
        const query = 'SELECT number as project_number FROM water_projects WHERE code = ? AND sabha_code = ?';
        db.query(query, [projectCode, sabhaCode], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return resolve(null);
            }
            resolve(results[0].project_number);
        });
    });
};

export const updateProjectModel = (id, data, callback) => {
    const query = 'UPDATE water_projects SET ? WHERE id = ?';
    // 'data' කියන object එකේ තියෙන field names, database column names එක්ක සමාන වෙන්න ඕනේ
    db.query(query, [data, id], callback);
};