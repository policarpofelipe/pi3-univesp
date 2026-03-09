require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const { testConnection } = require("./database/connection");

async function startServer() {
  try {
    await testConnection();

    app.listen(env.port, () => {
      console.log(`🚀 Servidor rodando na porta ${env.port}`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error.message);
    process.exit(1);
  }
}

startServer();
