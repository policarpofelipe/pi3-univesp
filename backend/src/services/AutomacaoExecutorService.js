const automacaoService = require("./automacaoService");

class AutomacaoExecutorService {
  async executarPorGatilho({ quadroId, gatilho, contexto = {} }) {
    const automacoes = await automacaoService.listar(quadroId);
    if (!automacoes) return null;

    const candidatas = automacoes.filter(
      (item) => item.ativo && String(item.gatilho).toUpperCase() === String(gatilho).toUpperCase()
    );

    // Placeholder operacional: retorna candidatas para execução real em próxima etapa.
    return {
      executadas: 0,
      candidatas: candidatas.length,
      contexto,
      automacoes: candidatas,
    };
  }
}

module.exports = new AutomacaoExecutorService();
