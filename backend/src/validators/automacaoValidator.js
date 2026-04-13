const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");

const GATILHOS = new Set([
  "AO_CRIAR_CARTAO",
  "AO_ENTRAR_NA_LISTA",
  "AO_SAIR_DA_LISTA",
  "AO_ATUALIZAR_CAMPO",
  "AO_VENCER_PRAZO",
]);

function normalizeGatilho(val) {
  return String(val || "").trim().toUpperCase();
}

function validateCriarBody(body = {}) {
  const errors = [];
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const gatilho = normalizeGatilho(body.gatilho);
  if (!nome) {
    errors.push("Nome da automação é obrigatório.");
  }
  if (!GATILHOS.has(gatilho)) {
    errors.push(
      "Gatilho inválido. Use: AO_CRIAR_CARTAO, AO_ENTRAR_NA_LISTA, AO_SAIR_DA_LISTA, AO_ATUALIZAR_CAMPO ou AO_VENCER_PRAZO."
    );
  }
  return errors;
}

function validateAtualizarBody(body = {}) {
  const errors = [];
  if (body.nome !== undefined) {
    const nome = String(body.nome).trim();
    if (!nome) {
      errors.push("Nome da automação não pode ser vazio.");
    }
  }
  if (body.gatilho !== undefined && body.gatilho !== null && body.gatilho !== "") {
    const g = normalizeGatilho(body.gatilho);
    if (!GATILHOS.has(g)) {
      errors.push("Gatilho inválido.");
    }
  }
  return errors;
}

module.exports = {
  validateCriarBody,
  validateAtualizarBody,
  criar: () => validateRequestMiddleware({ body: validateCriarBody }),
  atualizar: () => validateRequestMiddleware({ body: validateAtualizarBody }),
};
