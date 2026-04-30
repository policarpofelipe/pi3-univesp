/**
 * Validação declarativa leve (sem dependência extra).
 *
 * @param {object} rules
 * @param {(body: object) => string[]} [rules.body]
 * @param {(query: object) => string[]} [rules.query]
 * @param {(params: object) => string[]} [rules.params]
 * @returns {import('express').RequestHandler}
 */
function validateRequestMiddleware(rules = {}) {
  return function validateRequest(req, res, next) {
    try {
      const errors = [];

      if (typeof rules.body === "function") {
        errors.push(...(rules.body(req.body || {}) || []));
      }
      if (typeof rules.query === "function") {
        errors.push(...(rules.query(req.query || {}) || []));
      }
      if (typeof rules.params === "function") {
        errors.push(...(rules.params(req.params || {}) || []));
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0] || "Requisição inválida.",
          error: {
            code: "VALIDATION_ERROR",
            message: errors[0] || "Requisição inválida.",
          },
          data: { errors },
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveIntString(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

module.exports = validateRequestMiddleware;
module.exports.isNonEmptyString = isNonEmptyString;
module.exports.isPositiveIntString = isPositiveIntString;
