const QuadroRepository = require("../repositories/QuadroRepository");
const VisaoRepository = require("../repositories/VisaoRepository");
const { parseFiltroJson } = require("../utils/jsonFilterParser");

function toId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

class VisaoService {
  async listar(quadroId) {
    const qId = toId(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    return VisaoRepository.listar(qId);
  }

  async criar(quadroId, dados = {}) {
    const qId = toId(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    const nome = String(dados.nome || "").trim();
    if (!nome) throw Object.assign(new Error("Nome da visão é obrigatório."), { statusCode: 400 });

    const filtroParsed = parseFiltroJson(dados.filtroJson);
    if (!filtroParsed.ok) {
      throw Object.assign(new Error(filtroParsed.error), { statusCode: 400 });
    }

    return VisaoRepository.criar({
      quadroId: qId,
      nome,
      tipo: dados.tipo || "personalizada",
      chaveSistema: dados.chaveSistema,
      filtroJson: filtroParsed.value === undefined ? dados.filtroJson : filtroParsed.value,
      fixa: Boolean(dados.fixa),
      ativa: dados.ativa,
    });
  }

  async atualizar(quadroId, visaoId, dados = {}) {
    const qId = toId(quadroId);
    const vId = toId(visaoId);
    if (!qId || !vId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const atual = await VisaoRepository.obterPorId(qId, vId);
    if (!atual) return null;

    let payload = dados;
    if (dados.filtroJson !== undefined) {
      const filtroParsed = parseFiltroJson(dados.filtroJson);
      if (!filtroParsed.ok) {
        throw Object.assign(new Error(filtroParsed.error), { statusCode: 400 });
      }
      payload = { ...dados, filtroJson: filtroParsed.value };
    }

    return VisaoRepository.atualizar(qId, vId, payload);
  }

  async remover(quadroId, visaoId) {
    const qId = toId(quadroId);
    const vId = toId(visaoId);
    if (!qId || !vId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    return VisaoRepository.remover(qId, vId);
  }
}

module.exports = new VisaoService();

