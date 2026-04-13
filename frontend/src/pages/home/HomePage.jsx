import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";

import organizacaoService from "../../services/organizacaoService";
import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import cartaoService from "../../services/cartaoService";
import { extractList } from "../../utils/apiData";

import { Plus, Building2, KanbanSquare, ListTodo, CheckSquare } from "lucide-react";

import "../../styles/pages/home.css";

const initialCounts = {
  organizacoes: 0,
  quadros: 0,
  listas: 0,
  cartoes: 0,
};

export default function HomePage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [quadros, setQuadros] = useState([]);
  const [counts, setCounts] = useState(initialCounts);

  const currentUser = useMemo(() => {
    const nome =
      usuario?.nome ||
      usuario?.name ||
      usuario?.email ||
      "Usuário";
    return { name: nome };
  }, [usuario]);

  const carregarPainel = useCallback(async (signal) => {
    setIsLoading(true);

    try {
      const [resOrgs, resQuadros] = await Promise.all([
        organizacaoService.listar().catch(() => ({ data: [] })),
        quadroService.listar().catch(() => ({ data: [] })),
      ]);

      if (signal.aborted) return;

      const organizacoes = extractList(resOrgs);
      const listaQuadros = extractList(resQuadros);

      let totalListas = 0;
      let totalCartoes = 0;

      if (listaQuadros.length > 0) {
        const porQuadro = await Promise.all(
          listaQuadros.map(async (q) => {
            const qid = q.id;
            if (!qid) return { listas: 0, cartoes: 0 };

            const [resListas, resCartoes] = await Promise.all([
              listaService.listar(qid).catch(() => ({ data: [] })),
              cartaoService.listar(qid).catch(() => ({ data: [] })),
            ]);

            return {
              listas: extractList(resListas).length,
              cartoes: extractList(resCartoes).length,
            };
          })
        );

        for (const t of porQuadro) {
          totalListas += t.listas;
          totalCartoes += t.cartoes;
        }
      }

      if (signal.aborted) return;

      setQuadros(listaQuadros);
      setCounts({
        organizacoes: organizacoes.length,
        quadros: listaQuadros.length,
        listas: totalListas,
        cartoes: totalCartoes,
      });
    } catch {
      if (!signal.aborted) {
        setQuadros([]);
        setCounts(initialCounts);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    carregarPainel(ac.signal);
    return () => ac.abort();
  }, [carregarPainel]);

  const stats = useMemo(() => {
    const { organizacoes: nOrg, quadros: nQuad, listas: nLista, cartoes: nCard } =
      counts;

    return [
      {
        key: "organizacoes",
        label: "Organizações",
        value: String(nOrg),
        helper:
          nOrg === 0
            ? "Nenhuma organização — crie uma para começar."
            : nOrg === 1
              ? "1 organização à qual você tem acesso."
              : `${nOrg} organizações às quais você tem acesso.`,
        icon: Building2,
      },
      {
        key: "quadros",
        label: "Quadros",
        value: String(nQuad),
        helper:
          nQuad === 0
            ? "Nenhum quadro nos workspaces acessíveis."
            : nQuad === 1
              ? "1 quadro disponível para você."
              : `${nQuad} quadros disponíveis para você.`,
        icon: KanbanSquare,
      },
      {
        key: "listas",
        label: "Listas",
        value: String(nLista),
        helper:
          nQuad === 0
            ? "Crie um quadro para adicionar listas."
            : nLista === 0
              ? "Nenhuma lista nos quadros acessíveis."
              : nLista === 1
                ? "1 lista no total dos seus quadros."
                : `${nLista} listas no total dos seus quadros.`,
        icon: ListTodo,
      },
      {
        key: "cartoes",
        label: "Cartões",
        value: String(nCard),
        helper:
          nQuad === 0
            ? "Crie um quadro para adicionar cartões."
            : nCard === 0
              ? "Nenhum cartão nos quadros acessíveis."
              : nCard === 1
                ? "1 cartão no total dos seus quadros."
                : `${nCard} cartões no total dos seus quadros.`,
        icon: CheckSquare,
      },
    ];
  }, [counts]);

  function handleCreateOrganization() {
    navigate("/organizacoes");
  }

  function handleCreateBoard() {
    navigate("/quadros");
  }

  if (isLoading) {
    return (
      <AppLayout
        title="Início"
        subtitle="Carregando..."
        breadcrumbItems={[{ label: "Início" }]}
        user={currentUser}
        notificationCount={0}
      >
        <div className="home-page" aria-busy="true" aria-live="polite">
          <section className="home-page__loading" aria-label="Carregando painel">
            <div className="home-page__skeleton home-page__skeleton--header" />

            <div className="home-page__stats">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="home-page__skeleton home-page__skeleton--stat"
                />
              ))}
            </div>

            <div className="home-page__content-grid">
              <div className="home-page__skeleton home-page__skeleton--panel-main" />
              <div className="home-page__skeleton home-page__skeleton--panel-side" />
            </div>
          </section>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Início"
      subtitle="Visão geral do sistema"
      breadcrumbItems={[{ label: "Início" }]}
      user={currentUser}
      notificationCount={0}
    >
      <div className="home-page">
        <PageHeader
          title="Dashboard"
          description="Acompanhe organizações, quadros e a estrutura inicial do sistema de gestão de tarefas."
          actions={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleCreateBoard}
            >
              Criar quadro
            </Button>
          }
        />

        <section
          className="home-page__stats"
          aria-labelledby="home-stats-title"
        >
          <h2 id="home-stats-title" className="sr-only">
            Indicadores gerais
          </h2>

          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.key} className="home-page__stat-card">
                <div className="home-page__stat-icon" aria-hidden="true">
                  <Icon size={20} />
                </div>

                <div className="home-page__stat-body">
                  <p className="home-page__stat-label">{item.label}</p>
                  <strong className="home-page__stat-value">{item.value}</strong>
                  <p className="home-page__stat-helper">{item.helper}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section
          className="home-page__content-grid"
          aria-label="Conteúdo principal"
        >
          <div className="home-page__panel home-page__panel--main">
            {quadros.length === 0 ? (
              <EmptyState
                icon={<KanbanSquare size={40} />}
                title="Nenhum quadro encontrado"
                description="Você ainda não criou ou não tem acesso a nenhum quadro. O próximo passo natural é cadastrar uma organização e criar o primeiro quadro para começar a organizar suas tarefas."
                action={
                  <Button
                    variant="primary"
                    leftIcon={<Plus size={16} />}
                    onClick={handleCreateBoard}
                  >
                    Criar primeiro quadro
                  </Button>
                }
              />
            ) : (
              <section
                className="home-page__section"
                aria-labelledby="home-quadros-title"
              >
                <h3 id="home-quadros-title" className="home-page__section-title">
                  Seus quadros
                </h3>
                <ul className="home-page__quadro-list">
                  {quadros.map((q) => {
                    const id = q.id;
                    const nome = q.nome || "Quadro sem nome";
                    const org =
                      q.organizacaoNome ||
                      q.organizacao?.nome ||
                      (q.organizacaoId ? `Organização #${q.organizacaoId}` : "");

                    return (
                      <li key={id} className="home-page__quadro-row">
                        <Link
                          to={`/quadros/${id}`}
                          className="home-page__quadro-link"
                        >
                          <span className="home-page__quadro-link-text">
                            {nome}
                            {org ? (
                              <span className="home-page__quadro-org">{org}</span>
                            ) : null}
                          </span>
                          <KanbanSquare
                            size={18}
                            className="home-page__quadro-link-icon"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Button variant="secondary" onClick={() => navigate("/quadros")}>
                  Ver todos os quadros
                </Button>
              </section>
            )}
          </div>

          <aside className="home-page__panel home-page__panel--side">
            <section
              className="home-page__section"
              aria-labelledby="home-steps-title"
            >
              <h3 id="home-steps-title" className="home-page__section-title">
                Próximos passos
              </h3>

              <ol className="home-page__steps">
                <li className="home-page__step">
                  <button
                    type="button"
                    className="home-page__step-button"
                    onClick={handleCreateOrganization}
                  >
                    <span className="home-page__step-index" aria-hidden="true">
                      1
                    </span>
                    <span className="home-page__step-content">
                      <strong>Criar organização</strong>
                      <span>
                        Defina a estrutura inicial do workspace e convide membros.
                      </span>
                    </span>
                  </button>
                </li>

                <li className="home-page__step">
                  <button
                    type="button"
                    className="home-page__step-button"
                    onClick={handleCreateBoard}
                  >
                    <span className="home-page__step-index" aria-hidden="true">
                      2
                    </span>
                    <span className="home-page__step-content">
                      <strong>Criar quadro</strong>
                      <span>
                        Organize o fluxo de trabalho principal com colunas personalizadas.
                      </span>
                    </span>
                  </button>
                </li>

                <li className="home-page__step">
                  <div className="home-page__step-static">
                    <span className="home-page__step-index" aria-hidden="true">
                      3
                    </span>
                    <span className="home-page__step-content">
                      <strong>Adicionar listas e cartões</strong>
                      <span>
                        Monte a operação mínima do sistema com tarefas detalhadas.
                      </span>
                    </span>
                  </div>
                </li>
              </ol>
            </section>

            <section
              className="home-page__section"
              aria-labelledby="home-tip-title"
            >
              <h3 id="home-tip-title" className="home-page__section-title">
                Dica rápida
              </h3>

              <p className="home-page__note">
                Comece criando uma organização para representar sua empresa ou
                projeto. Em seguida, adicione quadros para diferentes áreas ou
                fluxos de trabalho. As listas e cartões ajudarão a detalhar as
                tarefas do dia a dia.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </AppLayout>
  );
}
