import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  UserRound,
  LogOut,
} from "lucide-react";

import ThemeToggle from "../ui/ThemeToggle";
import FontSizeControl from "../ui/FontSizeControl";
import IconButton from "../ui/IconButton";
import useAuth from "../../hooks/useAuth";

import "../../styles/components/topbar.css";

export default function Topbar({
  title = "",
  subtitle = "",
  navigationItems = [],
  navigationGroups = [],
  currentPath = "",
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  actions = null,
  user = null,
  notificationCount = 0,
  className = "",
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const menuWrapRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const hasSearch = typeof onSearchChange === "function";
  const userName = user?.name || user?.nome || "Usuário";
  const userAvatar = user?.avatarUrl || null;
  const navMenuItems = useMemo(() => {
    const flatGroups = (navigationGroups || []).flatMap((group) => group?.items || []);
    const merged = [...(navigationItems || []), ...flatGroups];
    const uniques = [];
    const seen = new Set();
    for (const item of merged) {
      const key = item?.key || item?.href || item?.label;
      if (!item?.href || !key || seen.has(key)) continue;
      seen.add(key);
      uniques.push(item);
    }
    return uniques;
  }, [navigationItems, navigationGroups]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleClickOutside(event) {
      const root = menuWrapRef.current;
      if (!root || root.contains(event.target)) return;
      setMenuOpen(false);
      setFocusedIndex(-1);
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        setFocusedIndex(-1);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
    setMenuOpen(false);
  }

  function handleMenuKeyDown(event) {
    if (!menuOpen) return;
    const count = navMenuItems.length + 1;
    if (!count) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prev) => (prev + 1 + count) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + count) % count);
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setFocusedIndex(count - 1);
    }
  }

  useEffect(() => {
    if (!menuOpen || focusedIndex < 0) return;
    const root = menuWrapRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll("[data-menu-item='true']");
    nodes[focusedIndex]?.focus();
  }, [menuOpen, focusedIndex]);

  return (
    <header className={clsx("topbar", className)}>
      <div className="topbar__inner">
        <div className="topbar__left">
          <div
            className="topbar__menu-wrap"
            ref={menuWrapRef}
            onKeyDown={handleMenuKeyDown}
          >
            <button
              ref={menuButtonRef}
              title={menuOpen ? "Fechar menu" : "Menu"}
              aria-label={menuOpen ? "Fechar menu" : "Menu"}
              className="topbar__menu-toggle"
              onClick={() => {
                setMenuOpen((prev) => !prev);
                setFocusedIndex(0);
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div
              className={clsx("topbar__nav-dropdown", menuOpen && "topbar__nav-dropdown--open")}
              role="menu"
              aria-hidden={!menuOpen}
            >
              {navMenuItems.map((item) => {
                const active =
                  currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <button
                    key={item.key || item.href}
                    type="button"
                    role="menuitem"
                    data-menu-item="true"
                    className={clsx("topbar__nav-item", active && "topbar__nav-item--active")}
                    onClick={() => {
                      navigate(item.href);
                      setMenuOpen(false);
                      setFocusedIndex(-1);
                    }}
                  >
                    {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                role="menuitem"
                data-menu-item="true"
                className="topbar__nav-item topbar__nav-item--danger"
                onClick={handleLogout}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Sair</span>
              </button>
            </div>
          </div>

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