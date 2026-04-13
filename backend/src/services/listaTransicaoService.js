const ListaRepository = require("../repositories/ListaRepository");
const QuadroPapelRepository = require("../repositories/QuadroPapelRepository");
const ListaTransicaoRepository = require("../repositories/ListaTransicaoRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class ListaTransicaoService {
  async listar(quadroId, listaOrigemId) {
    const qId = toPositiveInt(quadroId);
    const loId = toPositiveInt(listaOrigemId);
    if (!qId || !loId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const listaOrigem = await ListaRepository.obterPorId(qId, loId);
    if (!listaOrigem) return null;
    return ListaTransicaoRepository.listar(qId, loId);
  }

  async criar(quadroId, listaOrigemId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const loId = toPositiveInt(listaOrigemId);
    const ldId = toPositiveInt(dados.listaDestinoId);
    const papelId = dados.papelId == null ? null : toPositiveInt(dados.papelId);
    if (!qId || !loId || !ldId) {
      throw Object.assign(new Error("listaDestinoId é obrigatório e IDs devem ser válidos."), {
        statusCode: 400,
      });
    }
    if (papelId === null && dados.papelId != null && !toPositiveInt(dados.papelId)) {
      throw Object.assign(new Error("papelId inválido."), { statusCode: 400 });
    }

    const origem = await ListaRepository.obterPorId(qId, loId);
    const destino = await ListaRepository.obterPorId(qId, ldId);
    if (!origem || !destino) {
      throw Object.assign(new Error("Lista de origem/destino não encontrada no quadro."), {
        statusCode: 404,
      });
    }
    if (papelId) {
      const papel = await QuadroPapelRepository.obterPorId(qId, papelId);
      if (!papel) throw Object.assign(new Error("Papel não encontrado no quadro."), { statusCode: 404 });
    }

    const exists = await ListaTransicaoRepository.existeRegra(loId, ldId, papelId);
    if (exists) {
      throw Object.assign(new Error("Regra de transição já cadastrada."), { statusCode: 409 });
    }

    await ListaTransicaoRepository.criar({
      listaOrigemId: loId,
      listaDestinoId: ldId,
      papelId,
    });
    return ListaTransicaoRepository.listar(qId, loId);
  }

  async remover(quadroId, listaOrigemId, regraId) {
    const qId = toPositiveInt(quadroId);
    const loId = toPositiveInt(listaOrigemId);
    const rId = toPositiveInt(regraId);
    if (!qId || !loId || !rId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const listaOrigem = await ListaRepository.obterPorId(qId, loId);
    if (!listaOrigem) return null;
    return ListaTransicaoRepository.remover(rId, loId);
  }
}

module.exports = new ListaTransicaoService();

