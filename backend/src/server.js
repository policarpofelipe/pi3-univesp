require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const { testConnection } = require("./database/connection");

let server;

async function startServer() {
  try {
    await testConnection();

    server = app.listen(env.port, () => {
      console.log(`🚀 Servidor rodando na porta ${env.port}`);
    });

    setupGracefulShutdown();
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error.message);
    process.exit(1);
  }
}

/*
  Shutdown controlado (graceful shutdown)
  Evita corrupção de conexão com DB e requisições pendentes
*/
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`\n⚠️  Recebido ${signal}. Encerrando servidor...`);

    if (server) {
      server.close(() => {
        console.log("🛑 Servidor encerrado corretamente.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);   // Ctrl + C
  process.on("SIGTERM", shutdown);  // Docker / VPS
}

/*
  Captura erros não tratados
*/
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

startServer();