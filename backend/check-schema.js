const pool = require("./src/config/database");

async function checkSchema() {
  try {
    console.log("--- USERS TABLE SCHEMA ---");
    const [columns] = await pool.query("DESCRIBE users");
    console.table(columns);
    process.exit(0);
  } catch (err) {
    console.error("FAILED TO GET SCHEMA:", err);
    process.exit(1);
  }
}

checkSchema();
