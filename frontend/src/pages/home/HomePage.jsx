// HomePage.jsx - Versão melhorada
import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import {
  LayoutDashboard,
  Plus,
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  TrendingUp,
  Sparkles,
} from "lucide-react";

import "../../styles/pages/home.css";

const sidebarItems = [
  { key: "home", label: "Início", href: "/home", icon: LayoutDashboard },
];

const sidebarGroups = [
  {
    key: "estrutura",
    label: "Estrutura",
    sectionLabel: "Workspace",
    icon: Building2,
    items: [
      {
        key: "organizacoes",
        label: "Organizações",
        href: "/organizacoes",
        icon: Building2,
      },
      {
        key: "quadros",
        label: "Quadros",
        href: "/quadros",
        icon: KanbanSquare,
      },
    ],
  },
  {
    key: "gestao",
    label: "Gestão",
    sectionLabel: "Operacional",
    icon: ListTodo,
    items: [
      {
        key: "listas",
        label: "Listas",
        href: "/listas",
        icon: ListTodo,
      },
      {
        key: "cartoes",
        label: "Cartões",
        href: "/cartoes",
        icon: CheckSquare,
      },
    ],
  },
];

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

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateOrganization = () => {
    // Navegar para página de criação
    console.log("Criar organização");
  };

  const handleCreateBoard = () => {
    console.log("Criar quadro");
  };

  if (isLoading) {
    return (
      <AppLayout
        title="Início"
        subtitle="Carregando..."
        currentPath="/home"
        sidebarItems={sidebarItems}
        sidebarGroups={sidebarGroups}
        breadcrumbItems={[{ label: "Início" }]}
        user={{
          name: "Usuário",
          email: "usuario@email.com",
        }}
        notificationCount={0}
      >
        <div className="home-page">
          <div className="home-page__skeleton" style={{ height: "200px", borderRadius: "24px" }} />
          <div className="home-page__stats">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="home-page__skeleton" style={{ height: "120px", borderRadius: "20px" }} />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Início"
      subtitle="Visão geral do sistema"
      currentPath="/home"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={[{ label: "Início" }]}
      user={{
        name: "Usuário",
        email: "usuario@email.com",
      }}
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

        <section className="home-page__hero" aria-label="Resumo inicial da plataforma">
          <div className="home-page__hero-content">
            <div className="home-page__hero-badge">
              <Sparkles size={14} aria-hidden="true" />
              <span>Painel inicial</span>
            </div>

            <h2 className="home-page__hero-title">
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

            <Button variant="secondary" onClick={handleCreateBoard}>
              Ver organizações
            </Button>
          </div>
        </section>

        <section className="home-page__stats" aria-label="Indicadores gerais">
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
                  {item.trend && (
                    <div className="home-page__stat-trend">
                      <TrendingUp size={12} />
                      <span>{item.trend}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="home-page__content-grid" aria-label="Conteúdo principal">
          <div className="home-page__panel home-page__panel--main">
            <EmptyState
              icon={<KanbanSquare size={48} />}
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
            <div className="home-page__section">
              <h3 className="home-page__section-title">Próximos passos</h3>

              <ol className="home-page__steps">
                <li className="home-page__step" onClick={handleCreateOrganization}>
                  <span className="home-page__step-index">1</span>
                  <div>
                    <strong>Criar organização</strong>
                    <p>Defina a estrutura inicial do workspace e convide membros.</p>
                  </div>
                </li>

                <li className="home-page__step" onClick={handleCreateBoard}>
                  <span className="home-page__step-index">2</span>
                  <div>
                    <strong>Criar quadro</strong>
                    <p>Organize o fluxo de trabalho principal com colunas personalizadas.</p>
                  </div>
                </li>

                <li className="home-page__step">
                  <span className="home-page__step-index">3</span>
                  <div>
                    <strong>Adicionar listas e cartões</strong>
                    <p>Monte a operação mínima do sistema com tarefas detalhadas.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="home-page__section">
              <h3 className="home-page__section-title">Dica rápida</h3>
              <p className="home-page__note">
                💡 Comece criando uma organização para representar sua empresa ou
                projeto. Em seguida, adicione quadros para diferentes áreas ou
                fluxos de trabalho. As listas e cartões ajudarão a detalhar as
                tarefas do dia a dia.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </AppLayout>
  );
}