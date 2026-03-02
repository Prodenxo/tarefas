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

  const [users] = await pool.query(
    "SELECT id, name, whatsapp_number FROM users WHERE name = 'Leonardo'",
  );
  console.log("User Leonardo:", users[0]);
  await pool.end();
}

check().catch(console.error);
