import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import QuadroPapelForm, {
  PERMISSOES_QUADRO_PADRAO,
} from "../../components/quadros/QuadroPapelForm";

import quadroService from "../../services/quadroService";
import quadroPapelService from "../../services/quadroPapelService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractList, extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import {
  ShieldCheck,
  Plus,
  Search,
  Crown,
  UserCog,
  EyeOff,
  KeyRound,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  Settings,
  Trash2,
  Users,
  MoveRight,
} from "lucide-react";

import "../../styles/pages/quadro-papeis.css";

const PERM_ICONS = {
  visualizarQuadro: KanbanSquare,
  editarQuadro: Settings,
  excluirQuadro: Trash2,
  gerenciarMembros: Users,
  moverCartoes: MoveRight,
  editarListas: ListTodo,
};

function obterIconePapel(nomePapel) {
  if (nomePapel === "Administrador") return Crown;
  if (nomePapel === "Colaborador") return UserCog;
  return ShieldCheck;
}

export default function QuadroPapeisPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const [quadro, setQuadro] = useState(null);
  const [papeis, setPapeis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(null);
  const [salvandoPapel, setSalvandoPapel] = useState(false);
  const [acaoErro, setAcaoErro] = useState("");

  const carregar = useCallback(async () => {
    if (!quadroId) return;

    setLoading(true);
    setErro("");

    try {
      const [resQuadro, resPapeis] = await Promise.all([
        quadroService.obterPorId(quadroId),
        quadroPapelService.listar(quadroId),
      ]);

      let data = extractObject(resQuadro) || resQuadro;

      if (data?.organizacaoId && !data.organizacao?.nome) {
        try {
          const orgRes = await buscarOrganizacaoPorId(data.organizacaoId);
          const org = extractObject(orgRes) || orgRes;
          data = {
            ...data,
            organizacao: { id: data.organizacaoId, nome: org?.nome || "" },
          };
        } catch {
          data = {
            ...data,
            organizacao: { id: data.organizacaoId, nome: "Organização" },
          };
        }
      }

      setQuadro(data);
      const lista = extractList(resPapeis).map((p) => ({
        ...p,
        ativo: p.ativo !== false,
        membros: p.membros ?? 0,
        permissoes: p.permissoes || {},
      }));
      setPapeis(lista);
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar os papéis."
      );
      setQuadro(null);
      setPapeis([]);
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const papeisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return papeis.filter((papel) => {
      if (!termo) return true;

      return (
        String(papel.nome || "")
          .toLowerCase()
          .includes(termo) ||
        String(papel.descricao || "")
          .toLowerCase()
          .includes(termo)
      );
    });
  }, [busca, papeis]);

  const totalMembrosVinculados = useMemo(() => {
    return papeis.reduce((acc, papel) => acc + (papel.membros || 0), 0);
  }, [papeis]);

  const totalPapeisAtivos = useMemo(() => {
    return papeis.filter((p) => p.ativo).length;
  }, [papeis]);

  function handleAbrirQuadro() {
    navigate(`/quadros/${quadroId}`);
  }

  async function handleSalvarPapel(payload) {
    setSalvandoPapel(true);
    setAcaoErro("");
    try {
      if (modal?.mode === "criar") {
        await quadroPapelService.criar(quadroId, {
          nome: payload.nome,
          descricao: payload.descricao,
          permissoes: payload.permissoes,
        });
      } else if (modal?.mode === "editar" && modal.papel?.id) {
        const id = modal.papel.id;
        await quadroPapelService.atualizar(quadroId, id, {
          nome: payload.nome,
          descricao: payload.descricao,
        });
        await quadroPapelService.atualizarPermissoes(
          quadroId,
          id,
          payload.permissoes
        );
      }
      setModal(null);
      await carregar();
    } catch (e) {
      setAcaoErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível salvar o papel."
      );
      throw e;
    } finally {
      setSalvandoPapel(false);
    }
  }

  async function handleRemoverPapel(papelId) {
    if (!window.confirm("Remover este papel do quadro?")) return;
    setAcaoErro("");
    try {
      await quadroPapelService.remover(quadroId, papelId);
      await carregar();
    } catch (e) {
      setAcaoErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível remover o papel."
      );
    }
  }

  if (loading && !quadro) {
    return (
      <AppLayout
        title="Papéis do quadro"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando papéis" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="Papéis do quadro"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Não foi possível carregar"
          description={erro || "Quadro indisponível."}
          action={
            <Button variant="primary" onClick={() => navigate("/quadros")}>
              Voltar
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Papéis do quadro"
      subtitle="Defina responsabilidades e permissões por papel"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Papéis" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setModal({ mode: "criar", papel: null })}
        >
          Novo papel
        </Button>
      }
    >
      <div className="quadro-papeis-page">
        <PageHeader
          title="Papéis do quadro"
          description={`Estruture os papéis do quadro "${quadro.nome}".`}
          actions={
            <>
              <Button variant="secondary" onClick={handleAbrirQuadro}>
                Ver quadro
              </Button>

              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setModal({ mode: "criar", papel: null })}
              >
                Novo papel
              </Button>
            </>
          }
        />

        {acaoErro ? (
          <p
            className="mb-4 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
            role="alert"
          >
            {acaoErro}
          </p>
        ) : null}

        <section
          className="quadro-papeis-page__hero"
          aria-labelledby="quadro-papeis-hero-title"
        >
          <div className="quadro-papeis-page__hero-content">
            <div className="quadro-papeis-page__hero-badge">
              <KeyRound size={14} aria-hidden="true" />
              <span>Permissões e responsabilidades</span>
            </div>

            <h2
              id="quadro-papeis-hero-title"
              className="quadro-papeis-page__hero-title"
            >
              Papéis bem definidos reduzem conflito e retrabalho.
            </h2>

            <p className="quadro-papeis-page__hero-description">
              Organização:{" "}
              <strong>{quadro.organizacao?.nome || "—"}</strong>.
            </p>
          </div>
        </section>

        <section
          className="quadro-papeis-page__toolbar"
          aria-label="Ferramentas de busca de papéis"
        >
          <div className="quadro-papeis-page__toolbar-group quadro-papeis-page__toolbar-group--search">
            <label htmlFor="quadro-papeis-busca" className="sr-only">
              Buscar papéis
            </label>

            <div className="quadro-papeis-page__search">
              <span
                className="quadro-papeis-page__search-icon"
                aria-hidden="true"
              >
                <Search size={16} />
              </span>

              <input
                id="quadro-papeis-busca"
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome ou descrição do papel"
                className="quadro-papeis-page__search-input"
              />
            </div>
          </div>
        </section>

        <section
          className="quadro-papeis-page__summary"
          aria-label="Resumo dos papéis do quadro"
        >
          <article className="quadro-papeis-page__summary-card">
            <p className="quadro-papeis-page__summary-label">Papéis exibidos</p>
            <strong className="quadro-papeis-page__summary-value">
              {papeisFiltrados.length}
            </strong>
          </article>

          <article className="quadro-papeis-page__summary-card">
            <p className="quadro-papeis-page__summary-label">Papéis ativos</p>
            <strong className="quadro-papeis-page__summary-value">
              {totalPapeisAtivos}
            </strong>
          </article>

          <article className="quadro-papeis-page__summary-card">
            <p className="quadro-papeis-page__summary-label">
              Membros vinculados
            </p>
            <strong className="quadro-papeis-page__summary-value">
              {totalMembrosVinculados}
            </strong>
          </article>
        </section>

        {papeisFiltrados.length === 0 ? (
          <section className="quadro-papeis-page__empty">
            <EmptyState
              icon={<ShieldCheck size={40} />}
              title="Nenhum papel encontrado"
              description="Revise a busca ou crie um novo papel."
              action={
                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setModal({ mode: "criar", papel: null })}
                >
                  Criar papel
                </Button>
              }
            />
          </section>
        ) : (
          <section
            className="quadro-papeis-page__grid"
            aria-label="Lista de papéis do quadro"
          >
            {papeisFiltrados.map((papel) => {
              const IconePapel = obterIconePapel(papel.nome);

              return (
                <article
                  key={papel.id}
                  className="quadro-papeis-page__card"
                  aria-labelledby={`papel-${papel.id}-titulo`}
                >
                  <div className="quadro-papeis-page__card-header">
                    <div className="quadro-papeis-page__card-title-block">
                      <div
                        className="quadro-papeis-page__card-icon"
                        aria-hidden="true"
                      >
                        <IconePapel size={18} />
                      </div>

                      <div>
                        <h2
                          id={`papel-${papel.id}-titulo`}
                          className="quadro-papeis-page__card-title"
                        >
                          {papel.nome}
                        </h2>
                        <p className="quadro-papeis-page__card-members">
                          {papel.membros} membro(s) vinculados
                        </p>
                      </div>
                    </div>

                    <div className="quadro-papeis-page__card-actions">
                      <span
                        className={`quadro-papeis-page__card-status ${
                          papel.ativo
                            ? "quadro-papeis-page__card-status--active"
                            : "quadro-papeis-page__card-status--inactive"
                        }`}
                      >
                        {papel.ativo ? "Ativo" : "Inativo"}
                      </span>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          setModal({ mode: "editar", papel })
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoverPapel(papel.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>

                  <p className="quadro-papeis-page__card-description">
                    {papel.descricao || "Sem descrição cadastrada."}
                  </p>

                  <div className="quadro-papeis-page__permissions">
                    {PERMISSOES_QUADRO_PADRAO.map((meta) => {
                      const IconePermissao =
                        PERM_ICONS[meta.key] || CheckSquare;
                      const ativa = Boolean(papel.permissoes?.[meta.key]);

                      return (
                        <div
                          key={meta.key}
                          className={`quadro-papeis-page__permission quadro-papeis-page__permission--${
                            ativa ? "enabled" : "disabled"
                          }`}
                        >
                          <span
                            className="quadro-papeis-page__permission-icon"
                            aria-hidden="true"
                          >
                            <IconePermissao size={14} />
                          </span>

                          <span className="quadro-papeis-page__permission-label">
                            {meta.label}
                          </span>

                          {!ativa ? (
                            <span className="quadro-papeis-page__permission-state">
                              <EyeOff size={12} aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {modal ? (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
          role="presentation"
          onClick={() => !salvandoPapel && setModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="papel-modal-titulo"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="papel-modal-titulo"
              className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
            >
              {modal.mode === "criar" ? "Novo papel" : "Editar papel"}
            </h2>
            <div className="mt-4">
              <QuadroPapelForm
                modo={modal.mode === "criar" ? "criar" : "editar"}
                initialValues={
                  modal.papel
                    ? {
                        nome: modal.papel.nome,
                        descricao: modal.papel.descricao,
                        permissoes: modal.papel.permissoes,
                      }
                    : {}
                }
                loading={salvandoPapel}
                onCancel={() => !salvandoPapel && setModal(null)}
                onSubmit={handleSalvarPapel}
              />
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
