const QuadroRepository = require("../repositories/QuadroRepository");
const AutomacaoRepository = require("../repositories/AutomacaoRepository");

const GATILHOS = new Set([
  "AO_CRIAR_CARTAO",
  "AO_ENTRAR_NA_LISTA",
  "AO_SAIR_DA_LISTA",
  "AO_ATUALIZAR_CAMPO",
  "AO_VENCER_PRAZO",
]);

function toId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

class AutomacaoService {
  async listar(quadroId) {
    const qId = toId(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    return AutomacaoRepository.listar(qId);
  }

  async criar(quadroId, dados = {}, usuarioId = null) {
    const qId = toId(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;

    const nome = String(dados.nome || "").trim();
    const gatilho = String(dados.gatilho || "").trim().toUpperCase();
    if (!nome || !GATILHOS.has(gatilho)) {
      throw Object.assign(new Error("Nome e gatilho válido são obrigatórios."), {
        statusCode: 400,
      });
    }

    return AutomacaoRepository.criar({
      quadroId: qId,
      nome,
      descricao: dados.descricao,
      gatilho,
      listaOrigemId: dados.listaOrigemId,
      listaDestinoId: dados.listaDestinoId,
      campoId: dados.campoId,
      condicoesJson: dados.condicoesJson,
      executaUmaVezPorCartao: dados.executaUmaVezPorCartao,
      ativo: dados.ativo,
      criadoPorUsuarioId: usuarioId,
    });
  }

  async atualizar(quadroId, automacaoId, dados = {}) {
    const qId = toId(quadroId);
    const aId = toId(automacaoId);
    if (!qId || !aId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const atual = await AutomacaoRepository.obterPorId(qId, aId);
    if (!atual) return null;
    return AutomacaoRepository.atualizar(qId, aId, dados);
  }

  async remover(quadroId, automacaoId) {
    const qId = toId(quadroId);
    const aId = toId(automacaoId);
    if (!qId || !aId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    return AutomacaoRepository.remover(qId, aId);
  }
}

module.exports = new AutomacaoService();

