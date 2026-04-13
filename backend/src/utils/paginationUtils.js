/**
 * Extrai limit/offset de query string com teto e padrões.
 */
function parseLimitOffset(query = {}, options = {}) {
  const maxLimit = options.maxLimit ?? 100;
  const defaultLimit = options.defaultLimit ?? 20;

  let limit = Number.parseInt(String(query.limit ?? ""), 10);
  if (!Number.isInteger(limit) || limit <= 0) {
    limit = defaultLimit;
  }
  limit = Math.min(limit, maxLimit);

  let offset = Number.parseInt(String(query.offset ?? ""), 10);
  if (!Number.isInteger(offset) || offset < 0) {
    offset = 0;
  }

  return { limit, offset };
}

/**
 * Inteiro positivo com teto (ex.: limite de busca).
 */
function parsePositiveIntCapped(raw, defaultValue, maxValue) {
  const def = Number.isInteger(defaultValue) && defaultValue > 0 ? defaultValue : 20;
  const max = Number.isInteger(maxValue) && maxValue > 0 ? maxValue : 100;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    return def;
  }
  return Math.min(n, max);
}

module.exports = {
  parseLimitOffset,
  parsePositiveIntCapped,
};
