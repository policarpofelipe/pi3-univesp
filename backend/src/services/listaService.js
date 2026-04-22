const ListaRepository = require("../repositories/ListaRepository");
const QuadroRepository = require("../repositories/QuadroRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function normalizarCorLista(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const cor = String(value).trim();
  return /^#[0-9a-fA-F]{6}$/.test(cor) ? cor.toUpperCase() : null;
}

class ListaService {
  async listar(quadroId) {
    const qId = toPositiveInt(quadroId);
    if (!qId) {
      const error = new Error("ID do quadro inválido.");
      error.statusCode = 400;
      throw error;
    }
    return ListaRepository.listar(qId);
  }

  async obterPorId(quadroId, listaId) {
    const qId = toPositiveInt(quadroId);
    const lId = toPositiveInt(listaId);
    if (!qId || !lId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }
    return ListaRepository.obterPorId(qId, lId);
  }

  async criar(quadroId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    if (!qId) {
      const error = new Error("ID do quadro inválido.");
      error.statusCode = 400;
      throw error;
    }

    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) {
      const error = new Error("Quadro não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const nome = String(dados.nome || "").trim();
    if (!nome) {
      const error = new Error("O nome da lista é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const limiteWip =
      dados.limiteWip === undefined || dados.limiteWip === null || dados.limiteWip === ""
        ? null
        : Number(dados.limiteWip);

    return ListaRepository.criar({
      quadroId: qId,
      nome,
      descricao:
        dados.descricao === undefined || dados.descricao === null
          ? null
          : String(dados.descricao).trim(),
      limiteWip: Number.isFinite(limiteWip) && limiteWip > 0 ? limiteWip : null,
      cor: normalizarCorLista(dados.cor),
    });
  }

  async atualizar(quadroId, listaId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const lId = toPositiveInt(listaId);
    if (!qId || !lId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const atual = await ListaRepository.obterPorId(qId, lId);
    if (!atual) return null;

    const payload = {};
    if (dados.nome !== undefined) {
      const nome = String(dados.nome).trim();
      if (!nome) {
        const error = new Error("O nome da lista não pode ser vazio.");
        error.statusCode = 400;
        throw error;
      }
      payload.nome = nome;
    }
    if (dados.descricao !== undefined) {
      payload.descricao = dados.descricao === null ? null : String(dados.descricao).trim();
    }
    if (dados.limiteWip !== undefined) {
      const limite =
        dados.limiteWip === null || dados.limiteWip === ""
          ? null
          : Number(dados.limiteWip);
      payload.limiteWip = Number.isFinite(limite) && limite > 0 ? limite : null;
    }
    if (dados.cor !== undefined) {
      payload.cor = normalizarCorLista(dados.cor);
    }

    return ListaRepository.atualizar(qId, lId, payload);
  }

  async remover(quadroId, listaId) {
    const qId = toPositiveInt(quadroId);
    const lId = toPositiveInt(listaId);
    if (!qId || !lId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }
    return ListaRepository.remover(qId, lId);
  }

  async reordenar(quadroId, ids = []) {
    const qId = toPositiveInt(quadroId);
    if (!qId) {
      const error = new Error("ID do quadro inválido.");
      error.statusCode = 400;
      throw error;
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Envie um array ids com a nova ordem das listas.");
      error.statusCode = 400;
      throw error;
    }
    const listaIds = ids
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    return ListaRepository.reordenar(qId, listaIds);
  }
}

module.exports = new ListaService();

