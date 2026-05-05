import { useEffect, useState } from "react";

function parseCurrencyInput(raw) {
  const txt = String(raw || "").trim();
  if (!txt) return null;
  const normalized = txt.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100) / 100;
}

function formatCurrencyInput(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return num.toFixed(2).replace(".", ",");
}

export default function RenderCampoMoeda({
  value = "",
  disabled = false,
  onChange,
  placeholder = "Ex.: 100,00",
}) {
  const [display, setDisplay] = useState(formatCurrencyInput(value));

  useEffect(() => {
    setDisplay(formatCurrencyInput(value));
  }, [value]);

  function handleBlur() {
    if (display.trim() === "") {
      onChange?.("");
      setDisplay("");
      return;
    }
    const parsed = parseCurrencyInput(display);
    if (parsed === null) {
      onChange?.("");
      setDisplay("");
      return;
    }
    onChange?.(parsed);
    setDisplay(formatCurrencyInput(parsed));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      disabled={disabled}
      onChange={(event) => setDisplay(event.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
    />
  );
}
