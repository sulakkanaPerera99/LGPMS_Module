import mysql from "mysql2";

// create the connection to database

const db = mysql.createConnection({
    host: "localhost",
    user: "oldlgpms2025",
    password: "$Wimalnew@413",
    database: "testlgpmsold"
});


db.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default db;