const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");

const PRIORIDADES = new Set(["baixa", "media", "alta", "urgente"]);

function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function prazoInvalido(val) {
  if (val === undefined || val === null || val === "") return false;
  const d = new Date(val);
  return Number.isNaN(d.getTime());
}

function validateCriarBody(body = {}) {
  const errors = [];
  const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
  if (!titulo) {
    errors.push("O título do cartão é obrigatório.");
  }
  if (!toPositiveInt(body.listaId)) {
    errors.push("listaId é obrigatório e deve ser um inteiro positivo.");
  }
  if (body.prioridade !== undefined && body.prioridade !== null && body.prioridade !== "") {
    const p = String(body.prioridade).trim().toLowerCase();
    if (!PRIORIDADES.has(p)) {
      errors.push("Prioridade inválida. Use: baixa, media, alta ou urgente.");
    }
  }
  if (prazoInvalido(body.prazoEm)) {
    errors.push("Data de prazo inválida.");
  }
  if (body.tagIds !== undefined && body.tagIds !== null && !Array.isArray(body.tagIds)) {
    errors.push("tagIds deve ser um array.");
  }
  return errors;
}

function validateAtualizarBody(body = {}) {
  const errors = [];
  if (body.titulo !== undefined) {
    const titulo = String(body.titulo).trim();
    if (!titulo) {
      errors.push("O título não pode ser vazio.");
    }
  }
  if (body.prioridade !== undefined && body.prioridade !== null && body.prioridade !== "") {
    const p = String(body.prioridade).trim().toLowerCase();
    if (!PRIORIDADES.has(p)) {
      errors.push("Prioridade inválida. Use: baixa, media, alta ou urgente.");
    }
  }
  if (prazoInvalido(body.prazoEm)) {
    errors.push("Data de prazo inválida.");
  }
  if (body.tagIds !== undefined && body.tagIds !== null && !Array.isArray(body.tagIds)) {
    errors.push("tagIds deve ser um array.");
  }
  return errors;
}

function validateMoverBody(body = {}) {
  const errors = [];
  if (!toPositiveInt(body.listaId)) {
    errors.push("listaId é obrigatório e deve ser um inteiro positivo.");
  }
  if (
    body.posicao !== undefined &&
    body.posicao !== null &&
    body.posicao !== ""
  ) {
    const n = Number(body.posicao);
    if (!Number.isInteger(n) || n < 0) {
      errors.push("posicao deve ser um inteiro não negativo.");
    }
  }
  return errors;
}

module.exports = {
  validateCriarBody,
  validateAtualizarBody,
  validateMoverBody,
  criar: () => validateRequestMiddleware({ body: validateCriarBody }),
  atualizar: () => validateRequestMiddleware({ body: validateAtualizarBody }),
  mover: () => validateRequestMiddleware({ body: validateMoverBody }),
};
