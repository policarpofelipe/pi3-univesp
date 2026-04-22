const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");

function corHexValida(cor) {
  return /^#[0-9a-fA-F]{6}$/.test(String(cor || "").trim());
}

function validateCriarBody(body = {}) {
  const errors = [];
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  if (!nome) {
    errors.push("O nome da lista é obrigatório.");
  }
  if (body.limiteWip !== undefined && body.limiteWip !== null && body.limiteWip !== "") {
    const n = Number(body.limiteWip);
    if (!Number.isFinite(n) || n <= 0) {
      errors.push("limiteWip deve ser um número positivo ou vazio.");
    }
  }
  if (body.cor !== undefined && body.cor !== null && body.cor !== "") {
    if (!corHexValida(body.cor)) {
      errors.push("cor deve estar no formato hexadecimal #RRGGBB.");
    }
  }
  return errors;
}

function validateAtualizarBody(body = {}) {
  const errors = [];
  if (body.nome !== undefined) {
    const nome = String(body.nome).trim();
    if (!nome) {
      errors.push("O nome da lista não pode ser vazio.");
    }
  }
  if (body.limiteWip !== undefined && body.limiteWip !== null && body.limiteWip !== "") {
    const n = Number(body.limiteWip);
    if (!Number.isFinite(n) || n <= 0) {
      errors.push("limiteWip deve ser um número positivo ou nulo.");
    }
  }
  if (body.cor !== undefined && body.cor !== null && body.cor !== "") {
    if (!corHexValida(body.cor)) {
      errors.push("cor deve estar no formato hexadecimal #RRGGBB.");
    }
  }
  return errors;
}

function validateReordenarBody(body = {}) {
  const errors = [];
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    errors.push("Envie um array ids com a nova ordem das listas.");
    return errors;
  }
  const invalid = body.ids.some((id) => {
    const n = Number(id);
    return !Number.isInteger(n) || n <= 0;
  });
  if (invalid) {
    errors.push("Todos os ids de lista devem ser inteiros positivos.");
  }
  return errors;
}

module.exports = {
  validateCriarBody,
  validateAtualizarBody,
  validateReordenarBody,
  criar: () => validateRequestMiddleware({ body: validateCriarBody }),
  atualizar: () => validateRequestMiddleware({ body: validateAtualizarBody }),
  reordenar: () => validateRequestMiddleware({ body: validateReordenarBody }),
};
