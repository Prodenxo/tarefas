const pool = require("./src/config/database");

async function migrate() {
  try {
    console.log("--- MIGRATING TASKS TABLE ---");

    // 1. Force recreate/update Tasks table
    await pool.query("DROP TABLE IF EXISTS tasks");

    await pool.query(`
      CREATE TABLE tasks (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        company_id BIGINT UNSIGNED NOT NULL,
        created_by_user_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        status ENUM('Iniciada', 'Pausada', 'Interrompida', 'Concluída') DEFAULT 'Iniciada',
        due_date DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 2. Add 'manager' role support to migration script (just for reference)
    console.log('Table "tasks" updated with correct status enum.');
    console.log("MIGRATION COMPLETED SUCCESSFULLY");
    process.exit(0);
  } catch (err) {
    console.error("MIGRATION FAILED:", err);
    process.exit(1);
  }
}

migrate();
