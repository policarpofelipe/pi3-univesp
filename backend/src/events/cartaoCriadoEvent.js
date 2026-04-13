const AutomacaoExecutorService = require("../services/AutomacaoExecutorService");

/**
 * Disparado após persistir um novo cartão (histórico CRIADO já registrado).
 * Aciona automações com gatilho AO_CRIAR_CARTAO no quadro.
 */
async function emit(payload = {}) {
  const { quadroId, listaId, cartaoId, usuarioId } = payload;
  if (!quadroId || !listaId || !cartaoId) return;

  try {
    await AutomacaoExecutorService.executarPorGatilho({
      quadroId,
      gatilho: "AO_CRIAR_CARTAO",
      contexto: {
        cartaoId,
        listaId,
        usuarioId: usuarioId || null,
      },
    });
  } catch (error) {
    console.error("[cartaoCriadoEvent]", error.message || error);
  }
}

module.exports = {
  emit,
};
