const CartaoRepository = require("../repositories/CartaoRepository");
const prazoVencidoEvent = require("../events/prazoVencidoEvent");

let intervalHandle = null;

/**
 * Uma passagem: cartões com prazo vencido recebem evento de automação.
 */
async function tick(options = {}) {
  const rows = await CartaoRepository.listarCartoesComPrazoVencido({
    limit: options.limit || 300,
  });

  for (const row of rows) {
    await prazoVencidoEvent.emit(row);
  }

  return { encontrados: rows.length, processados: rows.length };
}

/**
 * Agenda execução periódica. Em produção, use ENABLE_BACKGROUND_JOBS=true no .env.
 */
function start(options = {}) {
  const intervalMs =
    Number.isInteger(options.intervalMs) && options.intervalMs >= 10_000
      ? options.intervalMs
      : 300_000;

  if (intervalHandle) {
    return;
  }

  intervalHandle = setInterval(() => {
    tick(options).catch((err) => {
      console.error("[prazoJob] tick:", err.message || err);
    });
  }, intervalMs);

  tick(options).catch((err) => {
    console.error("[prazoJob] tick inicial:", err.message || err);
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
