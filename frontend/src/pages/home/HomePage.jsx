import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

import {
  Plus,
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  TrendingUp,
  Sparkles,
} from "lucide-react";

import "../../styles/pages/home.css";

const stats = [
  {
    key: "organizacoes",
    label: "Organizações",
    value: "0",
    helper: "Nenhuma organização criada",
    icon: Building2,
    trend: "+0 este mês",
  },
  {
    key: "quadros",
    label: "Quadros",
    value: "0",
    helper: "Nenhum quadro disponível",
    icon: KanbanSquare,
    trend: "Comece criando um",
  },
  {
    key: "listas",
    label: "Listas",
    value: "0",
    helper: "Sem listas em andamento",
    icon: ListTodo,
    trend: "Adicione sua primeira lista",
  },
  {
    key: "cartoes",
    label: "Cartões",
    value: "0",
    helper: "Sem cartões ativos",
    icon: CheckSquare,
    trend: "Crie cartões para organizar",
  },
];

const currentUser = {
  name: "Usuário",
};

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => window.clearTimeout(timer);
  }, []);

  function handleCreateOrganization() {
    navigate("/organizacoes");
  }

  function handleCreateBoard() {
    navigate("/quadros");
  }

  function handleViewOrganizations() {
    navigate("/organizacoes");
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
            <div className="home-page__skeleton home-page__skeleton--hero" />

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
          className="home-page__hero"
          aria-labelledby="home-hero-title"
        >
          <div className="home-page__hero-content">
            <div className="home-page__hero-badge">
              <Sparkles size={14} aria-hidden="true" />
              <span>Painel inicial</span>
            </div>

            <h2 id="home-hero-title" className="home-page__hero-title">
              Bem-vindo ao ambiente principal do sistema.
            </h2>

            <p className="home-page__hero-description">
              Este painel concentra os pontos de entrada da aplicação. A partir
              daqui, organize suas organizações, gerencie quadros e inicie o fluxo
              principal de trabalho com clareza e eficiência.
            </p>
          </div>

          <div className="home-page__hero-actions">
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleCreateOrganization}
            >
              Nova organização
            </Button>

            <Button
              variant="secondary"
              onClick={handleViewOrganizations}
            >
              Ver organizações
            </Button>
          </div>
        </section>

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

                  {item.trend ? (
                    <div className="home-page__stat-trend">
                      <TrendingUp size={12} aria-hidden="true" />
                      <span>{item.trend}</span>
                    </div>
                  ) : null}
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
