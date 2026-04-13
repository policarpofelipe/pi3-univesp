const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmailFormat(email) {
  if (!isNonEmptyString(email)) return false;
  const s = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function validateLoginBody(body = {}) {
  const errors = [];
  if (!isNonEmptyString(body.email)) {
    errors.push("E-mail é obrigatório.");
  } else if (!isValidEmailFormat(body.email)) {
    errors.push("E-mail em formato inválido.");
  }
  if (!isNonEmptyString(body.senha)) {
    errors.push("Senha é obrigatória.");
  }
  return errors;
}

function validateRegisterBody(body = {}) {
  const errors = [];
  const nome = typeof body.nomeExibicao === "string" ? body.nomeExibicao.trim() : "";
  if (nome.length < 2) {
    errors.push("Nome de exibição deve ter pelo menos 2 caracteres.");
  }
  if (!isNonEmptyString(body.email)) {
    errors.push("E-mail é obrigatório.");
  } else if (!isValidEmailFormat(body.email)) {
    errors.push("E-mail em formato inválido.");
  }
  const senha = typeof body.senha === "string" ? body.senha : "";
  if (senha.length < 6) {
    errors.push("Senha deve ter pelo menos 6 caracteres.");
  }
  return errors;
}

function validateForgotPasswordBody(body = {}) {
  const errors = [];
  if (!isNonEmptyString(body.email)) {
    errors.push("E-mail é obrigatório.");
  } else if (!isValidEmailFormat(body.email)) {
    errors.push("E-mail em formato inválido.");
  }
  return errors;
}

module.exports = {
  validateLoginBody,
  validateRegisterBody,
  validateForgotPasswordBody,
  login: () => validateRequestMiddleware({ body: validateLoginBody }),
  register: () => validateRequestMiddleware({ body: validateRegisterBody }),
  forgotPassword: () => validateRequestMiddleware({ body: validateForgotPasswordBody }),
};
