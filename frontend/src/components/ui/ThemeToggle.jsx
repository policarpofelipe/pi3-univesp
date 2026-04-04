import React from "react";
import { Moon, Sun } from "lucide-react";
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
    ? "Ativar tema padrão"
    : "Ativar tema de alto contraste";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconButton
        icon={
          isHighContrast ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )
        }
        label={nextThemeLabel}
        variant="ghost"
        onClick={handleToggle}
        aria-pressed={isHighContrast}
        aria-label={nextThemeLabel}
      />

      {showLabel && (
        <span
          className="text-sm text-[var(--color-text)]"
          aria-live="polite"
        >
          {isHighContrast ? "Alto contraste" : "Tema padrão"}
        </span>
      )}
    </div>
  );
}