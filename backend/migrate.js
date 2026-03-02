const pool = require("./src/config/database");

async function migrate() {
  try {
    console.log("Adding columns to users table...");
    await pool.query(
      "ALTER TABLE users ADD COLUMN wa_instance VARCHAR(100) DEFAULT NULL",
    );
    await pool.query(
      "ALTER TABLE users ADD COLUMN whatsapp_number VARCHAR(20) DEFAULT NULL",
    );
    console.log("Migration completed successfully.");
  } catch (e) {
    if (e.code === "ER_DUP_COLUMN_NAME") {
      console.log("Columns already exist.");
    } else {
      console.error("MIGRATION ERROR:", e);
    }
  } finally {
    process.exit();
  }
}

migrate();
