export const THEMES = {
  DEFAULT: "default",
  HIGH_CONTRAST: "high-contrast",
};

export const FONT_SCALES = {
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
};

export const DEFAULT_THEME = THEMES.DEFAULT;
export const DEFAULT_FONT_SCALE = FONT_SCALES.MD;

// Ordem explícita evita lógica implícita e erros de comparação
export const FONT_SCALE_ORDER = [
  FONT_SCALES.SM,
  FONT_SCALES.MD,
  FONT_SCALES.LG,
  FONT_SCALES.XL,
];

// Utilitários controlados (evita lógica repetida no contexto)
export function getNextFontScale(current) {
  const index = FONT_SCALE_ORDER.indexOf(current);
  if (index === -1) return DEFAULT_FONT_SCALE;

  return FONT_SCALE_ORDER[Math.min(index + 1, FONT_SCALE_ORDER.length - 1)];
}

export function getPrevFontScale(current) {
  const index = FONT_SCALE_ORDER.indexOf(current);
  if (index === -1) return DEFAULT_FONT_SCALE;

  return FONT_SCALE_ORDER[Math.max(index - 1, 0)];
}

export function isValidTheme(value) {
  return Object.values(THEMES).includes(value);
}

export function isValidFontScale(value) {
  return Object.values(FONT_SCALES).includes(value);
}