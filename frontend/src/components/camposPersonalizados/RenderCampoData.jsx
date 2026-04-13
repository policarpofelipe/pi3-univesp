import React from "react";

export default function RenderCampoData({
  value = "",
  disabled = false,
  onChange,
}) {
  return (
    <input
      type="date"
      value={value || ""}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
    />
  );
}
