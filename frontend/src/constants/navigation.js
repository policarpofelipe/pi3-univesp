import {
  LayoutDashboard,
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
} from "lucide-react";

export const sidebarItems = [
  {
    key: "home",
    label: "Início",
    href: "/home",
    icon: LayoutDashboard,
  },
];

export const sidebarGroups = [
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
