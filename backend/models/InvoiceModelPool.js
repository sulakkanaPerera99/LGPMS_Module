// import connection
import { getConnection } from "../config/database.js";

// insert Invoice
export const insertInvoice = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO invoice SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

// get all Invoice
export const getInvoice = async () => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("SELECT * FROM invoice");
        return results;
    } finally {
        conn.release();
    }
};

// insert to tempory_invoice_save table
export const insertInvoicetoSave = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO tempory_invoice_save SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

// get invoice total for a day in a sabha
export const getSumByDate = async (sabha, rdate) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM invoice WHERE sabha = ? AND DATE(date) = ? ORDER BY id ASC",
            [sabha, rdate]
        );
        return results;
    } finally {
        conn.release();
    }
};

// get invoice total for a day in a sabha filtered by acc_number
export const getSumByACC = async (sabha, rdate, acc) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM invoice WHERE sabha = ? AND DATE(date) = ? AND acc_number = ? ORDER BY id ASC",
            [sabha, rdate, acc]
        );
        return results;
    } finally {
        conn.release();
    }
};

// daily summary by cashier_nic
export const getSumByShroffnDate = async (sabha, rdate, sid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM invoice WHERE sabha = ? AND DATE(date) = ? AND cashier_nic = ? ORDER BY id ASC",
            [sabha, rdate, sid]
        );
        return results;
    } finally {
        conn.release();
    }
};

// update invoice to cancel state
export const updateInvtoCancel = async (invoice_status, invid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "UPDATE invoice SET invoice_status = ? WHERE invoice_num = ?",
            [invoice_status, invid]
        );
        return results;
    } finally {
        conn.release();
    }
};

// update invoice to cancel state in temp save
export const updateInvoiceCanTempSave = async (invoice_status, invoid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "UPDATE tempory_invoice_save SET invoice_status = ? WHERE invoice_num = ?",
            [invoice_status, invoid]
        );
        return results;
    } finally {
        conn.release();
    }
};

// insert cancelled invoice
export const cancelInvoice = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO invoice_cancelled SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

// cancelled invoice list
export const canceledReport = async (psabha, dtfrom, dtto) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT * 
             FROM invoice_cancelled AS c
             JOIN invoice AS p ON c.invoice_num = p.invoice_num
             WHERE c.sabha = ? AND DATE(c.cancelled_date_time) BETWEEN ? AND ?`,
            [psabha, dtfrom, dtto]
        );
        return results;
    } finally {
        conn.release();
    }
};
// cancel invoice (insert into invoice_cancelled)
export const cancleInvoice = (data, result) => {
    db.query("INSERT INTO invoice_cancelled SET ?", data, (err, results) => {
        if (err) {
            console.log(err);
            result(err, null);
        } else {
            result(null, results);
        }
    });
};
