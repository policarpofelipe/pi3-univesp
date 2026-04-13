import React from "react";

export default function RenderCampoBooleano({
  value = false,
  disabled = false,
  onChange,
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
      <input
        type="checkbox"
        checked={Boolean(value)}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      Sim/Não
    </label>
  );
}
