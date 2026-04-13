const AutomacaoExecutorService = require("../services/AutomacaoExecutorService");

/**
 * Disparado pelo job de prazos para cada cartão com prazo_em vencido e ainda aberto.
 */
async function emit(payload = {}) {
  const { quadroId, listaId, cartaoId, titulo, prazoEm } = payload;
  if (!quadroId || !listaId || !cartaoId) return;

  try {
    await AutomacaoExecutorService.executarPorGatilho({
      quadroId,
      gatilho: "AO_VENCER_PRAZO",
      contexto: {
        cartaoId,
        listaId,
        titulo: titulo || null,
        prazoEm: prazoEm || null,
        origem: "prazoJob",
      },
    });
  } catch (error) {
    console.error("[prazoVencidoEvent]", error.message || error);
  }
}

module.exports = {
  emit,
};
