import React from "react";

export default function RenderCampoSelecao({
  value = "",
  options = [],
  disabled = false,
  onChange,
}) {
  return (
    <select
      value={value || ""}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
    >
      <option value="">Selecione</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
