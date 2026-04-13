/**
 * Próxima posição após o máximo atual (ex.: MAX(posicao) em uma lista).
 */
function nextAfterMax(maxValue) {
  const n = Number(maxValue);
  const base = Number.isFinite(n) && n >= 0 ? n : 0;
  return base + 1;
}

/**
 * Índice de inserção para reordenação (0 .. length).
 */
function clampInsertIndex(index, length) {
  const len = Number.isInteger(length) && length >= 0 ? length : 0;
  if (index == null || index === "") {
    return len;
  }
  const n = Number(index);
  if (!Number.isInteger(n)) {
    return len;
  }
  return Math.max(0, Math.min(n, len));
}

module.exports = {
  nextAfterMax,
  clampInsertIndex,
};
