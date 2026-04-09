import React, { useMemo, useState } from "react";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumb from "./Breadcrumb";
import "../../styles/components/app-layout.css";

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
  sidebarBrand = "PI.3",
  sidebarFooter = null,
  defaultSidebarCollapsed = false,
  mainClassName = "",
  contentClassName = "",
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const hasBreadcrumb =
    Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0;

  const breadcrumbNode = useMemo(() => {
    if (!hasBreadcrumb) return null;
    return <Breadcrumb items={breadcrumbItems} />;
  }, [breadcrumbItems, hasBreadcrumb]);

  function handleToggleDesktopSidebar() {
    setSidebarCollapsed((prev) => !prev);
  }

  function handleToggleMobileSidebar() {
    setMobileSidebarOpen((prev) => !prev);
  }

  function handleCloseMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>

      <div className="app-layout__shell">
        <Sidebar
          items={sidebarItems}
          groups={sidebarGroups}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          currentPath={currentPath}
          brand={sidebarBrand}
          footer={sidebarFooter}
          onCloseMobile={handleCloseMobileSidebar}
        />

        <div className="app-layout__main-column">
          <Topbar
            title={title}
            subtitle={subtitle}
            onToggleDesktopSidebar={handleToggleDesktopSidebar}
            onToggleMobileSidebar={handleToggleMobileSidebar}
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
            className={clsx("app-layout__main", mainClassName)}
            tabIndex={-1}
          >
            <div className={clsx("app-layout__content", contentClassName)}>
              {breadcrumbNode}

              <div className="app-layout__content-body">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}