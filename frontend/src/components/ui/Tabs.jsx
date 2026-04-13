export default function Tabs({
  items = [],
  activeKey,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange?.(item.key)}
            className={`rounded-full border px-3 py-1 text-[var(--font-size-sm)] ${
              active
                ? "border-[var(--color-primary)] bg-[var(--color-info-surface)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
