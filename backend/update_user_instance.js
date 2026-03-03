const pool = require("./src/config/database");
require("dotenv").config();

async function updateInstance() {
  try {
    const [result] = await pool.query(
      "UPDATE users SET wa_instance = ? WHERE id = 1",
      [process.env.EVOLUTION_INSTANCE || "ofc"],
    );
    console.log(
      `Success! wa_instance updated to "${process.env.EVOLUTION_INSTANCE || "ofc"}" for user ID 1.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Error updating instance:", err);
    process.exit(1);
  }
}

updateInstance();
