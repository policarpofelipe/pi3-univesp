import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Briefcase,
  ListTodo,
} from "lucide-react";

import "../../styles/components/sidebar.css";

function isItemActive(item, currentPath) {
  if (!item?.href || !currentPath) return false;
  return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
}

function isGroupActive(group, currentPath) {
  return Array.isArray(group?.items)
    ? group.items.some((item) => isItemActive(item, currentPath))
    : false;
}

function SidebarLink({
  item,
  collapsed = false,
  active = false,
  nested = false,
}) {
  const Icon = item.icon || ListTodo;

  return (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={clsx(
        "sidebar__link",
        collapsed && "sidebar__link--collapsed",
        active && "sidebar__link--active",
        nested && "sidebar__link--nested"
      )}
    >
      <span className="sidebar__link-icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      {!collapsed && (
        <span className="sidebar__link-label">
          {item.label}
        </span>
      )}
    </a>
  );
}

function SidebarGroup({
  group,
  collapsed = false,
  currentPath,
  defaultOpen = true,
}) {
  const initiallyOpen = defaultOpen || isGroupActive(group, currentPath);
  const [open, setOpen] = useState(initiallyOpen);
  const Icon = group.icon || Briefcase;
  const activeGroup = isGroupActive(group, currentPath);

  return (
    <div className="sidebar__group">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        title={collapsed ? group.label : undefined}
        className={clsx(
          "sidebar__group-trigger",
          collapsed && "sidebar__group-trigger--collapsed",
          activeGroup && "sidebar__group-trigger--active"
        )}
      >
        <span className="sidebar__group-icon" aria-hidden="true">
          <Icon size={18} />
        </span>

        {!collapsed && (
          <>
            <span className="sidebar__group-label">{group.label}</span>
            <span className="sidebar__group-chevron" aria-hidden="true">
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          className={clsx(
            "sidebar__group-content",
            collapsed && "sidebar__group-content--collapsed"
          )}
        >
          {group.items?.map((item) => (
            <SidebarLink
              key={item.key}
              item={item}
              collapsed={collapsed}
              active={isItemActive(item, currentPath)}
              nested={!collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  items = [],
  groups = [],
  collapsed = false,
  currentPath = "",
  brand = "PI3 Tasks",
  footer = null,
  className = "",
}) {
  const normalizedItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  );

  const normalizedGroups = useMemo(
    () => (Array.isArray(groups) ? groups : []),
    [groups]
  );

  return (
    <aside
      className={clsx(
        "sidebar",
        collapsed && "sidebar--collapsed",
        className
      )}
      aria-label="Barra lateral de navegação"
    >
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon" aria-hidden="true">
            <LayoutDashboard size={18} />
          </span>

          {!collapsed && (
            <div className="sidebar__brand-text">
              <p className="sidebar__brand-title">{brand}</p>
              <p className="sidebar__brand-subtitle">Navegação principal</p>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Navegação principal">
        {normalizedItems.length > 0 && (
          <div className="sidebar__section">
            {!collapsed && (
              <p className="sidebar__section-label">Geral</p>
            )}

            <div className="sidebar__section-links">
              {normalizedItems.map((item) => (
                <SidebarLink
                  key={item.key}
                  item={item}
                  collapsed={collapsed}
                  active={isItemActive(item, currentPath)}
                />
              ))}
            </div>
          </div>
        )}

        {normalizedGroups.map((group) => (
          <div key={group.key} className="sidebar__section">
            {!collapsed && group.sectionLabel && (
              <p className="sidebar__section-label">{group.sectionLabel}</p>
            )}

            <SidebarGroup
              group={group}
              collapsed={collapsed}
              currentPath={currentPath}
              defaultOpen={true}
            />
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        {footer ? (
          footer
        ) : (
          <div
            className={clsx(
              "sidebar__preferences",
              collapsed && "sidebar__preferences--collapsed"
            )}
          >
            {collapsed ? (
              <Settings size={18} aria-hidden="true" />
            ) : (
              <>
                <p className="sidebar__preferences-title">Preferências</p>
                <p className="sidebar__preferences-text">
                  Tema, fonte e opções de navegação
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}