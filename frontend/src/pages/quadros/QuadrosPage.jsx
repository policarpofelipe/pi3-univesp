import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import QuadroCard from "../../components/quadros/QuadroCard";
import QuadroForm from "../../components/quadros/QuadroForm";

import quadroService from "../../services/quadroService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractList, extractObject } from "../../utils/apiData";

import {
  KanbanSquare,
  Plus,
  Search,
  Filter,
} from "lucide-react";

import "../../styles/pages/quadros.css";

const currentUser = {
  name: "Usuário",
};

function obterStatusQuadro(quadro) {
  return quadro.arquivadoEm || quadro.arquivado ? "arquivado" : "ativo";
}

export default function QuadrosPage() {
  const navigate = useNavigate();
  const { organizacaoId } = useParams();

  const [quadros, setQuadros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalCriar, setModalCriar] = useState(false);
  const [criando, setCriando] = useState(false);
  const [orgNome, setOrgNome] = useState("");

  const carregarQuadros = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      const response = await quadroService.listar({
        organizacaoId: organizacaoId || undefined,
      });
      const raw = extractList(response);
      setQuadros(raw);
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar os quadros."
      );
      setQuadros([]);
    } finally {
      setLoading(false);
    }
  }, [organizacaoId]);

  useEffect(() => {
    carregarQuadros();
  }, [carregarQuadros]);

  useEffect(() => {
    let cancel = false;

    async function loadOrg() {
      if (!organizacaoId) {
        setOrgNome("");
        return;
      }

      try {
        const response = await buscarOrganizacaoPorId(organizacaoId);
        const data = extractObject(response) || response;
        if (!cancel) {
          setOrgNome(data?.nome || "");
        }
      } catch {
        if (!cancel) setOrgNome("");
      }
    }

    loadOrg();
    return () => {
      cancel = true;
    };
  }, [organizacaoId]);

  const quadrosFiltrados = useMemo(() => {
    return quadros.filter((quadro) => {
      const termo = busca.trim().toLowerCase();

      const correspondeOrganizacao =
        !organizacaoId ||
        String(quadro.organizacaoId) === String(organizacaoId);

      const correspondeBusca =
        !termo ||
        String(quadro.nome || "")
          .toLowerCase()
          .includes(termo) ||
        String(quadro.descricao || "")
          .toLowerCase()
          .includes(termo) ||
        String(quadro.organizacaoNome || "")
          .toLowerCase()
          .includes(termo);

      const statusQuadro = obterStatusQuadro(quadro);
      const correspondeStatus =
        filtroStatus === "todos" || statusQuadro === filtroStatus;

      return correspondeOrganizacao && correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, organizacaoId, quadros]);

  function handleCriarQuadro() {
    if (!organizacaoId) {
      window.alert(
        "Para criar um quadro, acesse antes uma organização e use o atalho de quadros no contexto dela."
      );
      return;
    }
    setModalCriar(true);
  }

  function handleAbrirQuadro(id) {
    navigate(`/quadros/${id}`);
  }

  function handleConfigurarQuadro(id) {
    navigate(`/quadros/${id}/configuracoes`);
  }

  async function handleSubmitNovoQuadro(payload) {
    setCriando(true);
    try {
      const response = await quadroService.criar({
        nome: payload.nome,
        descricao: payload.descricao,
        organizacaoId: payload.organizacaoId || organizacaoId,
        visibilidade: payload.visibilidade,
      });
      const created = extractObject(response) || response?.data;
      const newId = created?.id;
      setModalCriar(false);
      await carregarQuadros();
      if (newId) {
        navigate(`/quadros/${newId}`);
      }
    } finally {
      setCriando(false);
    }
  }

  const breadcrumbItems = [
    { label: "Início", href: "/home" },
    ...(organizacaoId
      ? [
          { label: "Organizações", href: "/organizacoes" },
          {
            label: orgNome || "Organização",
            href: `/organizacoes/${organizacaoId}`,
          },
        ]
      : []),
    { label: "Quadros" },
  ];

  const totalAtivos = quadrosFiltrados.filter(
    (q) => obterStatusQuadro(q) === "ativo"
  ).length;

  const totalArquivados = quadrosFiltrados.filter(
    (q) => obterStatusQuadro(q) === "arquivado"
  ).length;

  return (
    <AppLayout
      title="Quadros"
      subtitle="Gerencie os quadros disponíveis no sistema"
      breadcrumbItems={breadcrumbItems}
      user={currentUser}
    >
      <div className="quadros-page">
        <PageHeader
          title="Quadros"
          description={
            organizacaoId && orgNome
              ? `Quadros da organização ${orgNome}.`
              : "Visualize, filtre e acesse os quadros vinculados às organizações disponíveis."
          }
          actions={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleCriarQuadro}
              disabled={!organizacaoId}
            >
              Novo quadro
            </Button>
          }
        />

        {!organizacaoId ? (
          <p className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
            Dica: abra uma organização e use &quot;Ver quadros&quot; para criar
            quadros já vinculados a ela.
          </p>
        ) : null}

        {loading ? (
          <LoadingState title="Carregando quadros" />
        ) : erro ? (
          <ErrorState
            title="Não foi possível carregar os quadros"
            description={erro}
            action={
              <Button variant="primary" onClick={carregarQuadros}>
                Tentar novamente
              </Button>
            }
          />
        ) : (
          <>
            <section
              className="quadros-page__toolbar"
              aria-label="Ferramentas de busca e filtro"
            >
              <div className="quadros-page__toolbar-group quadros-page__toolbar-group--search">
                <label htmlFor="quadros-busca" className="sr-only">
                  Buscar quadros
                </label>

                <div className="quadros-page__search">
                  <span className="quadros-page__search-icon" aria-hidden="true">
                    <Search size={16} />
                  </span>

                  <input
                    id="quadros-busca"
                    type="search"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar por nome, descrição ou organização"
                    className="quadros-page__search-input"
                  />
                </div>
              </div>

              <div className="quadros-page__toolbar-group">
                <label htmlFor="quadros-status" className="sr-only">
                  Filtrar por status
                </label>

                <div className="quadros-page__filter">
                  <span className="quadros-page__filter-icon" aria-hidden="true">
                    <Filter size={16} />
                  </span>

                  <select
                    id="quadros-status"
                    value={filtroStatus}
                    onChange={(event) => setFiltroStatus(event.target.value)}
                    className="quadros-page__filter-select"
                  >
                    <option value="todos">Todos os quadros</option>
                    <option value="ativo">Somente ativos</option>
                    <option value="arquivado">Somente arquivados</option>
                  </select>
                </div>
              </div>
            </section>

            <section
              className="quadros-page__summary"
              aria-label="Resumo dos quadros listados"
            >
              <article className="quadros-page__summary-card">
                <p className="quadros-page__summary-label">Total exibido</p>
                <strong className="quadros-page__summary-value">
                  {quadrosFiltrados.length}
                </strong>
              </article>

              <article className="quadros-page__summary-card">
                <p className="quadros-page__summary-label">Ativos</p>
                <strong className="quadros-page__summary-value">
                  {totalAtivos}
                </strong>
              </article>

              <article className="quadros-page__summary-card">
                <p className="quadros-page__summary-label">Arquivados</p>
                <strong className="quadros-page__summary-value">
                  {totalArquivados}
                </strong>
              </article>
            </section>

            {quadrosFiltrados.length === 0 ? (
              <section className="quadros-page__empty">
                <EmptyState
                  icon={<KanbanSquare size={40} />}
                  title="Nenhum quadro encontrado"
                  description="Não há quadros compatíveis com os filtros aplicados. Ajuste a busca ou crie um novo quadro no contexto de uma organização."
                  action={
                    <Button
                      variant="primary"
                      leftIcon={<Plus size={16} />}
                      onClick={handleCriarQuadro}
                      disabled={!organizacaoId}
                    >
                      Criar quadro
                    </Button>
                  }
                />
              </section>
            ) : (
              <section
                className="quadros-page__grid"
                aria-label="Lista de quadros disponíveis"
              >
                {quadrosFiltrados.map((quadro) => (
                  <QuadroCard
                    key={quadro.id}
                    quadro={quadro}
                    omitirNomeOrganizacao={Boolean(organizacaoId)}
                    onOpen={handleAbrirQuadro}
                    onConfigure={handleConfigurarQuadro}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {modalCriar ? (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[var(--color-scrim)] p-4"
          role="presentation"
          onClick={() => !criando && setModalCriar(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-novo-quadro-titulo"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="modal-novo-quadro-titulo"
              className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
            >
              Novo quadro
            </h2>
            <div className="mt-4">
              <QuadroForm
                modo="criar"
                organizacaoId={organizacaoId}
                organizacaoNome={orgNome}
                loading={criando}
                showArquivado={false}
                onCancel={() => !criando && setModalCriar(false)}
                onSubmit={handleSubmitNovoQuadro}
              />
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
