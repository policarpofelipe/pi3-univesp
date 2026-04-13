const QuadroPapelRepository = require("../repositories/QuadroPapelRepository");
const QuadroRepository = require("../repositories/QuadroRepository");

const frontendToDbPerms = {
  visualizarQuadro: "podeGerenciarQuadro",
  editarQuadro: "podeGerenciarQuadro",
  excluirQuadro: "podeGerenciarQuadro",
  gerenciarMembros: "podeConvidarMembros",
  moverCartoes: "podeCriarCartao",
  editarListas: "podeGerenciarListas",
};

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function toFrontendPerms(permissoes = {}) {
  return {
    visualizarQuadro: Boolean(permissoes.podeGerenciarQuadro),
    editarQuadro: Boolean(permissoes.podeGerenciarQuadro),
    excluirQuadro: Boolean(permissoes.podeGerenciarQuadro),
    gerenciarMembros: Boolean(permissoes.podeConvidarMembros),
    moverCartoes: Boolean(permissoes.podeCriarCartao),
    editarListas: Boolean(permissoes.podeGerenciarListas),
  };
}

function fromFrontendPerms(permissoes = {}) {
  const payload = {};

  Object.entries(frontendToDbPerms).forEach(([frontKey, dbKey]) => {
    if (permissoes[frontKey] !== undefined) {
      payload[dbKey] = Boolean(permissoes[frontKey]);
    }
  });

  return payload;
}

function adaptPapel(papel) {
  if (!papel) return null;
  return {
    ...papel,
    permissoes: toFrontendPerms(papel.permissoes),
  };
}

class QuadroPapelService {
  async listar(quadroId, filtros = {}) {
    const id = toPositiveInt(quadroId);
    if (!id) {
      const error = new Error("ID de quadro inválido.");
      error.statusCode = 400;
      throw error;
    }

    const lista = await QuadroPapelRepository.listar(id, {
      busca: filtros.busca || "",
      ativo:
        filtros.ativo === undefined
          ? undefined
          : String(filtros.ativo) === "true",
    });

    return lista.map(adaptPapel);
  }

  async obterPorId(quadroId, papelId) {
    const qId = toPositiveInt(quadroId);
    const pId = toPositiveInt(papelId);

    if (!qId || !pId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const papel = await QuadroPapelRepository.obterPorId(qId, pId);
    return adaptPapel(papel);
  }

  async criar(quadroId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    if (!qId) {
      const error = new Error("ID de quadro inválido.");
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
      const error = new Error("O nome do papel é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const permissoesDb = fromFrontendPerms(dados.permissoes || {});

    const criado = await QuadroPapelRepository.criar({
      quadroId: qId,
      nome,
      descricao:
        dados.descricao === undefined || dados.descricao === null
          ? null
          : String(dados.descricao).trim(),
      ...permissoesDb,
      ativo: dados.ativo === undefined ? true : Boolean(dados.ativo),
    });

    return adaptPapel(criado);
  }

  async atualizar(quadroId, papelId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const pId = toPositiveInt(papelId);
    if (!qId || !pId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const atual = await QuadroPapelRepository.obterPorId(qId, pId);
    if (!atual) return null;

    const payload = {};
    if (dados.nome !== undefined) {
      const nome = String(dados.nome).trim();
      if (!nome) {
        const error = new Error("O nome do papel não pode ser vazio.");
        error.statusCode = 400;
        throw error;
      }
      payload.nome = nome;
    }
    if (dados.descricao !== undefined) {
      payload.descricao =
        dados.descricao === null ? null : String(dados.descricao).trim();
    }
    if (dados.ativo !== undefined) {
      payload.ativo = Boolean(dados.ativo);
    }

    const atualizado = await QuadroPapelRepository.atualizar(qId, pId, payload);
    return adaptPapel(atualizado);
  }

  async atualizarPermissoes(quadroId, papelId, permissoes = {}) {
    const qId = toPositiveInt(quadroId);
    const pId = toPositiveInt(papelId);
    if (!qId || !pId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const atual = await QuadroPapelRepository.obterPorId(qId, pId);
    if (!atual) return null;

    const permissoesDb = fromFrontendPerms(permissoes);
    const atualizado = await QuadroPapelRepository.atualizarPermissoes(
      qId,
      pId,
      permissoesDb
    );
    return adaptPapel(atualizado);
  }

  async remover(quadroId, papelId) {
    const qId = toPositiveInt(quadroId);
    const pId = toPositiveInt(papelId);
    if (!qId || !pId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    return QuadroPapelRepository.remover(qId, pId);
  }
}

module.exports = new QuadroPapelService();

