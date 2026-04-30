import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Bot,
  Building2,
  Clock3,
  Eye,
  LayoutList,
  Settings,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Button from "../ui/Button";
import TagList from "./TagList";
import TagForm from "./TagForm";
import AutomacaoList from "../automacoes/AutomacaoList";
import AutomacaoForm from "../automacoes/AutomacaoForm";

import "../../styles/components/quadro-management-drawer.css";

const SECTIONS = [
  { key: "geral", label: "Geral" },
  { key: "membros", label: "Membros" },
  { key: "tags", label: "Tags" },
  { key: "visoes", label: "Visões" },
  { key: "campos", label: "Campos" },
  { key: "automacoes", label: "Automações" },
  { key: "papeis", label: "Papéis" },
  { key: "atividade", label: "Atividade" },
];

function collectFocusables(root) {
  if (!root) return [];
  const sel =
    'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll(sel)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

export default function QuadroManagementDrawer({
  open = false,
  onClose,
  defaultSection = "geral",
  quadro,
  membros = [],
  tags = [],
  atividades = [],
  listas = [],
  automacoes = [],
  automacoesLoading = false,
  automacoesErro = "",
  automacaoSalvando = false,
  removendoTagId = null,
  criandoTag = false,
  onCriarTag,
  onRemoverTag,
  onCriarAutomacao,
  onAtualizarAutomacao,
  onRemoverAutomacao,
  onNavigateConfiguracoes,
  onNavigateMembros,
  onNavigateVisoes,
  onNavigateCamposPersonalizados,
  onNavigateAutomacoes,
  onNavigatePapeis,
  onNovoCartao,
  onNovaLista,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const drawerOpenedRef = useRef(false);
  const titleId = useId();
  const tablistId = useId();
  const [section, setSection] = useState(defaultSection);
  const [automacaoEmEdicao, setAutomacaoEmEdicao] = useState(null);
  const [automacoesMode, setAutomacoesMode] = useState("lista");

  useLayoutEffect(() => {
    if (open) {
      if (!drawerOpenedRef.current) {
        drawerOpenedRef.current = true;
        previouslyFocused.current = document.activeElement;
      }
      setSection(defaultSection);
      setAutomacaoEmEdicao(null);
      setAutomacoesMode("lista");
    } else {
      drawerOpenedRef.current = false;
    }
  }, [open, defaultSection]);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      const el = previouslyFocused.current;
      if (el && typeof el.focus === "function") {
        requestAnimationFrame(() => el.focus());
      }
      return;
    }
    requestAnimationFrame(() => {
      document.getElementById(`quadro-drawer-tab-${defaultSection}`)?.focus();
    });
  }, [open, defaultSection]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = collectFocusables(panelRef.current);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (!open) return undefined;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  const handlePanelArrowOnTabs = useCallback(
    (event) => {
      const tablist = panelRef.current?.querySelector('[role="tablist"]');
      if (!tablist || !tablist.contains(event.target)) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const keys = SECTIONS.map((s) => s.key);
      const i = keys.indexOf(section);
      if (i < 0) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = keys[(i + delta + keys.length) % keys.length];
      setSection(next);
      requestAnimationFrame(() => {
        document.getElementById(`quadro-drawer-tab-${next}`)?.focus();
      });
    },
    [section]
  );

  if (!open || !quadro) {
    return null;
  }

  const formatarData = (data) => {
    if (!data) return "Não informado";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(data));
    } catch {
      return data;
    }
  };

  const orgNome =
    quadro.organizacao?.nome || quadro.organizacaoNome || "Organização";

  const drawer = (
    <div className="quadro-management-drawer quadro-management-drawer--open">
      <button
        type="button"
        tabIndex={-1}
        className="quadro-management-drawer__backdrop"
        aria-label="Fechar painel de gestão do quadro"
        onClick={() => onClose?.()}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="quadro-management-drawer__panel"
        tabIndex={-1}
        onKeyDown={handlePanelArrowOnTabs}
      >
        <div className="quadro-management-drawer__header">
          <div className="min-w-0">
            <h2 id={titleId} className="quadro-management-drawer__title">
              Gerenciar quadro
            </h2>
            <p className="quadro-management-drawer__subtitle">{quadro.nome}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onClose?.()}
            leftIcon={<X size={16} aria-hidden="true" />}
            aria-label="Fechar painel de gestão"
          >
            Fechar
          </Button>
        </div>

        <div className="quadro-management-drawer__tablist-wrap">
          <div
            id={tablistId}
            role="tablist"
            aria-label="Seções de gestão do quadro"
            className="quadro-management-drawer__tablist"
          >
            {SECTIONS.map((s) => {
              const selected = section === s.key;
              const panelId = `quadro-drawer-panel-${s.key}`;
              const tabId = `quadro-drawer-tab-${s.key}`;
              return (
                <button
                  key={s.key}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  className="quadro-management-drawer__tab"
                  onClick={() => setSection(s.key)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="quadro-management-drawer__body">
          {SECTIONS.map((s) => {
            const panelId = `quadro-drawer-panel-${s.key}`;
            const tabId = `quadro-drawer-tab-${s.key}`;
            if (section !== s.key) return null;
            return (
              <div
                key={s.key}
                id={panelId}
                role="tabpanel"
                aria-labelledby={tabId}
              >
                {s.key === "geral" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Informações gerais">
                    <p className="quadro-detalhe-page__section-text">
                      Ajustes administrativos e metadados do quadro. O fluxo de
                      trabalho permanece visível ao fechar este painel.
                    </p>
                    <p className="quadro-detalhe-page__hero-meta-item mt-3 flex flex-wrap items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                      <Building2 size={16} aria-hidden="true" />
                      <span>{orgNome}</span>
                      <span className="text-[var(--color-text-soft)]">·</span>
                      <span>Atualizado em {formatarData(quadro.atualizadoEm)}</span>
                    </p>
                    {quadro.descricao ? (
                      <p className="quadro-detalhe-page__section-text mt-3">
                        {quadro.descricao}
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          leftIcon={<LayoutList size={16} aria-hidden="true" />}
                          onClick={() => onNovaLista?.()}
                        >
                          Nova lista
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="secondary"
                        leftIcon={<Settings size={16} aria-hidden="true" />}
                        onClick={() => onNavigateConfiguracoes?.()}
                      >
                        Abrir configurações completas
                      </Button>
                    </div>
                  </section>
                ) : null}

                {s.key === "membros" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Membros">
                    <div className="quadro-detalhe-page__section-header">
                      <h3 className="quadro-detalhe-page__section-title">
                        Membros do quadro
                      </h3>
                      <Button variant="ghost" onClick={() => onNavigateMembros?.()}>
                        Ver todos
                      </Button>
                    </div>
                    {membros.length === 0 ? (
                      <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                        Nenhum membro listado.
                      </p>
                    ) : (
                      <ul className="quadro-detalhe-page__membros">
                        {membros.slice(0, 12).map((membro) => (
                          <li
                            key={membro.id}
                            className="quadro-detalhe-page__membro-item"
                          >
                            <div
                              className="quadro-detalhe-page__membro-avatar"
                              aria-hidden="true"
                            >
                              {(membro.nome || "?").slice(0, 1).toUpperCase()}
                            </div>
                            <div className="quadro-detalhe-page__membro-body">
                              <strong className="quadro-detalhe-page__membro-nome">
                                {membro.nome}
                              </strong>
                              <span className="quadro-detalhe-page__membro-papel">
                                {Array.isArray(membro.papeis) && membro.papeis.length
                                  ? membro.papeis.join(", ")
                                  : "Sem papel"}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ) : null}

                {s.key === "tags" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Tags">
                    <h3 className="quadro-detalhe-page__section-title">
                      Tags do quadro
                    </h3>
                    <p className="quadro-detalhe-page__section-text mb-3">
                      Use tags nos cartões para classificar o trabalho. Remover uma
                      tag aqui tira a etiqueta de todos os cartões.
                    </p>
                    <TagList
                      tags={tags}
                      onRemover={onRemoverTag}
                      removendoId={removendoTagId}
                    />
                    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                      <TagForm
                        loading={criandoTag}
                        submitLabel="Adicionar tag"
                        onSubmit={onCriarTag}
                      />
                    </div>
                  </section>
                ) : null}

                {s.key === "visoes" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Visões">
                    <div className="quadro-detalhe-page__section-header">
                      <h3 className="quadro-detalhe-page__section-title">Visões</h3>
                      <Button
                        variant="ghost"
                        leftIcon={<Eye size={14} aria-hidden="true" />}
                        onClick={() => onNavigateVisoes?.()}
                      >
                        Gerenciar
                      </Button>
                    </div>
                    <p className="quadro-detalhe-page__section-text">
                      Crie visões salvas para aplicar filtros recorrentes e acelerar a
                      análise do quadro.
                    </p>
                  </section>
                ) : null}

                {s.key === "campos" ? (
                  <section
                    className="quadro-detalhe-page__section"
                    aria-label="Campos personalizados"
                  >
                    <div className="quadro-detalhe-page__section-header">
                      <h3 className="quadro-detalhe-page__section-title">
                        Campos personalizados
                      </h3>
                      <Button
                        variant="ghost"
                        leftIcon={<SlidersHorizontal size={14} aria-hidden="true" />}
                        onClick={() => onNavigateCamposPersonalizados?.()}
                      >
                        Gerenciar
                      </Button>
                    </div>
                    <p className="quadro-detalhe-page__section-text">
                      Defina metadados extras dos cartões para adaptar o quadro ao seu
                      processo.
                    </p>
                  </section>
                ) : null}

                {s.key === "automacoes" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Automações">
                    <div className="quadro-detalhe-page__section-header">
                      <h3 className="quadro-detalhe-page__section-title">Automações</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setAutomacaoEmEdicao(null);
                            setAutomacoesMode("criar");
                          }}
                        >
                          Nova automação
                        </Button>
                        <Button
                          variant="ghost"
                          leftIcon={<Bot size={14} aria-hidden="true" />}
                          onClick={() => onNavigateAutomacoes?.()}
                        >
                          Abrir página
                        </Button>
                      </div>
                    </div>
                    <p className="quadro-detalhe-page__section-text">
                      Automatize tarefas recorrentes com gatilhos e condições do fluxo.
                    </p>

                    {automacoesErro ? (
                      <p
                        className="mb-3 mt-3 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                        role="alert"
                      >
                        {automacoesErro}
                      </p>
                    ) : null}

                    {automacoesMode === "lista" ? (
                      automacoesLoading ? (
                        <p className="mt-3 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                          Carregando automações...
                        </p>
                      ) : (
                        <div className="mt-3">
                          {automacoes.length === 0 ? (
                            <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                              Nenhuma automação cadastrada para este quadro.
                            </p>
                          ) : (
                            <AutomacaoList
                              automacoes={automacoes}
                              onEditar={(automacao) => {
                                setAutomacaoEmEdicao(automacao);
                                setAutomacoesMode("editar");
                              }}
                              onRemover={onRemoverAutomacao}
                            />
                          )}
                        </div>
                      )
                    ) : (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <h4 className="mb-3 text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                          {automacoesMode === "editar" ? "Editar automação" : "Criar automação"}
                        </h4>
                        <AutomacaoForm
                          modo={automacoesMode === "editar" ? "editar" : "criar"}
                          initialValues={automacaoEmEdicao || {}}
                          listas={listas}
                          tags={tags}
                          loading={automacaoSalvando}
                          onSubmit={async (payload) => {
                            if (automacoesMode === "editar" && automacaoEmEdicao?.id) {
                              await onAtualizarAutomacao?.(automacaoEmEdicao.id, payload);
                            } else {
                              await onCriarAutomacao?.(payload);
                            }
                            setAutomacaoEmEdicao(null);
                            setAutomacoesMode("lista");
                          }}
                          onCancel={() => {
                            setAutomacaoEmEdicao(null);
                            setAutomacoesMode("lista");
                          }}
                        />
                      </div>
                    )}
                  </section>
                ) : null}

                {s.key === "papeis" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Papéis">
                    <div className="quadro-detalhe-page__section-header">
                      <h3 className="quadro-detalhe-page__section-title">
                        Papéis do quadro
                      </h3>
                      <Button variant="ghost" onClick={() => onNavigatePapeis?.()}>
                        Gerenciar
                      </Button>
                    </div>
                    <p className="quadro-detalhe-page__section-text">
                      Os papéis controlam permissões de visualização, edição, listas,
                      cartões e membros.
                    </p>
                  </section>
                ) : null}

                {s.key === "atividade" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Atividade">
                    <h3 className="quadro-detalhe-page__section-title">
                      Atividade recente
                    </h3>
                    {atividades.length === 0 ? (
                      <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                        Sem eventos recentes.
                      </p>
                    ) : (
                      <ol className="quadro-detalhe-page__atividades">
                        {atividades.map((atividade) => (
                          <li
                            key={atividade.id}
                            className="quadro-detalhe-page__atividade-item"
                          >
                            <span
                              className="quadro-detalhe-page__atividade-icon"
                              aria-hidden="true"
                            >
                              <ArrowRight size={14} />
                            </span>
                            <div className="quadro-detalhe-page__atividade-body">
                              <p className="quadro-detalhe-page__atividade-texto">
                                {atividade.descricao}
                              </p>
                              <p className="quadro-detalhe-page__atividade-data">
                                <Clock3 size={13} aria-hidden="true" />
                                <span>{atividade.data}</span>
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );

  return createPortal(drawer, document.body);
}
