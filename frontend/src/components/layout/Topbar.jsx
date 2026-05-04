import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  UserRound,
  LogOut,
  RotateCcw,
  Contrast,
} from "lucide-react";

import IconButton from "../ui/IconButton";
import Button from "../ui/Button";
import useAuth from "../../hooks/useAuth";
import notificacaoService from "../../services/notificacaoService";
import ConviteRespostaModal from "../convites/ConviteRespostaModal";
import useAccessibility from "../../hooks/useAccessibility";
import accessibilityLogo from "../../assets/icons/Accessibility_logo.svg";

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
  const { logout, usuario } = useAuth();
  const {
    theme,
    setTheme,
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
    resetAllAccessibility,
  } = useAccessibility();
  const menuWrapRef = useRef(null);
  const menuButtonRef = useRef(null);
  const notifWrapRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [notifCarregando, setNotifCarregando] = useState(false);
  const [internalUnread, setInternalUnread] = useState(0);
  const [conviteModal, setConviteModal] = useState({ open: false, conviteId: null });
  const fontScaleSteps = ["sm", "md", "lg", "xl"];
  const fontScaleIndex = Math.max(0, fontScaleSteps.indexOf(fontScale));

  function updateFontScaleByIndex(nextIndex) {
    const idx = Math.max(0, Math.min(fontScaleSteps.length - 1, Number(nextIndex)));
    setFontScale(fontScaleSteps[idx]);
  }
  const refreshUnread = useCallback(async () => {
    if (!usuario?.id) {
      setInternalUnread(0);
      return;
    }
    try {
      const total = await notificacaoService.obterTotalNaoLidas();
      setInternalUnread(total);
    } catch {
      setInternalUnread(0);
    }
  }, [usuario?.id]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    if (!notifOpen) return undefined;
    function handleClickOutside(event) {
      const root = notifWrapRef.current;
      if (!root || root.contains(event.target)) return;
      setNotifOpen(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setNotifOpen(false);
        notifWrapRef.current
          ?.querySelector("[data-topbar-notif-trigger]")
          ?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notifOpen]);

  async function handleToggleNotificacoes() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      setNotifCarregando(true);
      try {
        const list = await notificacaoService.listarNotificacoes({ limit: 20 });
        setNotifList(list);
      } catch {
        setNotifList([]);
      } finally {
        setNotifCarregando(false);
      }
      await refreshUnread();
    }
  }

  function formatarDataNotificacao(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  async function handleClicNotificacao(n) {
    if (!n?.id) return;
    const tipo = n.tipo || "";

    if (tipo === "CONVITE_QUADRO_RECEBIDO") {
      const cid = n.dadosJson?.conviteId;
      if (cid) {
        setNotifOpen(false);
        setConviteModal({ open: true, conviteId: Number(cid) });
      }
      return;
    }

    if (tipo === "CONVITE_QUADRO_ACEITO" || tipo === "CONVITE_QUADRO_RECUSADO") {
      try {
        await notificacaoService.marcarComoLida(n.id);
      } catch {
        /* mantém lista */
      }
      await refreshUnread();
      setNotifList((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, lidaEm: item.lidaEm || new Date().toISOString() } : item
        )
      );
    }
  }

  function handleAbrirQuadroNotificacao(e, quadroId) {
    e.stopPropagation();
    if (!quadroId) return;
    navigate(`/quadros/${quadroId}`);
    setNotifOpen(false);
  }

  const hasSearch = typeof onSearchChange === "function";
  const userName = user?.name || user?.nome || usuario?.nomeExibicao || "Usuário";
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

  useEffect(() => {
    if (!accessibilityOpen) return undefined;
    function handleEscape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setAccessibilityOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [accessibilityOpen]);

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

          {actions ? <div className="topbar__actions">{actions}</div> : null}

          <button
            type="button"
            className="topbar__menu-toggle topbar__a11y-trigger topbar-accessibility-button"
            aria-haspopup="dialog"
            aria-expanded={accessibilityOpen}
            aria-label={accessibilityOpen ? "Fechar acessibilidade" : "Abrir acessibilidade"}
            title={accessibilityOpen ? "Fechar acessibilidade" : "Acessibilidade"}
            onClick={() => setAccessibilityOpen(true)}
          >
            <img
              src={accessibilityLogo}
              alt=""
              className="topbar-accessibility-button__icon"
            />
          </button>

          <div className="topbar__notifications" ref={notifWrapRef}>
            <IconButton
              icon={<Bell size={18} />}
              label="Abrir notificações"
              variant="ghost"
              aria-haspopup="dialog"
              aria-expanded={notifOpen}
              aria-controls="topbar-notificacoes-panel"
              active={notifOpen}
              onClick={handleToggleNotificacoes}
              data-topbar-notif-trigger
            />

            {(internalUnread > 0 || notificationCount > 0) && (
              <span
                className="topbar__notification-badge"
                aria-label={`${Math.max(internalUnread, notificationCount)} notificações não lidas`}
              >
                {Math.max(internalUnread, notificationCount) > 99
                  ? "99+"
                  : Math.max(internalUnread, notificationCount)}
              </span>
            )}

            <div
              id="topbar-notificacoes-panel"
              className="topbar__notif-dropdown"
              hidden={!notifOpen}
              role="region"
              aria-label="Lista de notificações"
            >
              <p className="topbar__notif-dropdown-header">Notificações</p>
              {notifCarregando ? (
                <p className="topbar__notif-vazio" aria-live="polite">
                  Carregando notificações…
                </p>
              ) : notifList.length === 0 ? (
                <p className="topbar__notif-vazio">Nenhuma notificação recente.</p>
              ) : (
                <ul className="topbar__notif-list">
                  {notifList.map((n) => {
                    const naoLida = !n.lidaEm;
                    const quadroIdFeedback = n.dadosJson?.quadroId;
                    const mostrarAbrirQuadro =
                      (n.tipo === "CONVITE_QUADRO_ACEITO" ||
                        n.tipo === "CONVITE_QUADRO_RECUSADO") &&
                      quadroIdFeedback;

                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={clsx(
                            "topbar__notif-item",
                            naoLida && "topbar__notif-item--unread"
                          )}
                          onClick={() => handleClicNotificacao(n)}
                        >
                          <p className="topbar__notif-item-title">{n.titulo}</p>
                          {n.mensagem ? (
                            <p className="topbar__notif-item-msg">{n.mensagem}</p>
                          ) : null}
                          <div className="topbar__notif-item-meta">
                            <span>{formatarDataNotificacao(n.criadoEm)}</span>
                            <span className="topbar__notif-item-status">
                              {naoLida ? "Não lida" : "Lida"}
                            </span>
                          </div>
                          {mostrarAbrirQuadro ? (
                            <div className="topbar__notif-item-actions">
                              <button
                                type="button"
                                className="topbar__notif-abrir-quadro"
                                onClick={(e) =>
                                  handleAbrirQuadroNotificacao(e, quadroIdFeedback)
                                }
                              >
                                Abrir quadro
                              </button>
                            </div>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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

      <ConviteRespostaModal
        conviteId={conviteModal.conviteId}
        aberto={conviteModal.open}
        onClose={() => setConviteModal({ open: false, conviteId: null })}
        onRespondido={async () => {
          await refreshUnread();
          if (notifOpen) {
            try {
              const list = await notificacaoService.listarNotificacoes({
                limit: 20,
              });
              setNotifList(list);
            } catch {
              /* ignore */
            }
          }
        }}
      />

      {accessibilityOpen ? (
        <div
          className="topbar__a11y-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setAccessibilityOpen(false);
            }
          }}
        >
          <section
            className="topbar__a11y-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-dialog-title"
          >
            <header className="topbar__a11y-header">
              <h2 id="a11y-dialog-title">Acessibilidade</h2>
              <button
                type="button"
                className="topbar__a11y-close"
                onClick={() => setAccessibilityOpen(false)}
                aria-label="Fechar acessibilidade"
              >
                <X size={16} />
              </button>
            </header>

            <div className="topbar__a11y-body">
              <button
                type="button"
                className="topbar__a11y-reset"
                onClick={resetAllAccessibility}
              >
                <RotateCcw size={14} />
                <span>Redefinir tudo</span>
              </button>

              <section className="topbar__a11y-section">
                <h3>Tamanho da fonte</h3>
                <div className="topbar__a11y-slider-row">
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => updateFontScaleByIndex(fontScaleIndex - 1)}
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={1}
                    value={fontScaleIndex}
                    onChange={(event) => updateFontScaleByIndex(event.target.value)}
                    className="topbar__a11y-slider"
                    aria-label="Tamanho da fonte"
                  />
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => updateFontScaleByIndex(fontScaleIndex + 1)}
                  >
                    +
                  </button>
                  <span className="topbar__a11y-value">{fontScaleIndex}</span>
                </div>
                <button
                  type="button"
                  className="topbar__a11y-reset-inline"
                  onClick={() => setFontScale("md")}
                >
                  Redefinir
                </button>
              </section>

              <section className="topbar__a11y-section">
                <h3>Alto contraste</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  role="switch"
                  aria-checked={theme === "high-contrast"}
                  onClick={() =>
                    setTheme(theme === "high-contrast" ? "default" : "high-contrast")
                  }
                  leftIcon={<Contrast size={18} strokeWidth={2} />}
                >
                  {theme === "high-contrast"
                    ? "Desativar alto contraste"
                    : "Ativar alto contraste"}
                </Button>
              </section>

              <section className="topbar__a11y-section">
                <h3>Tipo de fonte</h3>
                <div className="topbar__a11y-radio-list">
                  {[
                    { value: "serif", label: "Serif" },
                    { value: "sans", label: "Sans Serif" },
                    { value: "dyslexic", label: "Dislexia (OpenDyslexic)" },
                  ].map((item) => (
                    <label key={item.value} className="topbar__a11y-radio">
                      <input
                        type="radio"
                        name="font-family-a11y"
                        value={item.value}
                        checked={fontFamily === item.value}
                        onChange={() => setFontFamily(item.value)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="topbar__a11y-reset-inline"
                  onClick={() => setFontFamily("sans")}
                >
                  Redefinir
                </button>
              </section>

              <section className="topbar__a11y-section">
                <h3>Espaçamento entre letras</h3>
                <div className="topbar__a11y-slider-row">
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => setLetterSpacing((prev) => Math.max(-1, Number((prev - 0.2).toFixed(1))))}
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min={-1}
                    max={4}
                    step={0.2}
                    value={letterSpacing}
                    onChange={(event) => setLetterSpacing(Number(event.target.value))}
                    className="topbar__a11y-slider"
                    aria-label="Espaçamento entre letras"
                  />
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => setLetterSpacing((prev) => Math.min(4, Number((prev + 0.2).toFixed(1))))}
                  >
                    +
                  </button>
                  <span className="topbar__a11y-value">{letterSpacing.toFixed(1)}</span>
                </div>
                <button
                  type="button"
                  className="topbar__a11y-reset-inline"
                  onClick={() => setLetterSpacing(0)}
                >
                  Redefinir
                </button>
              </section>

              <section className="topbar__a11y-section">
                <h3>Altura da linha</h3>
                <div className="topbar__a11y-slider-row">
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => setLineHeight((prev) => Math.max(1.1, Number((prev - 0.1).toFixed(1))))}
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min={1.1}
                    max={2.2}
                    step={0.1}
                    value={lineHeight}
                    onChange={(event) => setLineHeight(Number(event.target.value))}
                    className="topbar__a11y-slider"
                    aria-label="Altura da linha"
                  />
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => setLineHeight((prev) => Math.min(2.2, Number((prev + 0.1).toFixed(1))))}
                  >
                    +
                  </button>
                  <span className="topbar__a11y-value">{lineHeight.toFixed(1)}</span>
                </div>
                <button
                  type="button"
                  className="topbar__a11y-reset-inline"
                  onClick={() => setLineHeight(1.5)}
                >
                  Redefinir
                </button>
              </section>

              <section className="topbar__a11y-section">
                <h3>Largura do parágrafo</h3>
                <div className="topbar__a11y-slider-row">
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => setParagraphWidth((prev) => Math.max(0, prev - 5))}
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    step={5}
                    value={paragraphWidth}
                    onChange={(event) => setParagraphWidth(Number(event.target.value))}
                    className="topbar__a11y-slider"
                    aria-label="Largura do parágrafo"
                  />
                  <button
                    type="button"
                    className="topbar__a11y-step-btn"
                    onClick={() => setParagraphWidth((prev) => Math.min(120, prev + 5))}
                  >
                    +
                  </button>
                  <span className="topbar__a11y-value">{paragraphWidth}</span>
                </div>
                <button
                  type="button"
                  className="topbar__a11y-reset-inline"
                  onClick={() => setParagraphWidth(0)}
                >
                  Redefinir
                </button>
              </section>

              <section className="topbar__a11y-section">
                <h3>Cor da fonte</h3>
                <div className="topbar__a11y-color-row">
                  <input
                    type="color"
                    value={fontColor || "#111111"}
                    onChange={(event) => setFontColor(event.target.value)}
                    aria-label="Selecionar cor da fonte"
                  />
                  <button
                    type="button"
                    className="topbar__a11y-link"
                    onClick={() => setFontColor("")}
                  >
                    Redefinir
                  </button>
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
}