import React from "react";

export default function RenderCampoNumero({
  value = "",
  disabled = false,
  onChange,
  placeholder = "Digite um número",
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      disabled={disabled}
      onChange={(event) =>
        onChange?.(event.target.value === "" ? "" : Number(event.target.value))
      }
      placeholder={placeholder}
      className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
    />
  );
}
