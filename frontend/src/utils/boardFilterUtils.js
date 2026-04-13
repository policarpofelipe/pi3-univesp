/**
 * Filtros rápidos do quadro (recorte momentâneo na tela).
 * "Visões" salvas permanecem na rota dedicada.
 */

export const BOARD_FILTER_PRIORITIES = [
  { value: "", label: "Todas" },
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export const BOARD_FILTER_DEADLINE = [
  { value: "", label: "Qualquer prazo" },
  { value: "overdue", label: "Vencidos" },
  { value: "today", label: "Vencem hoje" },
  { value: "week", label: "Próximos 7 dias" },
  { value: "none", label: "Sem prazo" },
];

export const BOARD_FILTER_SITUATION = [
  { value: "", label: "Qualquer situação" },
  { value: "no_assignee", label: "Sem responsável" },
  { value: "checklist_open", label: "Checklist pendente" },
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function matchesDeadline(cartao, mode) {
  if (!mode) return true;
  const raw = cartao.prazoEm;
  if (mode === "none") return !raw;
  if (!raw) return false;
  const prazo = new Date(raw);
  if (Number.isNaN(prazo.getTime())) return false;
  const now = new Date();
  const sod = startOfDay(now);
  const eod = endOfDay(now);
  const weekEnd = new Date(sod);
  weekEnd.setDate(weekEnd.getDate() + 7);

  if (mode === "overdue") return prazo < sod && !cartao.concluidoEm;
  if (mode === "today") return prazo >= sod && prazo <= eod;
  if (mode === "week") return prazo >= sod && prazo <= weekEnd;
  return true;
}

function matchesSituation(cartao, mode) {
  if (!mode) return true;
  const ids = Array.isArray(cartao.atribuidoUsuarioIds)
    ? cartao.atribuidoUsuarioIds
    : [];
  if (mode === "no_assignee") return ids.length === 0;
  if (mode === "checklist_open") return Number(cartao.checklistItensPendentes) > 0;
  return true;
}

/**
 * @param {object} filters
 * @param {string} filters.busca
 * @param {string} filters.tagId
 * @param {string} filters.prioridade
 * @param {string} filters.prazo
 * @param {string} filters.situacao
 * @param {string} filters.membroId — usuário atribuído ao cartão
 */
export function aplicarFiltrosRapidos(cartoes, filters) {
  if (!Array.isArray(cartoes)) return [];
  const busca = String(filters?.busca || "")
    .trim()
    .toLowerCase();
  const tagId = filters?.tagId ? String(filters.tagId) : "";
  const prioridade = filters?.prioridade ? String(filters.prioridade) : "";
  const prazo = filters?.prazo ? String(filters.prazo) : "";
  const situacao = filters?.situacao ? String(filters.situacao) : "";
  const membroId = filters?.membroId ? String(filters.membroId) : "";

  return cartoes.filter((c) => {
    if (busca && !String(c.titulo || "").toLowerCase().includes(busca)) {
      return false;
    }
    if (tagId) {
      const tids = Array.isArray(c.tagIds) ? c.tagIds.map(String) : [];
      if (!tids.includes(tagId)) return false;
    }
    if (prioridade && String(c.prioridade || "") !== prioridade) {
      return false;
    }
    if (!matchesDeadline(c, prazo)) return false;
    if (!matchesSituation(c, situacao)) return false;
    if (membroId) {
      const ids = Array.isArray(c.atribuidoUsuarioIds)
        ? c.atribuidoUsuarioIds.map(String)
        : [];
      if (!ids.includes(membroId)) return false;
    }
    return true;
  });
}

/**
 * Limiar sugerido para virtualizar cartões por lista (extensão futura).
 * Combinar com @tanstack/react-virtual exige cuidado extra com sensores de DnD.
 */
export const BOARD_VIRTUALIZE_THRESHOLD = 72;

export function filtrosEstaoAtivos(filters) {
  if (!filters) return false;
  return Boolean(
    String(filters.busca || "").trim() ||
      filters.tagId ||
      filters.prioridade ||
      filters.prazo ||
      filters.situacao ||
      filters.membroId
  );
}
