import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "lgpms",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export const getConnection = async () => {
  return await db.getConnection();
};

export default db;
