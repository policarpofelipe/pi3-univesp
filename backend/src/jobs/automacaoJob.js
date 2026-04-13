const { pool } = require("../database/connection");
const AutomacaoExecutorService = require("../services/AutomacaoExecutorService");

let intervalHandle = null;

/**
 * Varre quadros com automações ativas e avalia candidatas ao gatilho AO_VENCER_PRAZO.
 * Complementa o prazoJob (evento por cartão); aqui o foco é visão agregada por quadro.
 */
async function tick() {
  const [rows] = await pool.query(
    `
    SELECT DISTINCT quadro_id AS quadroId
    FROM automacoes
    WHERE ativo = 1
    `
  );

  const resumo = [];
  for (const row of rows) {
    const quadroId = row.quadroId;
    const resultado = await AutomacaoExecutorService.executarPorGatilho({
      quadroId,
      gatilho: "AO_VENCER_PRAZO",
      contexto: { origem: "automacaoJob" },
    });
    resumo.push({
      quadroId,
      candidatas: resultado?.candidatas ?? 0,
    });
  }

  return { quadrosComAutomacao: rows.length, resumo };
}

function start(options = {}) {
  const intervalMs =
    Number.isInteger(options.intervalMs) && options.intervalMs >= 60_000
      ? options.intervalMs
      : 600_000;

  if (intervalHandle) {
    return;
  }

  intervalHandle = setInterval(() => {
    tick().catch((err) => {
      console.error("[automacaoJob] tick:", err.message || err);
    });
  }, intervalMs);

  tick().catch((err) => {
    console.error("[automacaoJob] tick inicial:", err.message || err);
  });
}

function stop() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = {
  tick,
  start,
  stop,
};
