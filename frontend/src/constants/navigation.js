import { LayoutDashboard, Building2, KanbanSquare } from "lucide-react";

/**
 * Itens principais da barra lateral (lista única, sem grupos/submenus).
 */
export const sidebarItems = [
  {
    key: "home",
    label: "Início",
    href: "/home",
    icon: LayoutDashboard,
  },
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
];

/** Grupos expansíveis desativados por ora — manter array vazio. */
export const sidebarGroups = [];
