import React from "react";
import clsx from "clsx";
import { Menu, Search, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import FontSizeControl from "../ui/FontSizeControl";
import IconButton from "../ui/IconButton";

/*
Contrato sugerido:
- title: título principal da área atual
- subtitle: contexto complementar
- onToggleSidebar: ação para abrir/fechar sidebar
- sidebarCollapsed: estado atual da sidebar
- showSidebarToggle: controla exibição do botão
- searchValue / onSearchChange: busca controlada
- actions: ações extras no topo
- user: dados mínimos do usuário
- notificationCount: contador opcional
*/

function getUserInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Topbar({
  title = "",
  subtitle = "",
  onToggleSidebar,
  sidebarCollapsed = false,
  showSidebarToggle = true,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  actions = null,
  user = null,
  notificationCount = 0,
  className = "",
}) {
  const hasSearch = typeof onSearchChange === "function";
  const userName = user?.name || user?.nome || "Usuário";
  const userEmail = user?.email || "";
  const userAvatar = user?.avatarUrl || null;
  const initials = getUserInitials(userName);

  return (
    <header
      className={clsx(
        "sticky top-0 z-[var(--z-sticky)] w-full border-b bg-[var(--color-topbar-bg)]/95 backdrop-blur",
        "border-[var(--color-topbar-border)]",
        className
      )}
    >
      <div className="flex min-h-[72px] items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showSidebarToggle && (
            <IconButton
              icon={
                sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )
              }
              label={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
              variant="ghost"
              onClick={onToggleSidebar}
              className="hidden md:inline-flex"
            />
          )}

          {showSidebarToggle && (
            <IconButton
              icon={<Menu className="h-5 w-5" />}
              label="Abrir menu"
              variant="ghost"
              onClick={onToggleSidebar}
              className="md:hidden"
            />
          )}

          <div className="min-w-0">
            {title ? (
              <h1 className="truncate text-[var(--font-size-xl)] font-semibold text-[var(--color-text)]">
                {title}
              </h1>
            ) : null}

            {subtitle ? (
              <p className="mt-0.5 truncate text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasSearch && (
            <form
              role="search"
              className="hidden md:flex items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="topbar-search" className="sr-only">
                Buscar na aplicação
              </label>

              <div className="flex h-10 w-[18rem] items-center rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 transition-colors focus-within:border-[var(--input-border-focus)]">
                <Search
                  className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]"
                  aria-hidden="true"
                />
                <input
                  id="topbar-search"
                  type="search"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="ml-2 h-full border-0 bg-transparent px-0 py-0 text-[var(--font-size-sm)] shadow-none focus:ring-0"
                />
              </div>
            </form>
          )}

          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <FontSizeControl showLabel={false} />
          </div>

          {actions ? (
            <div className="hidden md:flex items-center gap-2">
              {actions}
            </div>
          ) : null}

          <div className="relative">
            <IconButton
              icon={<Bell className="h-5 w-5" />}
              label="Notificações"
              variant="ghost"
            />

            {notificationCount > 0 && (
              <span
                className="absolute -right-1 -top-1 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold text-[var(--color-on-danger)]"
                aria-label={`${notificationCount} notificações não lidas`}
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
            aria-label="Informações do usuário"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={`Avatar de ${userName}`}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[var(--font-size-sm)] font-semibold"
                aria-hidden="true"
              >
                {initials}
              </div>
            )}

            <div className="hidden min-w-0 md:block">
              <p className="truncate text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                {userName}
              </p>
              {userEmail ? (
                <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                  {userEmail}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {hasSearch && (
        <div className="border-t border-[var(--color-topbar-border)] px-4 py-3 md:hidden">
          <form role="search" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="topbar-search-mobile" className="sr-only">
              Buscar na aplicação
            </label>

            <div className="flex h-10 items-center rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 transition-colors focus-within:border-[var(--input-border-focus)]">
              <Search
                className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]"
                aria-hidden="true"
              />
              <input
                id="topbar-search-mobile"
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="ml-2 h-full border-0 bg-transparent px-0 py-0 text-[var(--font-size-sm)] shadow-none focus:ring-0"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}