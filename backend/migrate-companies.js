const pool = require("./src/config/database");

async function migrate() {
  try {
    console.log("--- MIGRATING COMPANIES TABLE ---");

    // Check if address exists
    const [cols] = await pool.query("SHOW COLUMNS FROM companies");
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes("address")) {
      console.log('Adding column "address"...');
      await pool.query(
        "ALTER TABLE companies ADD COLUMN address VARCHAR(255) AFTER name",
      );
    }

    if (!colNames.includes("website")) {
      console.log('Adding column "website"...');
      await pool.query(
        "ALTER TABLE companies ADD COLUMN website VARCHAR(255) AFTER address",
      );
    }

    console.log("COMPANIES MIGRATION COMPLETED SUCCESSFULLY");
    process.exit(0);
  } catch (err) {
    console.error("MIGRATION FAILED:", err);
    process.exit(1);
  }
}

migrate();
