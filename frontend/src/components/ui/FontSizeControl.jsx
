import React from "react";
import useAccessibility from "../../hooks/useAccessibility";

const OPTIONS = [
  { value: "sm", label: "A-" },
  { value: "md", label: "A" },
  { value: "lg", label: "A+" },
  { value: "xl", label: "A++" },
];

export default function FontSizeControl({
  className = "",
  showLabel = true,
}) {
  const { fontScale, setFontScale } = useAccessibility();

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="group"
      aria-label="Controle de tamanho da fonte"
    >
      {showLabel && (
        <span className="text-sm text-[var(--color-text)] whitespace-nowrap">
          Tamanho da fonte
        </span>
      )}

      <div className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {OPTIONS.map((option) => {
          const isActive = fontScale === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFontScale(option.value)}
              aria-pressed={isActive}
              aria-label={`Definir tamanho da fonte como ${option.label}`}
              title={`Tamanho ${option.label}`}
              className={[
                "min-w-[2.5rem] h-9 px-3 rounded-md text-sm font-medium transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2",
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}