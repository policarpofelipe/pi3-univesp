import Button from "../ui/Button";

export default function VisaoListaResultados({
  visoes = [],
  activeId = null,
  onEditar,
  onRemover,
}) {
  return (
    <div className="space-y-2">
      {visoes.map((visao) => {
        const active = String(visao.id) === String(activeId);
        return (
          <article
            key={visao.id}
            className={`rounded-lg border p-3 ${
              active
                ? "border-[var(--color-brand-primary)]"
                : "border-[var(--color-border)]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
                  {visao.nome}
                </strong>
                <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                  Tipo: {visao.tipo || "personalizada"} |{" "}
                  {visao.ativa ? "Ativa" : "Inativa"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => onEditar?.(visao)}>
                  Editar
                </Button>
                <Button variant="ghost" onClick={() => onRemover?.(visao)}>
                  Remover
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
