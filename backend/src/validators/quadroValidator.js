const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");

function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function validateCriarBody(body = {}) {
  const errors = [];
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  if (!nome) {
    errors.push("O nome do quadro é obrigatório.");
  }
  if (!toPositiveInt(body.organizacaoId)) {
    errors.push("organizacaoId inválido ou ausente.");
  }
  return errors;
}

function validateAtualizarBody(body = {}) {
  const errors = [];
  if (body.nome !== undefined) {
    const nome = String(body.nome).trim();
    if (!nome) {
      errors.push("O nome do quadro não pode ser vazio.");
    }
  }
  return errors;
}

const TEMAS = new Set(["claro", "escuro", "sistema"]);

function validateConfiguracoesBody(body = {}) {
  const errors = [];
  if (body.tema !== undefined && body.tema !== null && body.tema !== "") {
    const t = String(body.tema).trim().toLowerCase();
    if (!TEMAS.has(t)) {
      errors.push("tema inválido. Use: claro, escuro ou sistema.");
    }
  }
  if (body.arquivado !== undefined && body.arquivado !== null) {
    if (typeof body.arquivado !== "boolean") {
      errors.push("arquivado deve ser booleano.");
    }
  }
  if (body.compacto !== undefined && body.compacto !== null) {
    if (typeof body.compacto !== "boolean") {
      errors.push("compacto deve ser booleano.");
    }
  }
  if (body.corFundo !== undefined && body.corFundo !== null) {
    if (typeof body.corFundo !== "string") {
      errors.push("corFundo deve ser texto.");
    }
  }
  return errors;
}

module.exports = {
  validateCriarBody,
  validateAtualizarBody,
  validateConfiguracoesBody,
  criar: () => validateRequestMiddleware({ body: validateCriarBody }),
  atualizar: () => validateRequestMiddleware({ body: validateAtualizarBody }),
  configuracoes: () =>
    validateRequestMiddleware({ body: validateConfiguracoesBody }),
};
