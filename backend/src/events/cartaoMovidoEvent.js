const AutomacaoExecutorService = require("../services/AutomacaoExecutorService");

/**
 * Disparado quando o cartão muda de lista (após persistência e histórico MOVIDO_LISTA).
 * Ordem: AO_SAIR_DA_LISTA na origem, depois AO_ENTRAR_NA_LISTA no destino.
 */
async function emit(payload = {}) {
  const {
    quadroId,
    cartaoId,
    listaOrigemId,
    listaDestinoId,
    usuarioId,
  } = payload;

  if (!quadroId || !cartaoId || listaOrigemId == null || listaDestinoId == null) {
    return;
  }
  if (Number(listaOrigemId) === Number(listaDestinoId)) {
    return;
  }

  const ctxBase = {
    cartaoId,
    usuarioId: usuarioId || null,
  };

  try {
    await AutomacaoExecutorService.executarPorGatilho({
      quadroId,
      gatilho: "AO_SAIR_DA_LISTA",
      contexto: {
        ...ctxBase,
        listaOrigemId,
      },
    });
    await AutomacaoExecutorService.executarPorGatilho({
      quadroId,
      gatilho: "AO_ENTRAR_NA_LISTA",
      contexto: {
        ...ctxBase,
        listaDestinoId,
      },
    });
  } catch (error) {
    console.error("[cartaoMovidoEvent]", error.message || error);
  }
}

module.exports = {
  emit,
};
