import React, { createContext, useEffect, useMemo, useState } from "react";

export const AccessibilityContext = createContext(null);

const STORAGE_KEYS = {
  theme: "app_theme",
  fontScale: "app_font_scale",
  fontFamily: "app_font_family",
  letterSpacing: "app_letter_spacing",
  lineHeight: "app_line_height",
  paragraphWidth: "app_paragraph_width",
  fontColor: "app_font_color",
};

const DEFAULTS = {
  theme: "default", // default | high-contrast
  fontScale: "md",  // sm | md | lg | xl
  fontFamily: "sans",
  letterSpacing: 0,
  lineHeight: 1.5,
  paragraphWidth: 0,
  fontColor: "",
};

export function AccessibilityProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.theme) || DEFAULTS.theme;
  });

  const [fontScale, setFontScale] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.fontScale) || DEFAULTS.fontScale;
  });

  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.fontFamily) || DEFAULTS.fontFamily;
  });

  const [letterSpacing, setLetterSpacing] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.letterSpacing);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : DEFAULTS.letterSpacing;
  });

  const [lineHeight, setLineHeight] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.lineHeight);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : DEFAULTS.lineHeight;
  });

  const [paragraphWidth, setParagraphWidth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.paragraphWidth);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : DEFAULTS.paragraphWidth;
  });

  const [fontColor, setFontColor] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.fontColor) || DEFAULTS.fontColor;
  });

  // Persistência
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontScale, fontScale);
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontFamily, fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.letterSpacing, String(letterSpacing));
  }, [letterSpacing]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lineHeight, String(lineHeight));
  }, [lineHeight]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.paragraphWidth, String(paragraphWidth));
  }, [paragraphWidth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontColor, fontColor);
  }, [fontColor]);

  // Aplicação no DOM (essencial)
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme", theme);
    root.setAttribute("data-font-scale", fontScale);
    root.setAttribute("data-font-family", fontFamily);
    root.style.setProperty("--a11y-letter-spacing", `${letterSpacing}px`);
    root.style.setProperty("--a11y-line-height", String(lineHeight));
    root.style.setProperty("--a11y-paragraph-width", `${paragraphWidth}ch`);
    root.style.setProperty("--a11y-font-color", fontColor || "var(--color-text)");
  }, [theme, fontScale, fontFamily, letterSpacing, lineHeight, paragraphWidth, fontColor]);

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
      fontFamily,
      setFontFamily,
      letterSpacing,
      setLetterSpacing,
      lineHeight,
      setLineHeight,
      paragraphWidth,
      setParagraphWidth,
      fontColor,
      setFontColor,

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
      resetAllAccessibility: () => {
        setTheme(DEFAULTS.theme);
        setFontScale(DEFAULTS.fontScale);
        setFontFamily(DEFAULTS.fontFamily);
        setLetterSpacing(DEFAULTS.letterSpacing);
        setLineHeight(DEFAULTS.lineHeight);
        setParagraphWidth(DEFAULTS.paragraphWidth);
        setFontColor(DEFAULTS.fontColor);
      },
    };
  }, [theme, fontScale, fontFamily, letterSpacing, lineHeight, paragraphWidth, fontColor]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}