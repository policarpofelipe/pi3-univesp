import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Building2,
  KanbanSquare,
  Users,
  Settings,
  Briefcase,
  ListTodo,
} from "lucide-react";

/*
Contrato sugerido:
- items: navegação simples
- groups: navegação agrupada
- collapsed: controla sidebar recolhida
- onToggleCollapse: alterna estado externo
- currentPath: rota atual para item ativo
- brand: título curto do sistema
- footer: conteúdo opcional no rodapé

Exemplo de items:
[
  { key: "home", label: "Início", href: "/home", icon: LayoutDashboard }
]

Exemplo de groups:
[
  {
    key: "workspace",
    label: "Workspace",
    icon: Briefcase,
    items: [
      { key: "orgs", label: "Organizações", href: "/organizacoes", icon: Building2 },
      { key: "boards", label: "Quadros", href: "/quadros", icon: KanbanSquare }
    ]
  }
]
*/

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
}) {
  const Icon = item.icon || ListTodo;

  return (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={clsx(
        "group flex w-full items-center rounded-lg border transition-all duration-150",
        "min-h-[44px]",
        collapsed ? "justify-center px-2" : "justify-start px-3 py-2",
        active
          ? "border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]"
          : "border-transparent text-[var(--color-sidebar-text)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-sidebar-active-text)]"
      )}
    >
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>

      {!collapsed && (
        <span className="ml-3 truncate text-[var(--font-size-sm)] font-medium">
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
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        title={collapsed ? group.label : undefined}
        className={clsx(
          "group flex w-full items-center rounded-lg border transition-all duration-150",
          "min-h-[44px]",
          collapsed ? "justify-center px-2" : "justify-start px-3 py-2",
          activeGroup
            ? "border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]"
            : "border-transparent text-[var(--color-sidebar-text)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-sidebar-active-text)]"
        )}
      >
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>

        {!collapsed && (
          <>
            <span className="ml-3 truncate text-left text-[var(--font-size-sm)] font-medium">
              {group.label}
            </span>
            <span className="ml-auto flex items-center justify-center" aria-hidden="true">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className={clsx("mt-1 space-y-1", collapsed ? "pl-0" : "pl-4")}>
          {group.items?.map((item) => (
            <SidebarLink
              key={item.key}
              item={item}
              collapsed={collapsed}
              active={isItemActive(item, currentPath)}
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
  const normalizedItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const normalizedGroups = useMemo(() => (Array.isArray(groups) ? groups : []), [groups]);

  return (
    <aside
      className={clsx(
        "hidden md:flex h-screen flex-col border-r bg-[var(--color-sidebar-bg)]",
        "border-[var(--color-sidebar-border)] text-[var(--color-sidebar-text)]",
        "transition-[width] duration-200 overflow-x-hidden",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width-open)]",
        className
      )}
      aria-label="Barra lateral de navegação"
    >
      <div
        className={clsx(
          "flex min-h-[72px] items-center border-b border-[var(--color-sidebar-border)]",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        <div className="flex items-center min-w-0">
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-surface)]"
            aria-hidden="true"
          >
            <LayoutDashboard className="h-5 w-5" />
          </span>

          {!collapsed && (
            <div className="ml-3 min-w-0">
              <p className="truncate text-[var(--font-size-md)] font-semibold text-[var(--color-sidebar-active-text)]">
                {brand}
              </p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-sidebar-text-muted)]">
                Navegação principal
              </p>
            </div>
          )}
        </div>
      </div>

      <nav
        className="flex-1 space-y-4 overflow-y-auto px-3 py-3"
        aria-label="Navegação principal"
      >
        {normalizedItems.length > 0 && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-sidebar-text-muted)]">
                Geral
              </p>
            )}

            {normalizedItems.map((item) => (
              <SidebarLink
                key={item.key}
                item={item}
                collapsed={collapsed}
                active={isItemActive(item, currentPath)}
              />
            ))}
          </div>
        )}

        {normalizedGroups.map((group) => (
          <div key={group.key} className="space-y-1">
            {!collapsed && group.sectionLabel && (
              <p className="px-2 text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-sidebar-text-muted)]">
                {group.sectionLabel}
              </p>
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

      <div className="border-t border-[var(--color-sidebar-border)] p-3">
        {footer ? (
          footer
        ) : (
          <div
            className={clsx(
              "rounded-lg border border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-surface)]",
              collapsed ? "px-2 py-3 text-center" : "px-3 py-3"
            )}
          >
            {collapsed ? (
              <Settings className="mx-auto h-5 w-5" aria-hidden="true" />
            ) : (
              <>
                <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-sidebar-active-text)]">
                  Preferências
                </p>
                <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-sidebar-text-muted)]">
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