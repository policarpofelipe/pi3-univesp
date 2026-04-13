const QuadroRepository = require("../repositories/QuadroRepository");
const OrganizacaoRepository = require("../repositories/OrganizacaoRepository");

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

    return QuadroRepository.listar({
      organizacaoId,
      busca: filtros.busca || "",
      arquivado,
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

    return QuadroRepository.criar({
      organizacaoId,
      nome,
      descricao:
        dados.descricao === undefined || dados.descricao === null
          ? null
          : String(dados.descricao).trim(),
      criadoPorUsuarioId: dados.criadoPorUsuarioId || null,
    });
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
}

module.exports = new QuadroService();

