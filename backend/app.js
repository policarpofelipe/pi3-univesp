const app = require("./src/app");
const prazoJob = require("./src/jobs/prazoJob");
const automacaoJob = require("./src/jobs/automacaoJob");

const PORT = process.env.PORT || 3000;
const HOST = process.env.IP || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`API rodando em http://${HOST}:${PORT}`);

  if (String(process.env.ENABLE_BACKGROUND_JOBS).toLowerCase() === "true") {
    prazoJob.start({
      intervalMs: Number(process.env.PRAZO_JOB_INTERVAL_MS) || undefined,
    });
    automacaoJob.start({
      intervalMs: Number(process.env.AUTOMACAO_JOB_INTERVAL_MS) || undefined,
    });
    console.log("Jobs em segundo plano: prazoJob + automacaoJob ativos.");
  }
});
