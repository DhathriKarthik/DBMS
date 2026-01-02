import mysql from "mysql2";

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Venulokesh@475",
    database: "mobilestore"
});

db.connect((err) => {
    if (err) {
        console.error("DB Connection Failed:", err.message);
    } else {
        console.log("Database connected successfully");
    }
});
