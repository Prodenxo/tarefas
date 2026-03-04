const pool = require("./src/config/database");

async function migrate() {
  try {
    console.log("--- MIGRATING USER ROLES ---");

    // 1. Adicionar coluna is_superadmin
    console.log("Adding is_superadmin column...");
    await pool.query(
      "ALTER TABLE users ADD COLUMN is_superadmin TINYINT(1) DEFAULT 0 AFTER email",
    );

    // 2. Migrar dados da coluna role para is_superadmin
    console.log("Migrating superadmin status...");
    await pool.query(
      "UPDATE users SET is_superadmin = 1 WHERE role = 'superadmin'",
    );

    // 3. Remover a coluna role
    console.log("Dropping role column from users...");
    await pool.query("ALTER TABLE users DROP COLUMN role");

    console.log("MIGRATION COMPLETED SUCCESSFULLY");
    process.exit(0);
  } catch (err) {
    if (err.code === "ER_DUP_COLUMN_NAME") {
      console.log("Column is_superadmin already exists.");
      process.exit(0);
    }
    console.error("MIGRATION FAILED:", err);
    process.exit(1);
  }
}

migrate();
