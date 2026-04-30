import React, { useId } from "react";

export default function AccessibilityLogoIcon({
  className = "",
  title = "Acessibilidade",
  decorative = false,
}) {
  const titleId = useId();

  return (
    <svg
      className={className}
      viewBox="0 0 960 960"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-labelledby={decorative ? undefined : titleId}
      focusable="false"
    >
      {!decorative ? <title id={titleId}>{title}</title> : null}

      <g
        fill="none"
        stroke="var(--accessibility-logo-line, currentColor)"
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M64 360 C150 150 315 70 480 70 C645 70 810 150 896 360" />
        <path d="M480 274 L65 360" />
        <path d="M480 274 L895 360" />
        <path d="M480 274 L249 842" />
        <path d="M480 274 L710 842" />
      </g>

      <g fill="var(--accessibility-logo-accent, currentColor)">
        <circle cx="480" cy="274" r="95" />
        <circle cx="65" cy="360" r="34" />
        <circle cx="895" cy="360" r="34" />
        <circle cx="249" cy="842" r="34" />
        <circle cx="710" cy="842" r="34" />
      </g>
    </svg>
  );
}
