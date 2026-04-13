const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");

function normalizarSlug(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validarNome(nome) {
  return typeof nome === "string" && nome.trim().length >= 2;
}

function validarSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function validateCriarBody(body = {}) {
  const errors = [];
  if (!validarNome(body.nome)) {
    errors.push("O nome da organização deve ter pelo menos 2 caracteres.");
  }
  if (!body.slug || String(body.slug).trim() === "") {
    errors.push("O slug da organização é obrigatório.");
  } else {
    const slugNorm = normalizarSlug(body.slug);
    if (!validarSlug(slugNorm)) {
      errors.push(
        "Slug inválido após normalização. Use letras minúsculas, números e hífen."
      );
    }
  }
  return errors;
}

function validateAtualizarBody(body = {}) {
  const errors = [];
  if (body.nome !== undefined && !validarNome(body.nome)) {
    errors.push("O nome da organização deve ter pelo menos 2 caracteres.");
  }
  if (body.slug !== undefined) {
    if (!body.slug || String(body.slug).trim() === "") {
      errors.push("O slug da organização não pode ficar vazio.");
    } else {
      const slugNorm = normalizarSlug(body.slug);
      if (!validarSlug(slugNorm)) {
        errors.push(
          "Slug inválido. Use apenas letras minúsculas, números e hífen."
        );
      }
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
