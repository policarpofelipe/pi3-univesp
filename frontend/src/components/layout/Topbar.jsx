import React from "react";
import clsx from "clsx";
import {
  Menu,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";

import ThemeToggle from "../ui/ThemeToggle";
import FontSizeControl from "../ui/FontSizeControl";
import IconButton from "../ui/IconButton";

import "../../styles/components/topbar.css";

export default function Topbar({
  title = "",
  subtitle = "",
  onToggleDesktopSidebar,
  onToggleMobileSidebar,
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
  const userAvatar = user?.avatarUrl || null;

  return (
    <header className={clsx("topbar", className)}>
      <div className="topbar__inner">
        <div className="topbar__left">
          {showSidebarToggle && (
            <>
              <div className="topbar__desktop-toggle">
                <IconButton
                  icon={
                    sidebarCollapsed ? (
                      <PanelLeftOpen size={18} />
                    ) : (
                      <PanelLeftClose size={18} />
                    )
                  }
                  label={
                    sidebarCollapsed
                      ? "Expandir barra lateral"
                      : "Recolher barra lateral"
                  }
                  variant="ghost"
                  onClick={onToggleDesktopSidebar}
                />
              </div>

              <div className="topbar__mobile-toggle">
                <IconButton
                  icon={<Menu size={18} />}
                  label="Abrir menu"
                  variant="ghost"
                  onClick={onToggleMobileSidebar}
                />
              </div>
            </>
          )}

          <div className="topbar__title-block">
            {title ? <h1 className="topbar__title">{title}</h1> : null}
            {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
          </div>
        </div>

        <div className="topbar__right">
          {hasSearch && (
            <form
              role="search"
              className="topbar__search topbar__search--desktop"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="topbar-search" className="sr-only">
                Buscar na aplicação
              </label>

              <div className="topbar__search-field">
                <Search
                  className="topbar__search-icon"
                  size={16}
                  aria-hidden="true"
                />
                <input
                  id="topbar-search"
                  type="search"
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="topbar__search-input"
                />
              </div>
            </form>
          )}

          <div
            className="topbar__accessibility"
            aria-label="Controles de acessibilidade"
          >
            <ThemeToggle />
            <FontSizeControl showLabel={false} />
          </div>

          {actions ? <div className="topbar__actions">{actions}</div> : null}

          <div className="topbar__notifications">
            <IconButton
              icon={<Bell size={18} />}
              label="Notificações"
              variant="ghost"
            />

            {notificationCount > 0 && (
              <span
                className="topbar__notification-badge"
                aria-label={`${notificationCount} notificações não lidas`}
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>

          <div className="topbar__user" aria-label="Sessão do usuário">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={`Avatar de ${userName}`}
                className="topbar__user-avatar-image"
              />
            ) : (
              <div className="topbar__user-avatar" aria-hidden="true">
                <UserRound size={18} />
              </div>
            )}

            <div className="topbar__user-text">
              <p className="topbar__user-name">{userName}</p>
            </div>
          </div>
        </div>
      </div>

      {hasSearch && (
        <div className="topbar__mobile-search">
          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="topbar-search-mobile" className="sr-only">
              Buscar na aplicação
            </label>

            <div className="topbar__search-field">
              <Search
                className="topbar__search-icon"
                size={16}
                aria-hidden="true"
              />
              <input
                id="topbar-search-mobile"
                type="search"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="topbar__search-input"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}