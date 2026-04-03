import React, { useMemo, useState } from "react";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumb from "./Breadcrumb";

/*
Responsabilidade:
- compor layout base da aplicação
- integrar Sidebar + Topbar + Breadcrumb + conteúdo principal
- controlar estado de colapso da sidebar
- oferecer skip link para acessibilidade
- manter área principal semanticamente correta

Contrato sugerido:
- children: conteúdo da página
- title: título principal da topbar
- subtitle: subtítulo da topbar
- breadcrumbItems: array consumido por Breadcrumb
- sidebarItems: itens simples da Sidebar
- sidebarGroups: grupos da Sidebar
- currentPath: rota atual para item ativo
- user: dados do usuário
- topbarActions: ações extras na Topbar
- searchValue / onSearchChange: busca controlada
- notificationCount: contador de notificações
- sidebarBrand: nome exibido no topo da Sidebar
- sidebarFooter: conteúdo opcional no rodapé da Sidebar
- defaultSidebarCollapsed: estado inicial da sidebar
- mainClassName: customização da área principal
- contentClassName: customização do container interno
*/

export default function AppLayout({
  children,
  title = "",
  subtitle = "",
  breadcrumbItems = [],
  sidebarItems = [],
  sidebarGroups = [],
  currentPath = "",
  user = null,
  topbarActions = null,
  searchValue = "",
  onSearchChange,
  notificationCount = 0,
  sidebarBrand = "PI3 Tasks",
  sidebarFooter = null,
  defaultSidebarCollapsed = false,
  mainClassName = "",
  contentClassName = "",
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);

  const hasBreadcrumb = Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0;

  const breadcrumbNode = useMemo(() => {
    if (!hasBreadcrumb) return null;
    return <Breadcrumb items={breadcrumbItems} />;
  }, [breadcrumbItems, hasBreadcrumb]);

  function handleToggleSidebar() {
    setSidebarCollapsed((prev) => !prev);
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>

      <div className="flex min-h-screen">
        <Sidebar
          items={sidebarItems}
          groups={sidebarGroups}
          collapsed={sidebarCollapsed}
          currentPath={currentPath}
          brand={sidebarBrand}
          footer={sidebarFooter}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={title}
            subtitle={subtitle}
            onToggleSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            showSidebarToggle
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            actions={topbarActions}
            user={user}
            notificationCount={notificationCount}
          />

          <main
            id="main-content"
            className={clsx(
              "flex-1 px-4 py-4 md:px-6 md:py-6",
              mainClassName
            )}
            tabIndex={-1}
          >
            <div
              className={clsx(
                "mx-auto flex w-full max-w-[var(--container-max-width)] flex-col gap-4 md:gap-6",
                contentClassName
              )}
            >
              {breadcrumbNode}

              <div
                className={clsx(
                  "flex min-h-0 flex-1 flex-col gap-4 md:gap-6"
                )}
              >
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}