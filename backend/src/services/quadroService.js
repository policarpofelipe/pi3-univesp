const QuadroRepository = require("../repositories/QuadroRepository");
const OrganizacaoRepository = require("../repositories/OrganizacaoRepository");
const QuadroPapelRepository = require("../repositories/QuadroPapelRepository");
const QuadroMembroRepository = require("../repositories/QuadroMembroRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const { parseLimitOffset } = require("../utils/paginationUtils");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class QuadroService {
  async listar(filtros = {}) {
    const organizacaoId = filtros.organizacaoId
      ? toPositiveInt(filtros.organizacaoId)
      : undefined;
    const arquivado =
      filtros.arquivado === undefined
        ? undefined
        : String(filtros.arquivado) === "true";

    let limit;
    let offset;
    if (filtros.limit !== undefined || filtros.offset !== undefined) {
      const parsed = parseLimitOffset(
        { limit: filtros.limit, offset: filtros.offset },
        { defaultLimit: 50, maxLimit: 200 }
      );
      limit = parsed.limit;
      offset = parsed.offset;
    }

    return QuadroRepository.listar({
      organizacaoId,
      busca: filtros.busca || "",
      arquivado,
      limit,
      offset,
    });
  }

  async obterPorId(quadroId) {
    return QuadroRepository.obterPorId(quadroId);
  }

  async criar(dados = {}) {
    const organizacaoId = toPositiveInt(dados.organizacaoId);
    if (!organizacaoId) {
      const error = new Error("organizacaoId é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const nome = String(dados.nome || "").trim();
    if (!nome) {
      const error = new Error("O nome do quadro é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const organizacao = await OrganizacaoRepository.obterPorId(organizacaoId);
    if (!organizacao) {
      const error = new Error("Organização não encontrada.");
      error.statusCode = 404;
      throw error;
    }

    const criadorId = toPositiveInt(dados.criadoPorUsuarioId);
    if (!criadorId) {
      const error = new Error("Não foi possível identificar o usuário criador do quadro.");
      error.statusCode = 400;
      throw error;
    }

    const membroOrg = await OrganizacaoRepository.obterMembroPorUsuarioId(
      organizacaoId,
      criadorId
    );
    if (!membroOrg || membroOrg.status !== "ativo") {
      const error = new Error("Você não tem permissão para criar quadros nesta organização.");
      error.statusCode = 403;
      throw error;
    }

    const quadro = await QuadroRepository.criar({
      organizacaoId,
      nome,
      descricao:
        dados.descricao === undefined || dados.descricao === null
          ? null
          : String(dados.descricao).trim(),
      criadoPorUsuarioId: criadorId,
    });

    const papelAdmin = await QuadroPapelRepository.criar({
      quadroId: quadro.id,
      nome: "Administrador",
      descricao: "Papel padrão com permissões totais no quadro.",
      podeGerenciarQuadro: true,
      podeGerenciarListas: true,
      podeGerenciarAutomacoes: true,
      podeGerenciarCampos: true,
      podeConvidarMembros: true,
      podeCriarCartao: true,
      ativo: true,
    });

    await QuadroMembroRepository.adicionar({
      quadroId: quadro.id,
      usuarioId: criadorId,
      status: "ativo",
      papelIds: [papelAdmin.id],
    });

    return QuadroRepository.obterPorId(quadro.id);
  }

  async atualizar(quadroId, dados = {}) {
    const payload = {};

    if (dados.nome !== undefined) {
      const nome = String(dados.nome).trim();
      if (!nome) {
        const error = new Error("O nome do quadro não pode ser vazio.");
        error.statusCode = 400;
        throw error;
      }
      payload.nome = nome;
    }

    if (dados.descricao !== undefined) {
      payload.descricao =
        dados.descricao === null ? null : String(dados.descricao).trim();
    }

    const atual = await QuadroRepository.obterPorId(quadroId);
    if (!atual) return null;

    return QuadroRepository.atualizar(quadroId, payload);
  }

  async remover(quadroId) {
    const atual = await QuadroRepository.obterPorId(quadroId);
    if (!atual) return false;
    return QuadroRepository.remover(quadroId);
  }

  async arquivar(quadroId) {
    const atual = await QuadroRepository.obterPorId(quadroId);
    if (!atual) return null;
    return QuadroRepository.arquivar(quadroId);
  }

  async desarquivar(quadroId) {
    const atual = await QuadroRepository.obterPorId(quadroId);
    if (!atual) return null;
    return QuadroRepository.desarquivar(quadroId);
  }

  async obterConfiguracoes(quadroId, usuarioId) {
    const quadro = await QuadroRepository.obterPorId(quadroId);
    if (!quadro) return null;

    const pref = usuarioId
      ? await QuadroRepository.obterPreferenciasUsuario(quadroId, usuarioId)
      : null;

    return {
      quadroId: quadro.id,
      arquivado: Boolean(quadro.arquivadoEm),
      preferenciasUsuario: pref || null,
    };
  }

  async atualizarConfiguracoes(quadroId, usuarioId, dados = {}) {
    const quadro = await QuadroRepository.obterPorId(quadroId);
    if (!quadro) return null;

    let atualizadoQuadro = quadro;
    if (dados.arquivado === true) {
      atualizadoQuadro = await QuadroRepository.arquivar(quadroId);
    } else if (dados.arquivado === false) {
      atualizadoQuadro = await QuadroRepository.desarquivar(quadroId);
    }

    let preferenciasUsuario = null;
    if (usuarioId && (dados.tema || dados.corFundo !== undefined || dados.compacto !== undefined)) {
      preferenciasUsuario = await QuadroRepository.atualizarPreferenciasUsuario(
        quadroId,
        usuarioId,
        {
          tema: dados.tema,
          corFundo: dados.corFundo,
          compacto: dados.compacto,
        }
      );
    } else if (usuarioId) {
      preferenciasUsuario = await QuadroRepository.obterPreferenciasUsuario(
        quadroId,
        usuarioId
      );
    }

    return {
      quadroId: atualizadoQuadro.id,
      arquivado: Boolean(atualizadoQuadro.arquivadoEm),
      preferenciasUsuario,
    };
  }

  async obterPreferenciasUsuario(quadroId, usuarioId) {
    const qId = toPositiveInt(quadroId);
    const uId = toPositiveInt(usuarioId);
    if (!qId || !uId) {
      const error = new Error("IDs inválidos para preferências de quadro.");
      error.statusCode = 400;
      error.code = "QUADRO_PREF_INVALID_IDS";
      throw error;
    }
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    const usuario = await UsuarioRepository.findById(uId);
    if (!usuario) {
      const error = new Error("Usuário não encontrado.");
      error.statusCode = 404;
      error.code = "QUADRO_PREF_USER_NOT_FOUND";
      throw error;
    }
    const pref = await QuadroRepository.obterPreferenciasUsuario(qId, uId);
    if (pref) return pref;
    return {
      quadroId: qId,
      usuarioId: uId,
      tema: "sistema",
      corFundo: null,
      compacto: false,
      atualizadoEm: null,
    };
  }

  async atualizarPreferenciasUsuario(quadroId, usuarioId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const uId = toPositiveInt(usuarioId);
    if (!qId || !uId) {
      const error = new Error("IDs inválidos para preferências de quadro.");
      error.statusCode = 400;
      error.code = "QUADRO_PREF_INVALID_IDS";
      throw error;
    }
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    const usuario = await UsuarioRepository.findById(uId);
    if (!usuario) {
      const error = new Error("Usuário não encontrado.");
      error.statusCode = 404;
      error.code = "QUADRO_PREF_USER_NOT_FOUND";
      throw error;
    }
    const tema = String(dados.tema || "sistema").trim().toLowerCase();
    if (!["claro", "escuro", "sistema"].includes(tema)) {
      const error = new Error("Tema inválido. Use: claro, escuro ou sistema.");
      error.statusCode = 400;
      error.code = "QUADRO_PREF_INVALID_THEME";
      throw error;
    }
    const corFundo =
      dados.corFundo === undefined || dados.corFundo === null || dados.corFundo === ""
        ? null
        : String(dados.corFundo).trim();
    if (corFundo && !/^#[0-9A-Fa-f]{6}$/.test(corFundo)) {
      const error = new Error("Cor de fundo inválida. Use formato #RRGGBB.");
      error.statusCode = 400;
      error.code = "QUADRO_PREF_INVALID_COLOR";
      throw error;
    }
    return QuadroRepository.atualizarPreferenciasUsuario(qId, uId, {
      tema,
      corFundo,
      compacto: Boolean(dados.compacto),
    });
  }
}

module.exports = new QuadroService();

