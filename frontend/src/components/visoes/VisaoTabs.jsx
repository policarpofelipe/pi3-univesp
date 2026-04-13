export default function VisaoTabs({
  visoes = [],
  activeId = null,
  onSelect,
  onCreate,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {visoes.map((visao) => {
        const active = String(visao.id) === String(activeId);
        return (
          <button
            key={visao.id}
            type="button"
            onClick={() => onSelect?.(visao)}
            className={`rounded-full border px-3 py-1 text-[var(--font-size-sm)] ${
              active
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
            }`}
          >
            {visao.nome}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onCreate}
        className="rounded-full border border-dashed border-[var(--color-border-strong)] px-3 py-1 text-[var(--font-size-sm)] text-[var(--color-text-muted)]"
      >
        + Nova visão
      </button>
    </div>
  );
}
