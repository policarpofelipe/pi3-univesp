const QuadroMembroRepository = require("../repositories/QuadroMembroRepository");
const QuadroRepository = require("../repositories/QuadroRepository");
const QuadroPapelRepository = require("../repositories/QuadroPapelRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const OrganizacaoRepository = require("../repositories/OrganizacaoRepository");

const STATUS_VALIDOS = new Set(["ativo", "convidado", "suspenso"]);

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function adaptMembro(membro) {
  if (!membro) return null;
  const papeis = Array.isArray(membro.papeis) ? membro.papeis : [];
  return {
    ...membro,
    papel: papeis[0]?.nome || null,
    entrouEm: membro.criadoEm,
  };
}

class QuadroMembroService {
  async listar(quadroId, filtros = {}) {
    const qId = toPositiveInt(quadroId);
    if (!qId) {
      const error = new Error("ID de quadro inválido.");
      error.statusCode = 400;
      throw error;
    }

    const membros = await QuadroMembroRepository.listar(qId, {
      status: filtros.status,
      busca: filtros.busca || "",
    });

    return membros.map(adaptMembro);
  }

  async obterPorId(quadroId, membroId) {
    const qId = toPositiveInt(quadroId);
    const mId = toPositiveInt(membroId);
    if (!qId || !mId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const membro = await QuadroMembroRepository.obterPorId(qId, mId);
    return adaptMembro(membro);
  }

  async adicionar(quadroId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const usuarioId = toPositiveInt(dados.usuarioId);
    if (!qId || !usuarioId) {
      const error = new Error("quadroId e usuarioId são obrigatórios.");
      error.statusCode = 400;
      throw error;
    }

    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) {
      const error = new Error("Quadro não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const usuario = await UsuarioRepository.findById(usuarioId);
    if (!usuario) {
      const error = new Error("Usuário não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const vinculoOrg = await OrganizacaoRepository.obterMembroPorUsuarioId(
      quadro.organizacaoId,
      usuarioId
    );
    if (!vinculoOrg) {
      const error = new Error(
        "Usuário precisa ser membro da organização para entrar no quadro."
      );
      error.statusCode = 409;
      throw error;
    }

    const existente = await QuadroMembroRepository.obterPorUsuarioId(qId, usuarioId);
    if (existente) {
      const error = new Error("Usuário já é membro deste quadro.");
      error.statusCode = 409;
      throw error;
    }

    const status = dados.status || "ativo";
    if (!STATUS_VALIDOS.has(status)) {
      const error = new Error("Status do membro inválido.");
      error.statusCode = 400;
      throw error;
    }

    const criado = await QuadroMembroRepository.adicionar({
      quadroId: qId,
      usuarioId,
      status,
      papelIds: Array.isArray(dados.papelIds) ? dados.papelIds : [],
    });

    return adaptMembro(criado);
  }

  async convidar(quadroId, dados = {}) {
    const email = String(dados.email || "").trim();
    if (!email) {
      const error = new Error("E-mail é obrigatório para convite.");
      error.statusCode = 400;
      throw error;
    }

    const usuario = await UsuarioRepository.findByEmail(email);
    if (!usuario) {
      const error = new Error("Usuário com este e-mail não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const criado = await this.adicionar(quadroId, {
      usuarioId: usuario.id,
      status: "convidado",
    });

    return criado;
  }

  async atualizar(quadroId, membroId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    const mId = toPositiveInt(membroId);
    if (!qId || !mId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const atual = await QuadroMembroRepository.obterPorId(qId, mId);
    if (!atual) return null;

    const payload = {};
    if (dados.status !== undefined) {
      if (!STATUS_VALIDOS.has(dados.status)) {
        const error = new Error("Status do membro inválido.");
        error.statusCode = 400;
        throw error;
      }
      payload.status = dados.status;
    }
    if (Array.isArray(dados.papelIds)) {
      payload.papelIds = dados.papelIds;
    }

    const atualizado = await QuadroMembroRepository.atualizar(qId, mId, payload);
    return adaptMembro(atualizado);
  }

  async atualizarPapelPorNome(quadroId, membroId, nomePapel) {
    const qId = toPositiveInt(quadroId);
    const mId = toPositiveInt(membroId);
    if (!qId || !mId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const nome = String(nomePapel || "").trim();
    if (!nome) {
      const error = new Error("O papel é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const papeis = await QuadroPapelRepository.listar(qId, {});
    const papel = papeis.find((p) => p.nome.toLowerCase() === nome.toLowerCase());
    if (!papel) {
      const error = new Error("Papel informado não existe neste quadro.");
      error.statusCode = 404;
      throw error;
    }

    const atualizado = await QuadroMembroRepository.atualizarPapeis(qId, mId, [
      papel.id,
    ]);
    return adaptMembro(atualizado);
  }

  async remover(quadroId, membroId) {
    const qId = toPositiveInt(quadroId);
    const mId = toPositiveInt(membroId);
    if (!qId || !mId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }
    return QuadroMembroRepository.remover(qId, mId);
  }
}

module.exports = new QuadroMembroService();

