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
  Mail,
  Plus,
  Settings,
  SlidersHorizontal,
  UserPlus,
  X,
} from "lucide-react";

import Button from "../ui/Button";
import TagList from "./TagList";
import TagForm from "./TagForm";
import AutomacaoList from "../automacoes/AutomacaoList";
import AutomacaoForm from "../automacoes/AutomacaoForm";
import VisaoForm from "../visoes/VisaoForm";
import CampoPersonalizadoList from "../camposPersonalizados/CampoPersonalizadoList";
import CampoPersonalizadoForm from "../camposPersonalizados/CampoPersonalizadoForm";
import QuadroPapelForm from "./QuadroPapelForm";

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
  visoes = [],
  campos = [],
  papeis = [],
  atividades = [],
  listas = [],
  membrosErro = "",
  membrosSalvando = false,
  tagsErro = "",
  tagSalvando = false,
  visoesErro = "",
  visaoSalvando = false,
  camposErro = "",
  campoSalvando = false,
  papeisErro = "",
  papelSalvando = false,
  automacoes = [],
  automacoesLoading = false,
  automacoesErro = "",
  automacaoSalvando = false,
  removendoTagId = null,
  criandoTag = false,
  onCriarTag,
  onAtualizarTag,
  onRemoverTag,
  onConvidarMembro,
  onAlterarPapelMembro,
  onRemoverMembro,
  onReenviarConviteMembro,
  onCriarVisao,
  onAtualizarVisao,
  onRemoverVisao,
  onCriarCampo,
  onAtualizarCampo,
  onRemoverCampo,
  onCriarPapel,
  onAtualizarPapel,
  onRemoverPapel,
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
  const [membrosMode, setMembrosMode] = useState("lista");
  const [tagsMode, setTagsMode] = useState("lista");
  const [visoesMode, setVisoesMode] = useState("lista");
  const [camposMode, setCamposMode] = useState("lista");
  const [papeisMode, setPapeisMode] = useState("lista");
  const [tagEmEdicao, setTagEmEdicao] = useState(null);
  const [visaoEmEdicao, setVisaoEmEdicao] = useState(null);
  const [campoEmEdicao, setCampoEmEdicao] = useState(null);
  const [papelEmEdicao, setPapelEmEdicao] = useState(null);
  const [conviteMembro, setConviteMembro] = useState({ email: "", papel: "" });

  useLayoutEffect(() => {
    if (open) {
      if (!drawerOpenedRef.current) {
        drawerOpenedRef.current = true;
        previouslyFocused.current = document.activeElement;
      }
      setSection(defaultSection);
      setAutomacaoEmEdicao(null);
      setAutomacoesMode("lista");
      setMembrosMode("lista");
      setTagsMode("lista");
      setVisoesMode("lista");
      setCamposMode("lista");
      setPapeisMode("lista");
      setTagEmEdicao(null);
      setVisaoEmEdicao(null);
      setCampoEmEdicao(null);
      setPapelEmEdicao(null);
      setConviteMembro({ email: "", papel: "" });
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
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          leftIcon={<UserPlus size={14} aria-hidden="true" />}
                          onClick={() => setMembrosMode("criar")}
                        >
                          Convidar
                        </Button>
                        <Button variant="ghost" onClick={() => onNavigateMembros?.()}>
                          Abrir página
                        </Button>
                      </div>
                    </div>

                    {membrosErro ? (
                      <p
                        className="mb-3 mt-3 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                        role="alert"
                      >
                        {membrosErro}
                      </p>
                    ) : null}

                    {membrosMode === "lista" ? (
                      membros.length === 0 ? (
                        <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                          Nenhum membro listado.
                        </p>
                      ) : (
                        <ul className="mt-3 flex flex-col gap-2">
                          {membros.map((membro) => {
                            const nomeMembro = membro.nome || "Sem nome";
                            const papeisMembro =
                              Array.isArray(membro.papeis) && membro.papeis.length
                                ? membro.papeis
                                : [];
                            return (
                              <li
                                key={membro.id}
                                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
                                      {nomeMembro}
                                    </strong>
                                    {membro.email ? (
                                      <p className="mt-1 flex items-center gap-1 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                                        <Mail size={12} aria-hidden="true" />
                                        <span>{membro.email}</span>
                                      </p>
                                    ) : null}
                                    <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
                                      Papel:{" "}
                                      {papeisMembro.length
                                        ? papeisMembro.join(", ")
                                        : "Sem papel"}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {papeis.length ? (
                                      <select
                                        aria-label={`Papel de ${nomeMembro}`}
                                        disabled={membrosSalvando}
                                        defaultValue={papeisMembro[0] || ""}
                                        onChange={(event) =>
                                          onAlterarPapelMembro?.(
                                            membro.id,
                                            event.target.value
                                          )
                                        }
                                      >
                                        <option value="">Selecionar papel</option>
                                        {papeis.map((papel) => (
                                          <option
                                            key={papel.id || papel.nome}
                                            value={papel.nome}
                                          >
                                            {papel.nome}
                                          </option>
                                        ))}
                                      </select>
                                    ) : null}
                                    {String(membro.status || "").toLowerCase() ===
                                    "pendente" ? (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        disabled={membrosSalvando}
                                        onClick={() =>
                                          onReenviarConviteMembro?.(membro.id)
                                        }
                                      >
                                        Reenviar
                                      </Button>
                                    ) : null}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      disabled={membrosSalvando}
                                      onClick={() => onRemoverMembro?.(membro.id)}
                                      aria-label={`Remover membro ${nomeMembro}`}
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )
                    ) : (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <h4 className="mb-3 text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                          Convidar membro
                        </h4>
                        <form
                          className="flex flex-col gap-3"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            await onConvidarMembro?.({
                              email: conviteMembro.email.trim(),
                              papel:
                                conviteMembro.papel ||
                                papeis.find((p) => p.nome)?.nome ||
                                "Colaborador",
                            });
                            setConviteMembro({ email: "", papel: "" });
                            setMembrosMode("lista");
                          }}
                        >
                          <div>
                            <label
                              htmlFor="drawer-membro-email"
                              className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
                            >
                              E-mail
                            </label>
                            <input
                              id="drawer-membro-email"
                              type="email"
                              required
                              disabled={membrosSalvando}
                              value={conviteMembro.email}
                              onChange={(event) =>
                                setConviteMembro((prev) => ({
                                  ...prev,
                                  email: event.target.value,
                                }))
                              }
                              placeholder="nome@exemplo.com"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="drawer-membro-papel"
                              className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
                            >
                              Papel inicial
                            </label>
                            <select
                              id="drawer-membro-papel"
                              disabled={membrosSalvando}
                              value={conviteMembro.papel}
                              onChange={(event) =>
                                setConviteMembro((prev) => ({
                                  ...prev,
                                  papel: event.target.value,
                                }))
                              }
                            >
                              <option value="">Selecionar papel</option>
                              {papeis.map((papel) => (
                                <option key={papel.id || papel.nome} value={papel.nome}>
                                  {papel.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={membrosSalvando}
                              onClick={() => setMembrosMode("lista")}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              variant="primary"
                              loading={membrosSalvando}
                            >
                              Enviar convite
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </section>
                ) : null}

                {s.key === "tags" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Tags">
                    <div className="quadro-detalhe-page__section-header">
                      <h3 className="quadro-detalhe-page__section-title">
                        Tags do quadro
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          leftIcon={<Plus size={14} aria-hidden="true" />}
                          onClick={() => {
                            setTagEmEdicao(null);
                            setTagsMode("criar");
                          }}
                        >
                          Nova tag
                        </Button>
                      </div>
                    </div>
                    <p className="quadro-detalhe-page__section-text mb-3">
                      Use tags nos cartões para classificar o trabalho. Remover uma
                      tag aqui tira a etiqueta de todos os cartões.
                    </p>

                    {tagsErro ? (
                      <p
                        className="mb-3 mt-3 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                        role="alert"
                      >
                        {tagsErro}
                      </p>
                    ) : null}

                    {tagsMode === "lista" ? (
                      <TagList
                        tags={tags}
                        onEditar={(tag) => {
                          setTagEmEdicao(tag);
                          setTagsMode("editar");
                        }}
                        onRemover={onRemoverTag}
                        removendoId={removendoTagId}
                      />
                    ) : (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <h4 className="mb-3 text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                          {tagsMode === "editar" ? "Editar tag" : "Criar tag"}
                        </h4>
                        <TagForm
                          loading={tagSalvando || criandoTag}
                          initialValues={tagEmEdicao || {}}
                          submitLabel={tagsMode === "editar" ? "Salvar tag" : "Adicionar tag"}
                          onCancel={() => {
                            setTagEmEdicao(null);
                            setTagsMode("lista");
                          }}
                          onSubmit={async (payload) => {
                            if (tagsMode === "editar" && tagEmEdicao?.id) {
                              await onAtualizarTag?.(tagEmEdicao.id, payload);
                            } else {
                              await onCriarTag?.(payload);
                            }
                            setTagEmEdicao(null);
                            setTagsMode("lista");
                          }}
                        />
                      </div>
                    )}
                  </section>
                ) : null}

                {s.key === "visoes" ? (
                  <section className="quadro-detalhe-page__section" aria-label="Visões">
                    <div className="quadro-detalhe-page__section-header">
                      <h3 className="quadro-detalhe-page__section-title">Visões</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setVisaoEmEdicao(null);
                            setVisoesMode("criar");
                          }}
                        >
                          Nova visão
                        </Button>
                        <Button
                          variant="ghost"
                          leftIcon={<Eye size={14} aria-hidden="true" />}
                          onClick={() => onNavigateVisoes?.()}
                        >
                          Abrir página
                        </Button>
                      </div>
                    </div>
                    <p className="quadro-detalhe-page__section-text">
                      Crie visões salvas para aplicar filtros recorrentes e acelerar a
                      análise do quadro.
                    </p>

                    {visoesErro ? (
                      <p
                        className="mb-3 mt-3 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                        role="alert"
                      >
                        {visoesErro}
                      </p>
                    ) : null}

                    {visoesMode === "lista" ? (
                      visoes.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                          Nenhuma visão cadastrada.
                        </p>
                      ) : (
                        <ul className="mt-3 flex flex-col gap-2">
                          {visoes.map((visao) => (
                            <li
                              key={visao.id}
                              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
                                    {visao.nome}
                                  </strong>
                                  <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
                                    Status: {visao.ativa ? "Ativa" : "Inativa"}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setVisaoEmEdicao(visao);
                                      setVisoesMode("editar");
                                    }}
                                    aria-label={`Editar visão ${visao.nome}`}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoverVisao?.(visao)}
                                    aria-label={`Remover visão ${visao.nome}`}
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    ) : (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <h4 className="mb-3 text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                          {visoesMode === "editar" ? "Editar visão" : "Criar visão"}
                        </h4>
                        <VisaoForm
                          modo={visoesMode === "editar" ? "editar" : "criar"}
                          initialValues={visaoEmEdicao || {}}
                          loading={visaoSalvando}
                          onSubmit={async (payload) => {
                            if (visoesMode === "editar" && visaoEmEdicao?.id) {
                              await onAtualizarVisao?.(visaoEmEdicao.id, payload);
                            } else {
                              await onCriarVisao?.(payload);
                            }
                            setVisaoEmEdicao(null);
                            setVisoesMode("lista");
                          }}
                          onCancel={() => {
                            setVisaoEmEdicao(null);
                            setVisoesMode("lista");
                          }}
                        />
                      </div>
                    )}
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
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setCampoEmEdicao(null);
                            setCamposMode("criar");
                          }}
                        >
                          Novo campo
                        </Button>
                        <Button
                          variant="ghost"
                          leftIcon={<SlidersHorizontal size={14} aria-hidden="true" />}
                          onClick={() => onNavigateCamposPersonalizados?.()}
                        >
                          Abrir página
                        </Button>
                      </div>
                    </div>
                    <p className="quadro-detalhe-page__section-text">
                      Defina metadados extras dos cartões para adaptar o quadro ao seu
                      processo.
                    </p>

                    {camposErro ? (
                      <p
                        className="mb-3 mt-3 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                        role="alert"
                      >
                        {camposErro}
                      </p>
                    ) : null}

                    {camposMode === "lista" ? (
                      campos.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                          Nenhum campo personalizado cadastrado.
                        </p>
                      ) : (
                        <div className="mt-3">
                          <CampoPersonalizadoList
                            campos={campos}
                            onEditar={(campo) => {
                              setCampoEmEdicao(campo);
                              setCamposMode("editar");
                            }}
                            onRemover={onRemoverCampo}
                          />
                        </div>
                      )
                    ) : (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <h4 className="mb-3 text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                          {camposMode === "editar"
                            ? "Editar campo personalizado"
                            : "Criar campo personalizado"}
                        </h4>
                        <CampoPersonalizadoForm
                          modo={camposMode === "editar" ? "editar" : "criar"}
                          initialValues={campoEmEdicao || {}}
                          loading={campoSalvando}
                          onSubmit={async (payload) => {
                            if (camposMode === "editar" && campoEmEdicao?.id) {
                              await onAtualizarCampo?.(campoEmEdicao.id, payload);
                            } else {
                              await onCriarCampo?.(payload);
                            }
                            setCampoEmEdicao(null);
                            setCamposMode("lista");
                          }}
                          onCancel={() => {
                            setCampoEmEdicao(null);
                            setCamposMode("lista");
                          }}
                        />
                      </div>
                    )}
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
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setPapelEmEdicao(null);
                            setPapeisMode("criar");
                          }}
                        >
                          Novo papel
                        </Button>
                        <Button variant="ghost" onClick={() => onNavigatePapeis?.()}>
                          Abrir página
                        </Button>
                      </div>
                    </div>
                    <p className="quadro-detalhe-page__section-text">
                      Os papéis controlam permissões de visualização, edição, listas,
                      cartões e membros.
                    </p>

                    {papeisErro ? (
                      <p
                        className="mb-3 mt-3 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                        role="alert"
                      >
                        {papeisErro}
                      </p>
                    ) : null}

                    {papeisMode === "lista" ? (
                      papeis.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                          Nenhum papel cadastrado.
                        </p>
                      ) : (
                        <ul className="mt-3 flex flex-col gap-2">
                          {papeis.map((papel) => (
                            <li
                              key={papel.id}
                              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
                                    {papel.nome}
                                  </strong>
                                  <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                                    {papel.descricao || "Sem descrição cadastrada."}
                                  </p>
                                  <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
                                    Status: {papel.ativo === false ? "Inativo" : "Ativo"}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setPapelEmEdicao(papel);
                                      setPapeisMode("editar");
                                    }}
                                    aria-label={`Editar papel ${papel.nome}`}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoverPapel?.(papel)}
                                    aria-label={`Remover papel ${papel.nome}`}
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    ) : (
                      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <h4 className="mb-3 text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                          {papeisMode === "editar" ? "Editar papel" : "Criar papel"}
                        </h4>
                        <QuadroPapelForm
                          modo={papeisMode === "editar" ? "editar" : "criar"}
                          initialValues={
                            papelEmEdicao
                              ? {
                                  nome: papelEmEdicao.nome,
                                  descricao: papelEmEdicao.descricao,
                                  permissoes: papelEmEdicao.permissoes,
                                }
                              : {}
                          }
                          loading={papelSalvando}
                          onSubmit={async (payload) => {
                            if (papeisMode === "editar" && papelEmEdicao?.id) {
                              await onAtualizarPapel?.(papelEmEdicao.id, payload);
                            } else {
                              await onCriarPapel?.(payload);
                            }
                            setPapelEmEdicao(null);
                            setPapeisMode("lista");
                          }}
                          onCancel={() => {
                            setPapelEmEdicao(null);
                            setPapeisMode("lista");
                          }}
                        />
                      </div>
                    )}
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
