const QuadroRepository = require("../repositories/QuadroRepository");
const CampoPersonalizadoRepository = require("../repositories/CampoPersonalizadoRepository");

function toId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

class CampoPersonalizadoService {
  async listar(quadroId) {
    const qId = toId(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    return CampoPersonalizadoRepository.listar(qId);
  }

  async criar(quadroId, dados = {}) {
    const qId = toId(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    const nome = String(dados.nome || "").trim();
    const tipo = String(dados.tipo || "").trim();
    if (!nome || !tipo) {
      throw Object.assign(new Error("Nome e tipo do campo são obrigatórios."), {
        statusCode: 400,
      });
    }
    return CampoPersonalizadoRepository.criar({
      quadroId: qId,
      nome,
      tipo,
      descricao: dados.descricao,
      obrigatorio: Boolean(dados.obrigatorio),
      configJson: dados.configJson,
      ativo: dados.ativo,
    });
  }

  async atualizar(quadroId, campoId, dados = {}) {
    const qId = toId(quadroId);
    const cId = toId(campoId);
    if (!qId || !cId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const atual = await CampoPersonalizadoRepository.obterPorId(qId, cId);
    if (!atual) return null;
    return CampoPersonalizadoRepository.atualizar(qId, cId, dados);
  }

  async remover(quadroId, campoId) {
    const qId = toId(quadroId);
    const cId = toId(campoId);
    if (!qId || !cId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    return CampoPersonalizadoRepository.remover(qId, cId);
  }
}

module.exports = new CampoPersonalizadoService();

