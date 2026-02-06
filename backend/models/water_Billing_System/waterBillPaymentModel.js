import db from "../../config/database.js";

// Fetch customers with filtering, sorting, and search
export const fetchCustomersModel = async (sabha_code, filters) => {
    let query = `
        SELECT 
            a.id, 
            a.new_bill_number AS newBillNumber, 
            a.full_name AS fullName, 
            a.current_balance AS accountBalance
        FROM 
            water_customer_accounts a
        LEFT JOIN 
            water_projects p ON a.project_code = p.code AND a.sabha_code = p.sabha_code
        WHERE 
            a.sabha_code = ? 
            AND a.status = 1
    `;

    const params = [sabha_code];

    // --- Search ---
    if (filters.search) {
        query += ` AND (
            a.full_name LIKE ? OR 
            a.nic LIKE ? OR 
            a.old_bill_number LIKE ? OR 
            a.new_bill_number LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // --- Filters ---
    if (filters.projectCode) {
        query += ` AND a.project_code = ?`;
        params.push(filters.projectCode);
    }

    if (filters.connectionTypes && filters.connectionTypes.length > 0) {
        // Assuming connectionTypes is an array of strings like ['Domestic', 'Commercial']
        // We need to map these to the codes used in the DB if they are stored as codes, 
        // or use them directly if stored as strings. Based on context, they seem to be strings.
        const placeholders = filters.connectionTypes.map(() => '?').join(',');
        query += ` AND a.connection_type IN (${placeholders})`;
        params.push(...filters.connectionTypes);
    }

    if (filters.isSamurdhi !== undefined && filters.isSamurdhi !== null) {
        query += ` AND a.is_samurdhi = ?`;
        params.push(filters.isSamurdhi);
    }

    if (filters.isMetered !== undefined && filters.isMetered !== null) {
        query += ` AND a.is_metered = ?`;
        params.push(filters.isMetered);
    }

    // --- Sorting ---
    if (filters.sort) {
        switch (filters.sort) {
            case 'name_asc':
                query += ` ORDER BY a.full_name ASC`;
                break;
            case 'name_desc':
                query += ` ORDER BY a.full_name DESC`;
                break;
            case 'bill_asc':
                query += ` ORDER BY a.new_bill_number ASC`;
                break;
            case 'bill_desc':
                query += ` ORDER BY a.new_bill_number DESC`;
                break;
            default:
                query += ` ORDER BY a.id DESC`; // Default sort
        }
    } else {
        query += ` ORDER BY a.id DESC`;
    }

    // --- Pagination (Optional but recommended) ---
    // If pagination params are passed, append LIMIT/OFFSET
    // For now, returning all matching active customers as per typical requirements for this list.

    try {
        const [rows] = await db.promise().query(query, params);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Fetch project list for the filter dropdown
export const fetchProjectsModel = async (sabha_code) => {
    const query = `
        SELECT code, name 
        FROM water_projects 
        WHERE sabha_code = ?
    `;
    try {
        const [rows] = await db.promise().query(query, [sabha_code]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Fetch pending bill details by bill number
export const fetchPendingBillDetails = async (identifier) => {
    const query = `
        SELECT 
            b.id,
            b.account_id,
            b.bill_number, 
            b.billing_date, 
            b.period_from, 
            b.period_to, 
            b.previous_reading, 
            b.current_reading, 
            b.units_consumed, 
            b.water_consumption_charge, 
            b.fixed_charge, 
            b.monthly_charge, 
            b.other_charges, 
            b.previous_dues, 
            b.total_amount, 
            b.payment_status,
            c.full_name, 
            c.nic, 
            c.new_bill_number as account_number
        FROM water_bills b
        INNER JOIN water_customer_accounts c ON b.account_id = c.id
        WHERE (b.bill_number = ? OR b.account_id = ?) AND b.payment_status = 'Pending' OR b.payment_status = 'Partial'
    `;
    try {
        const [rows] = await db.promise().query(query, [identifier, identifier]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};
