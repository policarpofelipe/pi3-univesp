const ListaRepository = require("../repositories/ListaRepository");
const QuadroPapelRepository = require("../repositories/QuadroPapelRepository");
const ListaPermissaoRepository = require("../repositories/ListaPermissaoRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class ListaPermissaoService {
  async listar(quadroId, listaId) {
    const qId = toPositiveInt(quadroId);
    const lId = toPositiveInt(listaId);
    if (!qId || !lId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });

    const lista = await ListaRepository.obterPorId(qId, lId);
    if (!lista) return null;
    return ListaPermissaoRepository.listar(qId, lId);
  }

  async definir(quadroId, listaId, payload = {}) {
    const qId = toPositiveInt(quadroId);
    const lId = toPositiveInt(listaId);
    const papelId = toPositiveInt(payload.papelId);
    if (!qId || !lId || !papelId) {
      throw Object.assign(new Error("quadroId, listaId e papelId são obrigatórios."), {
        statusCode: 400,
      });
    }

    const lista = await ListaRepository.obterPorId(qId, lId);
    if (!lista) return null;

    const papel = await QuadroPapelRepository.obterPorId(qId, papelId);
    if (!papel) {
      throw Object.assign(new Error("Papel não encontrado neste quadro."), { statusCode: 404 });
    }

    await ListaPermissaoRepository.upsert({
      listaId: lId,
      papelId,
      podeVer: payload.podeVer !== undefined ? Boolean(payload.podeVer) : true,
      podeEditar: payload.podeEditar !== undefined ? Boolean(payload.podeEditar) : true,
      podeEnviarPara:
        payload.podeEnviarPara !== undefined ? Boolean(payload.podeEnviarPara) : true,
    });
    return ListaPermissaoRepository.listar(qId, lId);
  }

  async remover(quadroId, listaId, papelId) {
    const qId = toPositiveInt(quadroId);
    const lId = toPositiveInt(listaId);
    const pId = toPositiveInt(papelId);
    if (!qId || !lId || !pId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });

    const lista = await ListaRepository.obterPorId(qId, lId);
    if (!lista) return null;
    return ListaPermissaoRepository.remover(lId, pId);
  }
}

module.exports = new ListaPermissaoService();

