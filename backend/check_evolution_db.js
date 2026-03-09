const mysql = require("mysql2/promise");

async function test() {
  try {
    const uri =
      "mysql://mysql:Sup0rt3.%40@easypanel.cffranquias.com.br:369/evolution_db_leonardo";
    const conn = await mysql.createConnection(uri);
    const [rows] = await conn.execute(
      "SELECT id, name, connectionStatus FROM Instance",
    );
    console.log("Instances:", rows);
    await conn.end();
  } catch (error) {
    console.error("DB Error:", error.message);
  }
}

test();
