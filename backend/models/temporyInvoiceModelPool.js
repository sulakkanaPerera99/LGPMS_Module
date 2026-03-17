import { getConnection } from "../config/database1.js";

// Get all receipts
export const getReceipt = async (result) => {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM tempory_invoice");
    result(null, rows);
  } catch (err) {
    console.error("getReceipt error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Get receipt by NIC
export const getReceiptById = async (id, result) => {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM tempory_invoice WHERE cus_nic = ?",
      [id]
    );
    result(null, rows);
  } catch (err) {
    console.error("getReceiptById error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Get receipt by NIC + sabha
export const getReceiptByIdnSabha = async (id, scode, result) => {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM tempory_invoice WHERE cus_nic = ? AND sabha_code=?",
      [id, scode]
    );
    result(null, rows);
  } catch (err) {
    console.error("getReceiptByIdnSabha error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Get receipt by NIC + subject
export const getPivById = async (id, subid, result) => {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM tempory_invoice WHERE cus_nic = ? AND sub_nic=?",
      [id, subid]
    );
    result(null, rows);
  } catch (err) {
    console.error("getPivById error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Insert new receipt
export const insertReceipt = async (data, result) => {
  const conn = await getConnection();
  try {
    const [res] = await conn.query("INSERT INTO tempory_invoice SET ?", data);
    result(null, { insertId: res.insertId });
  } catch (err) {
    console.error("insertReceipt error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Update receipt (example: food table)
export const updateReceiptById = async (data, id, result) => {
  const conn = await getConnection();
  try {
    const [res] = await conn.query(
      "UPDATE food SET food_name = ?, food_price = ? WHERE food_id = ?",
      [data.food_name, data.food_price, id]
    );
    result(null, res);
  } catch (err) {
    console.error("updateReceiptById error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Delete all receipts
export const deleteReceiptById = async (result) => {
  const conn = await getConnection();
  try {
    const [res] = await conn.query("DELETE FROM tempory_invoice");
    result(null, res);
  } catch (err) {
    console.error("deleteReceiptById error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Delete single receipt by id
export const deleteSingleReceiptById = async (id, result) => {
  const conn = await getConnection();
  try {
    const [res] = await conn.query("DELETE FROM tempory_invoice WHERE id = ?", [
      id,
    ]);
    result(null, res);
  } catch (err) {
    console.error("deleteSingleReceiptById error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Delete temp receipts by NIC
export const deleteTempInvByNic = async (id, result) => {
  const conn = await getConnection();
  try {
    const [res] = await conn.query(
      "DELETE FROM tempory_invoice WHERE cus_nic = ?",
      [id]
    );
    result(null, res);
  } catch (err) {
    console.error("deleteTempInvByNic error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// Insert into temp keep
export const insertKeep = async (data, result) => {
  const conn = await getConnection();
  try {
    const [res] = await conn.query(
      "INSERT INTO temporary_invoice_keep SET ?",
      data
    );
    result(null, { insertId: res.insertId });
  } catch (err) {
    console.error("insertKeep error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};

// View added PIV of subject
export const getPivBySub = async (subid, saba, result) => {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM tempory_invoice WHERE sub_nic = ? AND sabha_code=? ORDER BY id DESC",
      [subid, saba]
    );
    result(null, rows);
  } catch (err) {
    console.error("getPivBySub error:", err);
    result(err, null);
  } finally {
    conn.release();
  }
};
