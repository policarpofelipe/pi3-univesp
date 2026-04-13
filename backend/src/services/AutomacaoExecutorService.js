const automacaoService = require("./automacaoService");

function contextoPermiteAutomacao(automacao, gatilho, ctx = {}) {
  const g = String(gatilho).toUpperCase();

  if (g === "AO_CRIAR_CARTAO") {
    if (automacao.listaDestinoId != null && ctx.listaId != null) {
      return Number(automacao.listaDestinoId) === Number(ctx.listaId);
    }
    return true;
  }

  if (g === "AO_ENTRAR_NA_LISTA") {
    if (automacao.listaDestinoId != null && ctx.listaDestinoId != null) {
      return Number(automacao.listaDestinoId) === Number(ctx.listaDestinoId);
    }
    return true;
  }

  if (g === "AO_SAIR_DA_LISTA") {
    if (automacao.listaOrigemId != null && ctx.listaOrigemId != null) {
      return Number(automacao.listaOrigemId) === Number(ctx.listaOrigemId);
    }
    return true;
  }

  if (g === "AO_ATUALIZAR_CAMPO") {
    if (automacao.campoId != null && ctx.campoId != null) {
      return Number(automacao.campoId) === Number(ctx.campoId);
    }
    return true;
  }

  return true;
}

class AutomacaoExecutorService {
  /**
   * Seleciona automações ativas do gatilho e filtra por contexto (lista/campo).
   * Execução real das ações ainda é incremental; retorno descreve candidatas.
   */
  async executarPorGatilho({ quadroId, gatilho, contexto = {} }) {
    const automacoes = await automacaoService.listar(quadroId);
    if (!automacoes) return null;

    const g = String(gatilho).toUpperCase();
    const candidatas = automacoes.filter(
      (item) =>
        item.ativo &&
        String(item.gatilho).toUpperCase() === g &&
        contextoPermiteAutomacao(item, g, contexto)
    );

    return {
      executadas: 0,
      candidatas: candidatas.length,
      contexto,
      automacoes: candidatas,
    };
  }
}

module.exports = new AutomacaoExecutorService();
