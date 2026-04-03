import React from "react";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { LayoutDashboard, Plus } from "lucide-react";

/*
Contexto:
Página inicial deve ser simples, mas estruturalmente correta.
Ela valida:
- integração do AppLayout
- consistência de navegação
- uso de componentes reutilizáveis

Evite aqui lógica pesada. Home é composição, não domínio.
*/

const sidebarItems = [
  { key: "home", label: "Início", href: "/home", icon: LayoutDashboard },
];

const sidebarGroups = [
  {
    key: "estrutura",
    label: "Estrutura",
    sectionLabel: "Workspace",
    items: [
      { key: "organizacoes", label: "Organizações", href: "/organizacoes", icon: LayoutDashboard },
      { key: "quadros", label: "Quadros", href: "/quadros", icon: LayoutDashboard },
    ],
  },
  {
    key: "gestao",
    label: "Gestão",
    sectionLabel: "Operacional",
    items: [
      { key: "listas", label: "Listas", href: "/listas", icon: LayoutDashboard },
      { key: "cartoes", label: "Cartões", href: "/cartoes", icon: LayoutDashboard },
    ],
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
      breadcrumbItems={[
        { label: "Início" }
      ]}
      user={{
        name: "Usuário",
        email: "usuario@email.com",
      }}
      notificationCount={0}
    >
      <PageHeader
        title="Dashboard"
        description="Acompanhe suas atividades, quadros e organizações."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Criar quadro
          </Button>
        }
      />

      <EmptyState
        icon={<LayoutDashboard className="h-8 w-8" />}
        title="Nenhum quadro encontrado"
        description="Você ainda não criou ou não tem acesso a nenhum quadro. Comece criando um novo."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Criar primeiro quadro
          </Button>
        }
      />
    </AppLayout>
  );
}