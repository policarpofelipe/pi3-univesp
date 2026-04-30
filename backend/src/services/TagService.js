const QuadroRepository = require("../repositories/QuadroRepository");
const TagRepository = require("../repositories/TagRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class TagService {
  async validarQuadro(quadroId) {
    const qId = toPositiveInt(quadroId);
    if (!qId) {
      const error = new Error("ID de quadro inválido.");
      error.statusCode = 400;
      error.code = "TAG_INVALID_QUADRO_ID";
      throw error;
    }
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;
    return qId;
  }

  async listar(quadroId) {
    const qId = await this.validarQuadro(quadroId);
    if (!qId) return null;
    return TagRepository.listar(qId);
  }

  async criar(quadroId, dados = {}) {
    const qId = await this.validarQuadro(quadroId);
    if (!qId) return null;

    const nome = String(dados.nome || "").trim();
    const cor = String(dados.cor || "#64748b").trim();
    if (!nome) {
      const error = new Error("O nome da tag é obrigatório.");
      error.statusCode = 400;
      error.code = "TAG_NOME_OBRIGATORIO";
      throw error;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(cor)) {
      const error = new Error("Cor inválida. Use formato hexadecimal #RRGGBB.");
      error.statusCode = 400;
      error.code = "TAG_COR_INVALIDA";
      throw error;
    }

    const jaExiste = await TagRepository.obterPorNome(qId, nome);
    if (jaExiste && jaExiste.ativa) {
      const error = new Error("Já existe uma tag com este nome no quadro.");
      error.statusCode = 409;
      error.code = "TAG_DUPLICADA";
      throw error;
    }
    try {
      if (jaExiste && !jaExiste.ativa) {
        return TagRepository.atualizar(qId, jaExiste.id, { nome, cor, ativa: true });
      }
      return TagRepository.criar({ quadroId: qId, nome, cor, ativa: true });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        const conflict = new Error("Já existe uma tag com este nome no quadro.");
        conflict.statusCode = 409;
        conflict.code = "TAG_DUPLICADA";
        throw conflict;
      }
      throw error;
    }
  }

  async atualizar(quadroId, tagId, dados = {}) {
    const qId = await this.validarQuadro(quadroId);
    if (!qId) return null;
    const tId = toPositiveInt(tagId);
    if (!tId) {
      const error = new Error("ID de tag inválido.");
      error.statusCode = 400;
      error.code = "TAG_INVALID_ID";
      throw error;
    }
    const atual = await TagRepository.obterPorId(qId, tId);
    if (!atual) return null;

    const payload = {};
    if (dados.nome !== undefined) {
      const nome = String(dados.nome || "").trim();
      if (!nome) {
        const error = new Error("O nome da tag é obrigatório.");
        error.statusCode = 400;
        error.code = "TAG_NOME_OBRIGATORIO";
        throw error;
      }
      const repetida = await TagRepository.obterPorNome(qId, nome);
      if (repetida && Number(repetida.id) !== Number(tId) && repetida.ativa) {
        const error = new Error("Já existe uma tag com este nome no quadro.");
        error.statusCode = 409;
        error.code = "TAG_DUPLICADA";
        throw error;
      }
      payload.nome = nome;
    }
    if (dados.cor !== undefined) {
      const cor = String(dados.cor || "").trim();
      if (!/^#[0-9A-Fa-f]{6}$/.test(cor)) {
        const error = new Error("Cor inválida. Use formato hexadecimal #RRGGBB.");
        error.statusCode = 400;
        error.code = "TAG_COR_INVALIDA";
        throw error;
      }
      payload.cor = cor;
    }
    if (dados.ativa !== undefined) {
      payload.ativa = Boolean(dados.ativa);
    }
    try {
      return TagRepository.atualizar(qId, tId, payload);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        const conflict = new Error("Já existe uma tag com este nome no quadro.");
        conflict.statusCode = 409;
        conflict.code = "TAG_DUPLICADA";
        throw conflict;
      }
      throw error;
    }
  }

  async remover(quadroId, tagId) {
    const qId = await this.validarQuadro(quadroId);
    if (!qId) return null;
    const tId = toPositiveInt(tagId);
    if (!tId) {
      const error = new Error("ID de tag inválido.");
      error.statusCode = 400;
      error.code = "TAG_INVALID_ID";
      throw error;
    }
    const atual = await TagRepository.obterPorId(qId, tId);
    if (!atual) return null;
    await TagRepository.desativar(qId, tId);
    return true;
  }
}

module.exports = new TagService();
