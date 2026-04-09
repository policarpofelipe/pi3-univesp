import React from "react";
import clsx from "clsx";
import "../../styles/components/icon-button.css";

export default function IconButton({
  icon,
  label,
  onClick,
  type = "button",
  variant = "ghost",
  size = "md",
  disabled = false,
  active = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={clsx(
        "icon-button",
        `icon-button--${variant}`,
        `icon-button--${size}`,
        active && "icon-button--active",
        className
      )}
      {...props}
    >
      <span className="icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}