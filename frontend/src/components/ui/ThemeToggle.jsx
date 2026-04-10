import React from "react";
import { Contrast } from "lucide-react";
import IconButton from "./IconButton";
import useAccessibility from "../../hooks/useAccessibility";

export default function ThemeToggle({
  className = "",
  showLabel = false,
}) {
  const { theme, setTheme } = useAccessibility();

  const isHighContrast = theme === "high-contrast";

  function handleToggle() {
    setTheme(isHighContrast ? "default" : "high-contrast");
  }

  const nextThemeLabel = isHighContrast
    ? "Voltar ao tema de cores padrão"
    : "Ativar alto contraste";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconButton
        icon={<Contrast className="h-5 w-5" strokeWidth={isHighContrast ? 2.5 : 2} />}
        label={nextThemeLabel}
        variant="ghost"
        onClick={handleToggle}
        aria-pressed={isHighContrast}
        aria-label={nextThemeLabel}
      />

      {showLabel && (
        <span
          className="text-[var(--font-size-sm)] text-[var(--color-text)]"
          aria-live="polite"
        >
          {isHighContrast ? "Alto contraste ativo" : "Contraste padrão"}
        </span>
      )}
    </div>
  );
}