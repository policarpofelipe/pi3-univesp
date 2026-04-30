const QuadroRepository = require("../repositories/QuadroRepository");
const AutomacaoRepository = require("../repositories/AutomacaoRepository");
const AutomacaoAcaoRepository = require("../repositories/AutomacaoAcaoRepository");

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
  parseAcoes(dados = {}, fallbackAutomacao = null) {
    const allowed = new Set(["MOVER_CARTAO", "ADICIONAR_TAG"]);
    if (!Array.isArray(dados.acoes) || !dados.acoes.length) {
      if (fallbackAutomacao?.listaDestinoId) {
        return [
          {
            tipoAcao: "MOVER_CARTAO",
            configJson: { listaDestinoId: Number(fallbackAutomacao.listaDestinoId) },
            ativo: true,
          },
        ];
      }
      return [];
    }
    const normalized = [];
    for (const item of dados.acoes) {
      const tipoAcao = String(item?.tipoAcao || "").trim().toUpperCase();
      if (!allowed.has(tipoAcao)) {
        const error = new Error(`Tipo de ação inválido: ${tipoAcao || "(vazio)"}.`);
        error.statusCode = 400;
        error.code = "AUTOMACAO_ACAO_INVALIDA";
        throw error;
      }
      const config = item?.configJson && typeof item.configJson === "object" ? item.configJson : {};
      if (tipoAcao === "MOVER_CARTAO") {
        const listaDestinoId = Number(config.listaDestinoId ?? dados.listaDestinoId);
        if (!Number.isInteger(listaDestinoId) || listaDestinoId <= 0) {
          const error = new Error("Ação MOVER_CARTAO exige listaDestinoId válido.");
          error.statusCode = 400;
          error.code = "AUTOMACAO_ACAO_MOVER_INVALIDA";
          throw error;
        }
        normalized.push({ tipoAcao, configJson: { listaDestinoId }, ativo: item?.ativo !== false });
      }
      if (tipoAcao === "ADICIONAR_TAG") {
        const tagId = Number(config.tagId ?? dados.tagId ?? dados.condicoesJson?.tagId);
        if (!Number.isInteger(tagId) || tagId <= 0) {
          const error = new Error("Ação ADICIONAR_TAG exige tagId válido.");
          error.statusCode = 400;
          error.code = "AUTOMACAO_ACAO_TAG_INVALIDA";
          throw error;
        }
        normalized.push({ tipoAcao, configJson: { tagId }, ativo: item?.ativo !== false });
      }
    }
    return normalized;
  }

  async anexarAcoes(automacao) {
    const acoes = await AutomacaoAcaoRepository.listarPorAutomacao(automacao.id, true);
    return { ...automacao, acoes };
  }

  async listar(quadroId) {
    const qId = toId(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    const automacoes = await AutomacaoRepository.listar(qId);
    return Promise.all(automacoes.map((item) => this.anexarAcoes(item)));
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

    const criada = await AutomacaoRepository.criar({
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
    const acoes = this.parseAcoes(dados, criada);
    if (acoes.length) {
      await AutomacaoAcaoRepository.substituirAcoes(criada.id, acoes);
    }
    return this.anexarAcoes(criada);
  }

  async atualizar(quadroId, automacaoId, dados = {}) {
    const qId = toId(quadroId);
    const aId = toId(automacaoId);
    if (!qId || !aId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const atual = await AutomacaoRepository.obterPorId(qId, aId);
    if (!atual) return null;
    const payload = { ...dados };
    if (payload.gatilho !== undefined) {
      const gatilho = String(payload.gatilho || "").trim().toUpperCase();
      if (!GATILHOS.has(gatilho)) {
        const error = new Error("Gatilho inválido.");
        error.statusCode = 400;
        error.code = "AUTOMACAO_GATILHO_INVALIDO";
        throw error;
      }
      payload.gatilho = gatilho;
    }
    const atualizado = await AutomacaoRepository.atualizar(qId, aId, payload);
    if (dados.acoes !== undefined) {
      const acoes = this.parseAcoes(dados, atualizado);
      await AutomacaoAcaoRepository.substituirAcoes(aId, acoes);
    }
    return this.anexarAcoes(atualizado);
  }

  async remover(quadroId, automacaoId) {
    const qId = toId(quadroId);
    const aId = toId(automacaoId);
    if (!qId || !aId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    return AutomacaoRepository.remover(qId, aId);
  }
}

module.exports = new AutomacaoService();

