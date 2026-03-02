const mysql = require("mysql2/promise");
require("dotenv").config();

async function check() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  const [columns] = await pool.query("SHOW COLUMNS FROM users");
  console.log(
    "Columns:",
    columns.map((c) => c.Field),
  );
  await pool.end();
}

check().catch(console.error);
