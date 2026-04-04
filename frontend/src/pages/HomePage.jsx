import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import {
  LayoutDashboard,
  Plus,
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
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
    items: [
      { key: "organizacoes", label: "Organizações", href: "/organizacoes", icon: Building2 },
      { key: "quadros", label: "Quadros", href: "/quadros", icon: KanbanSquare },
    ],
  },
  {
    key: "gestao",
    label: "Gestão",
    sectionLabel: "Operacional",
    items: [
      { key: "listas", label: "Listas", href: "/listas", icon: ListTodo },
      { key: "cartoes", label: "Cartões", href: "/cartoes", icon: CheckSquare },
    ],
  },
];

const stats = [
  {
    key: "organizacoes",
    label: "Organizações",
    value: "0",
    helper: "Nenhuma organização carregada",
    icon: Building2,
  },
  {
    key: "quadros",
    label: "Quadros",
    value: "0",
    helper: "Nenhum quadro disponível",
    icon: KanbanSquare,
  },
  {
    key: "listas",
    label: "Listas",
    value: "0",
    helper: "Sem listas em andamento",
    icon: ListTodo,
  },
  {
    key: "cartoes",
    label: "Cartões",
    value: "0",
    helper: "Sem cartões ativos",
    icon: CheckSquare,
  },
];

export default function HomePage() {
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
          description="Acompanhe organizações, quadros e estrutura inicial do sistema de gestão de tarefas."
          actions={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
            >
              Criar quadro
            </Button>
          }
        />

        <section className="home-page__hero" aria-label="Resumo da área inicial">
          <div className="home-page__hero-content">
            <div className="home-page__hero-badge">
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>Painel inicial</span>
            </div>

            <h2 className="home-page__hero-title">
              Bem-vindo ao ambiente principal do sistema.
            </h2>

            <p className="home-page__hero-description">
              Este painel centraliza os pontos de entrada da aplicação. A partir daqui,
              o usuário deve conseguir localizar organizações, acessar quadros e iniciar
              o fluxo principal de trabalho com clareza.
            </p>
          </div>

          <div className="home-page__hero-actions">
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              Nova organização
            </Button>

            <Button variant="secondary">
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
                </div>
              </article>
            );
          })}
        </section>

        <section className="home-page__content-grid" aria-label="Conteúdo principal">
          <div className="home-page__panel home-page__panel--main">
            <EmptyState
              icon={<KanbanSquare size={32} />}
              title="Nenhum quadro encontrado"
              description="Você ainda não criou ou não tem acesso a nenhum quadro. O próximo passo natural é cadastrar uma organização e criar o primeiro quadro."
              action={
                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
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
                <li className="home-page__step">
                  <span className="home-page__step-index">1</span>
                  <div>
                    <strong>Criar organização</strong>
                    <p>Defina a estrutura inicial do workspace.</p>
                  </div>
                </li>

                <li className="home-page__step">
                  <span className="home-page__step-index">2</span>
                  <div>
                    <strong>Criar quadro</strong>
                    <p>Organize o fluxo de trabalho principal.</p>
                  </div>
                </li>

                <li className="home-page__step">
                  <span className="home-page__step-index">3</span>
                  <div>
                    <strong>Adicionar listas e cartões</strong>
                    <p>Monte a operação mínima do sistema.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="home-page__section">
              <h3 className="home-page__section-title">Observação</h3>
              <p className="home-page__note">
                Esta home ainda está em estado inicial. O papel dela, por enquanto,
                é validar layout, navegação, consistência visual e composição dos
                componentes reutilizáveis.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </AppLayout>
  );
}