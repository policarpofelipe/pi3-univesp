export function normalizeSearch(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function includesText(haystack, needle) {
  const h = normalizeSearch(haystack);
  const n = normalizeSearch(needle);
  if (!n) return true;
  return h.includes(n);
}
