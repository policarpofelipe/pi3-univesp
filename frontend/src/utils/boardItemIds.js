export function cardSortableId(cartaoId) {
  return `card-${cartaoId}`;
}

export function parseCardSortableId(id) {
  const s = String(id);
  if (!s.startsWith("card-")) return null;
  const n = Number(s.slice(5));
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function columnDroppableId(listaId) {
  return `column-${listaId}`;
}

export function parseColumnDroppableId(id) {
  const s = String(id);
  if (!s.startsWith("column-")) return null;
  const n = Number(s.slice(8));
  return Number.isInteger(n) && n > 0 ? n : null;
}
