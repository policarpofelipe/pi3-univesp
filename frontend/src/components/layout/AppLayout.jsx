import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";

import Topbar from "./Topbar";
import Breadcrumb from "./Breadcrumb";

import {
  sidebarItems as defaultSidebarItems,
  sidebarGroups as defaultSidebarGroups,
} from "../../constants/navigation";

import "../../styles/components/app-layout.css";

export default function AppLayout({
  children,
  title = "",
  subtitle = "",
  breadcrumbItems = [],
  sidebarItems,
  sidebarGroups,
  currentPath = "",
  user = null,
  topbarActions = null,
  searchValue = "",
  onSearchChange,
  notificationCount = 0,
  mainClassName = "",
  contentClassName = "",
}) {
  const location = useLocation();

  const resolvedSidebarItems = Array.isArray(sidebarItems)
    ? sidebarItems
    : defaultSidebarItems;

  const resolvedSidebarGroups = Array.isArray(sidebarGroups)
    ? sidebarGroups
    : defaultSidebarGroups;

  const resolvedCurrentPath = currentPath || location.pathname;

  const hasBreadcrumb =
    Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0;

  const breadcrumbNode = useMemo(() => {
    if (!hasBreadcrumb) return null;
    return <Breadcrumb items={breadcrumbItems} />;
  }, [breadcrumbItems, hasBreadcrumb]);

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>

      <div className="app-layout__shell">
        <div className="app-layout__main-column">
          <Topbar
            title={title}
            subtitle={subtitle}
            navigationItems={resolvedSidebarItems}
            navigationGroups={resolvedSidebarGroups}
            currentPath={resolvedCurrentPath}
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
