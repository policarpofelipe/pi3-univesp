import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Briefcase,
  ListTodo,
  LogOut,
  X,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
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

function SidebarLogout({ collapsed = false, onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleClick() {
    await logout();
    navigate("/login", { replace: true });
    if (typeof onNavigate === "function") {
      onNavigate();
    }
  }

  return (
    <button
      type="button"
      className={clsx(
        "sidebar__link",
        collapsed && "sidebar__link--collapsed"
      )}
      onClick={handleClick}
      title={collapsed ? "Sair" : undefined}
    >
      <span className="sidebar__link-icon" aria-hidden="true">
        <LogOut size={18} />
      </span>
      {!collapsed && <span className="sidebar__link-label">Sair</span>}
    </button>
  );
}

function SidebarLink({
  item,
  collapsed = false,
  active = false,
  nested = false,
  onNavigate,
}) {
  const Icon = item.icon || ListTodo;

  function handleClick() {
    if (typeof onNavigate === "function") {
      onNavigate();
    }
  }

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
      onClick={handleClick}
    >
      <span className="sidebar__link-icon" aria-hidden="true">
        <Icon size={18} />
      </span>

      {!collapsed && (
        <span className="sidebar__link-label">{item.label}</span>
      )}
    </a>
  );
}

function SidebarGroup({
  group,
  collapsed = false,
  currentPath,
  defaultOpen = true,
  onNavigate,
}) {
  const initiallyOpen = defaultOpen || isGroupActive(group, currentPath);
  const [open, setOpen] = useState(initiallyOpen);
  const Icon = group.icon || Briefcase;
  const activeGroup = isGroupActive(group, currentPath);

  useEffect(() => {
    if (isGroupActive(group, currentPath)) {
      setOpen(true);
    }
  }, [group, currentPath]);

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
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarInner({
  items,
  groups,
  collapsed,
  currentPath,
  brand,
  footer,
  onNavigate,
  mobile = false,
  onCloseMobile,
}) {
  return (
    <div className="sidebar__panel">
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon" aria-hidden="true">
            <LayoutDashboard size={18} />
          </span>

          {!collapsed && (
            <div className="sidebar__brand-text">
              <p className="sidebar__brand-title">{brand}</p>
              <p className="sidebar__brand-subtitle">Gestão de Tarefas</p>
            </div>
          )}
        </div>

        {mobile && (
          <button
            type="button"
            className="sidebar__mobile-close"
            onClick={onCloseMobile}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar__nav" aria-label="Gestão de Tarefas">
        {items.length > 0 && (
          <div className="sidebar__section">
            <div className="sidebar__section-links">
              {items.map((item) => (
                <SidebarLink
                  key={item.key}
                  item={item}
                  collapsed={collapsed}
                  active={isItemActive(item, currentPath)}
                  onNavigate={onNavigate}
                />
              ))}
              <SidebarLogout collapsed={collapsed} onNavigate={onNavigate} />
            </div>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.key} className="sidebar__section">
            {!collapsed && group.sectionLabel && (
              <p className="sidebar__section-label">{group.sectionLabel}</p>
            )}

            <SidebarGroup
              group={group}
              collapsed={collapsed}
              currentPath={currentPath}
              defaultOpen={true}
              onNavigate={onNavigate}
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  items = [],
  groups = [],
  collapsed = false,
  mobileOpen = false,
  currentPath = "",
  brand = "Projeto Integrador III",
  footer = null,
  className = "",
  onCloseMobile,
}) {
  const normalizedItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  );

  const normalizedGroups = useMemo(
    () => (Array.isArray(groups) ? groups : []),
    [groups]
  );

  useEffect(() => {
    if (!mobileOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && typeof onCloseMobile === "function") {
        onCloseMobile();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      <aside
        className={clsx(
          "sidebar sidebar--desktop",
          collapsed && "sidebar--collapsed",
          className
        )}
        aria-label="Barra lateral de navegação"
      >
        <SidebarInner
          items={normalizedItems}
          groups={normalizedGroups}
          collapsed={collapsed}
          currentPath={currentPath}
          brand={brand}
          footer={footer}
        />
      </aside>

      <div
        className={clsx(
          "sidebar-mobile",
          mobileOpen && "sidebar-mobile--open"
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="sidebar-mobile__backdrop"
          onClick={onCloseMobile}
          aria-label="Fechar menu lateral"
        />

        <aside
          className="sidebar sidebar--mobile"
          aria-label="Menu lateral móvel"
        >
          <SidebarInner
            items={normalizedItems}
            groups={normalizedGroups}
            collapsed={false}
            currentPath={currentPath}
            brand={brand}
            footer={footer}
            mobile
            onCloseMobile={onCloseMobile}
            onNavigate={onCloseMobile}
          />
        </aside>
      </div>
    </>
  );
}
