const pool = require("./src/config/database");

async function check() {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = 4",
    );
    console.log(JSON.stringify(rows));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
