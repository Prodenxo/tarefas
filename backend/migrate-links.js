const pool = require("./src/config/database");

async function migrate() {
  try {
    console.log("--- MIGRATING USER-COMPANY LINKS ---");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_company (user_id, company_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    console.log('Table "user_companies" created or already exists.');
    console.log("MIGRATION COMPLETED SUCCESSFULLY");
    process.exit(0);
  } catch (err) {
    console.error("MIGRATION FAILED:", err);
    process.exit(1);
  }
}

migrate();
