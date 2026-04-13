const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");

const TIPOS = new Set([
  "texto_curto",
  "texto_longo",
  "numero",
  "data",
  "data_hora",
  "booleano",
  "selecao",
  "usuario",
]);

function validateCriarBody(body = {}) {
  const errors = [];
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const tipo = typeof body.tipo === "string" ? body.tipo.trim() : "";
  if (!nome) {
    errors.push("Nome do campo é obrigatório.");
  }
  if (!tipo) {
    errors.push("Tipo do campo é obrigatório.");
  } else if (!TIPOS.has(tipo)) {
    errors.push(
      "Tipo inválido. Use: texto_curto, texto_longo, numero, data, data_hora, booleano, selecao ou usuario."
    );
  }
  return errors;
}

function validateAtualizarBody(body = {}) {
  const errors = [];
  if (body.nome !== undefined) {
    const nome = String(body.nome).trim();
    if (!nome) {
      errors.push("Nome do campo não pode ser vazio.");
    }
  }
  if (body.tipo !== undefined && body.tipo !== null && body.tipo !== "") {
    const tipo = String(body.tipo).trim();
    if (!TIPOS.has(tipo)) {
      errors.push("Tipo de campo inválido.");
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
