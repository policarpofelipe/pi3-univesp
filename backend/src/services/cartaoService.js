const CartaoRepository = require("../repositories/CartaoRepository");
const ListaRepository = require("../repositories/ListaRepository");
const QuadroRepository = require("../repositories/QuadroRepository");

const PRIORIDADES = new Set(["baixa", "media", "alta", "urgente"]);

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function normalizarPrioridade(val) {
  if (val === undefined) return { skip: true };
  if (val === null || val === "") return { value: "media" };
  const v = String(val).trim().toLowerCase();
  if (!PRIORIDADES.has(v)) return { invalid: true };
  return { value: v };
}

function normalizarPrazoEm(val) {
  if (val === undefined) return { skip: true };
  if (val === null || val === "") return { value: null };
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return { invalid: true };
  return { value: d.toISOString().slice(0, 19).replace("T", " ") };
}

class CartaoService {
  async listar(quadroId, filtros = {}) {
    const qId = toPositiveInt(quadroId);
    if (!qId) {
      const error = new Error("ID do quadro inválido.");
      error.statusCode = 400;
      throw error;
    }
    const listaId = filtros.listaId ? toPositiveInt(filtros.listaId) : undefined;
    return CartaoRepository.listar(qId, { listaId });
  }

  async obterPorId(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }
    return CartaoRepository.obterPorId(qId, cId);
  }

  async criar(quadroId, dados = {}, criadoPorUsuarioId = null) {
    const qId = toPositiveInt(quadroId);
    const listaId = toPositiveInt(dados.listaId);
    if (!qId || !listaId) {
      const error = new Error("quadroId e listaId são obrigatórios.");
      error.statusCode = 400;
      throw error;
    }

    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) {
      const error = new Error("Quadro não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const lista = await ListaRepository.obterPorId(qId, listaId);
    if (!lista) {
      const error = new Error("Lista não encontrada neste quadro.");
      error.statusCode = 404;
      throw error;
    }

    const titulo = String(dados.titulo || "").trim();
    if (!titulo) {
      const error = new Error("O título do cartão é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const prioridade = normalizarPrioridade(dados.prioridade);
    if (prioridade.invalid) {
      const error = new Error("Prioridade inválida. Use: baixa, media, alta ou urgente.");
      error.statusCode = 400;
      throw error;
    }
    const prazoEm = normalizarPrazoEm(dados.prazoEm);
    if (prazoEm.invalid) {
      const error = new Error("Data de prazo inválida.");
      error.statusCode = 400;
      throw error;
    }

    const tagIds = Array.isArray(dados.tagIds)
      ? dados.tagIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];

    const id = await CartaoRepository.criar({
      listaId,
      titulo,
      descricao: String(dados.descricao || "").trim(),
      prioridade: prioridade.skip ? "media" : prioridade.value,
      prazoEm: prazoEm.skip ? null : prazoEm.value,
      criadoPorUsuarioId,
      tagIds,
    });
    return CartaoRepository.obterPorId(qId, id);
  }

  async atualizar(quadroId, cartaoId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const atual = await CartaoRepository.obterPorId(qId, cId);
    if (!atual) return null;

    const payload = {};
    if (dados.titulo !== undefined) {
      const titulo = String(dados.titulo).trim();
      if (!titulo) {
        const error = new Error("O título não pode ser vazio.");
        error.statusCode = 400;
        throw error;
      }
      payload.titulo = titulo;
    }
    if (dados.descricao !== undefined) payload.descricao = String(dados.descricao || "").trim();

    const prioridade = normalizarPrioridade(dados.prioridade);
    if (prioridade.invalid) {
      const error = new Error("Prioridade inválida. Use: baixa, media, alta ou urgente.");
      error.statusCode = 400;
      throw error;
    }
    if (!prioridade.skip) payload.prioridade = prioridade.value;

    const prazoEm = normalizarPrazoEm(dados.prazoEm);
    if (prazoEm.invalid) {
      const error = new Error("Data de prazo inválida.");
      error.statusCode = 400;
      throw error;
    }
    if (!prazoEm.skip) payload.prazoEm = prazoEm.value;

    if (dados.tagIds !== undefined) {
      payload.tagIds = Array.isArray(dados.tagIds)
        ? dados.tagIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)
        : [];
    }

    await CartaoRepository.atualizar(cId, payload);
    return CartaoRepository.obterPorId(qId, cId);
  }

  async mover(quadroId, cartaoId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const listaId = toPositiveInt(dados.listaId);
    if (!qId || !cId || !listaId) {
      const error = new Error("quadroId, cartaoId e listaId são obrigatórios.");
      error.statusCode = 400;
      throw error;
    }

    const moved = await CartaoRepository.mover(qId, cId, listaId, dados.posicao);
    if (moved === null) {
      const error = new Error("Lista de destino não encontrada.");
      error.statusCode = 404;
      throw error;
    }
    if (moved === false) return null;
    return CartaoRepository.obterPorId(qId, cId);
  }

  async remover(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }
    return CartaoRepository.remover(qId, cId);
  }
}

module.exports = new CartaoService();

