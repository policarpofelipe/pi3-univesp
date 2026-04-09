import React, { createContext, useEffect, useMemo, useState } from "react";

export const AccessibilityContext = createContext(null);

const STORAGE_KEYS = {
  theme: "app_theme",
  fontScale: "app_font_scale",
};

const DEFAULTS = {
  theme: "default", // default | high-contrast
  fontScale: "md",  // sm | md | lg | xl
};

export function AccessibilityProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.theme) || DEFAULTS.theme;
  });

  const [fontScale, setFontScale] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.fontScale) || DEFAULTS.fontScale;
  });

  // Persistência
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontScale, fontScale);
  }, [fontScale]);

  // Aplicação no DOM (essencial)
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme", theme);
    root.setAttribute("data-font-scale", fontScale);
  }, [theme, fontScale]);

  // API exposta
  const value = useMemo(() => {
    return {
      theme,
      setTheme,
      toggleTheme: () =>
        setTheme((prev) =>
          prev === "high-contrast" ? "default" : "high-contrast"
        ),

      fontScale,
      setFontScale,

      increaseFont: () => {
        setFontScale((prev) => {
          if (prev === "sm") return "md";
          if (prev === "md") return "lg";
          if (prev === "lg") return "xl";
          return prev;
        });
      },

      decreaseFont: () => {
        setFontScale((prev) => {
          if (prev === "xl") return "lg";
          if (prev === "lg") return "md";
          if (prev === "md") return "sm";
          return prev;
        });
      },
    };
  }, [theme, fontScale]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}