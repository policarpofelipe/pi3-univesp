const mysql = require("mysql2/promise");
const env = require("../config/env");

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log("✅ Conexão com MySQL estabelecida com sucesso.");
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
};
