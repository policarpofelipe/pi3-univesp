/**
 * Converte Date ou string parseável para string `YYYY-MM-DD HH:mm:ss` (UTC).
 */
function toMysqlDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Mesmo contrato usado em prazos de cartão: undefined = não alterar; null/'' = limpar; senão datetime.
 * @returns {{ skip: true } | { invalid: true } | { value: string }}
 */
function normalizeOptionalDateTimeInput(val) {
  if (val === undefined) return { skip: true };
  if (val === null || val === "") return { value: null };
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return { invalid: true };
  return { value: toMysqlDateTime(d) };
}

module.exports = {
  toMysqlDateTime,
  normalizeOptionalDateTimeInput,
};
