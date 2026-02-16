import db from '../../config/database.js';

/**
 * Retrieves customer payment history and account details based on Sabha code and filters.
 * Fetches basic account info along with the last payment date and amount via subqueries.
 * * @param {string} sabhaCode - The unique code of the Sabha.
 * @param {string} projectCode - Optional project code filter.
 * @param {Object} filters - Object containing various filter criteria (search, sort, status, etc.).
 * @returns {Promise<Array>} - Returns an array of customer objects with payment history summary.
 */
export const getCustomersHistoryBySabha1 = async (sabhaCode, projectCode, filters = {}) => {
    try {
        let query = `
            SELECT 
                wca.id,
                wca.nic,
                wca.old_bill_number AS oldBillNumber,
                wca.new_bill_number AS newBillNumber,
                wca.full_name AS fullName,
                wca.contact_info AS contactInfo,
                wca.connection_type AS connectionType,
                wca.project_code AS projectCode,
                wca.is_samurdhi AS isSamurdhi,
                wca.samurdhi_number AS samurdhiNumber,
                wca.is_metered AS isMetered,
                wca.status AS status,
                wca.current_balance AS currentBalance,

                -- Subquery to get the Last Paid Date
                (
                    SELECT paid_date 
                    FROM water_bills wb 
                    WHERE wb.account_id = wca.id 
                    ORDER BY wb.paid_date DESC 
                    LIMIT 1
                ) AS lastPaidDate,

                -- Subquery to get the Last Paid Amount (Defaults to 0 if null)
                COALESCE((
                    SELECT paid_amount 
                    FROM water_bills wb 
                    WHERE wb.account_id = wca.id
                    ORDER BY wb.paid_date DESC 
                    LIMIT 1
                ), 0) AS lastPaidAmount

            FROM water_customer_accounts wca
            WHERE wca.sabha_code = ?
        `;

        const params = [sabhaCode];

        // Filter by Project Code if provided
        if (projectCode) {
            query += " AND wca.project_code = ?";
            params.push(projectCode);
        }

        const conditions = [];

        // Apply Search Filter (Full Name, NIC, Old/New Bill No, Project Code)
        if (filters.search) {
            conditions.push(`(wca.full_name LIKE ? OR wca.nic LIKE ? OR wca.old_bill_number LIKE ? OR wca.new_bill_number LIKE ? OR wca.project_code LIKE ?)`);
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Apply Connection Type Filter
        if (filters.connectionTypes && filters.connectionTypes.length > 0) {
            const placeholders = filters.connectionTypes.map(() => '?').join(',');
            conditions.push(`wca.connection_type IN (${placeholders})`);
            params.push(...filters.connectionTypes);
        }

        // Apply Status Filter
        if (filters.status && filters.status.length > 0) {
            const placeholders = filters.status.map(() => '?').join(',');
            conditions.push(`wca.status IN (${placeholders})`);
            params.push(...filters.status);
        }

        // Apply Samurdhi Filter
        if (filters.isSamurdhi && filters.isSamurdhi.length > 0) {
            const placeholders = filters.isSamurdhi.map(() => '?').join(',');
            conditions.push(`wca.is_samurdhi IN (${placeholders})`);
            params.push(...filters.isSamurdhi);
        }

        // Apply Metered Filter
        if (filters.isMetered && filters.isMetered.length > 0) {
            const placeholders = filters.isMetered.map(() => '?').join(',');
            conditions.push(`wca.is_metered IN (${placeholders})`);
            params.push(...filters.isMetered);
        }

        // Append conditions to query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // Apply Sorting Logic
        if (filters.sort) {
            switch (filters.sort) {
                case 'name_asc': query += ' ORDER BY wca.full_name ASC'; break;
                case 'name_desc': query += ' ORDER BY wca.full_name DESC'; break;
                case 'bill_asc': query += ' ORDER BY wca.new_bill_number ASC'; break;
                case 'bill_desc': query += ' ORDER BY wca.new_bill_number DESC'; break;
                default: query += ' ORDER BY wca.full_name ASC';
            }
        } else {
            query += ' ORDER BY wca.full_name ASC';
        }

        // Execute query using promise-based pool
        const [results] = await db.query(query, params);
        return results;

    } catch (error) {
        console.error("Database Error in getCustomersHistoryBySabha1:", error);
        throw error;
    }
};