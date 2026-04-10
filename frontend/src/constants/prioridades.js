export const PRIORIDADES_CARTAO = [
  { id: "baixa", label: "Baixa" },
  { id: "media", label: "Média" },
  { id: "alta", label: "Alta" },
];

export const IDS_PRIORIDADE_CARTAO = PRIORIDADES_CARTAO.map((p) => p.id);

export function labelPrioridadeCartao(id) {
  if (!id) return "";
  return PRIORIDADES_CARTAO.find((p) => p.id === id)?.label ?? id;
}
