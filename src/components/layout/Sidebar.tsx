// components/Sidebar.tsx
"use client";

import React, { useLayoutEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/contexts/UserContext";
import type { Menu } from "@/lib/types/user";

// Menu icon from API: response icon (e.g. "dashboard", "users") -> "la la-{icon}"
const getMenuIcon = (icon: string | null, menuCode: string): string => {
  if (icon && icon.trim()) {
    return `${icon.trim()}`;
  }
  return "la la-menu";
};

// Generate a unique tab ID from menu code
const getTabId = (menuCode: string, index: number): string => {
  const tabIdMap: Record<string, string> = {
    Dashboard: "dashboard-tab",
    Lead: "apps-tab",
    Invoice: "pages-tab",
  };
  return tabIdMap[menuCode] || `menu-tab-${index}`;
};

// Generate a unique pane ID from menu code
const getPaneId = (menuCode: string, index: number): string => {
  const paneIdMap: Record<string, string> = {
    Dashboard: "MetricaDashboard",
    Lead: "MetricaApps",
    Invoice: "Invoices",
  };
  return paneIdMap[menuCode] || `MenuPane${index}`;
};

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const { user, loading } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [activePathname, setActivePathname] = useState("");

  // Get menus from user context, sorted by displayOrder
  const menus = useMemo(() => {
    if (!user?.menus) return [];
    return [...user.menus].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [user?.menus]);

  // Determine active tab based on current pathname
  const activeMenuIndex = useMemo(() => {
    if (!menus.length) return 0;
    
    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      if (menu.subMenus?.some((sub) => pathname === sub.routePath || pathname.startsWith(sub.routePath + "/"))) {
        return i;
      }
    }
    return 0; // Default to first menu
  }, [menus, pathname]);

  // Compute activeTab and activePathname only on client to avoid hydration mismatch
  useLayoutEffect(() => {
    setIsMounted(true);
    setActivePathname(pathname);

    if (!menus.length) return;

    const activeMenu = menus[activeMenuIndex];
    const tabId = getTabId(activeMenu.menuCode, activeMenuIndex);
    const paneId = getPaneId(activeMenu.menuCode, activeMenuIndex);

    // Ensure the correct sidebar tab pane is visible after navigation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Show the correct tab pane
          const panes = document.querySelectorAll(".main-icon-menu-pane.tab-pane");
          panes.forEach((pane) => {
            pane.classList.remove("show", "active");
          });

          const targetPane = document.getElementById(paneId);
          if (targetPane) {
            targetPane.classList.add("show", "active");
          }

          // Activate the correct sidebar icon tab
          const tabs = document.querySelectorAll("#tab-menu a");
          tabs.forEach((t) => {
            t.classList.remove("active");
            t.setAttribute("aria-selected", "false");
          });

          const targetTab = document.getElementById(tabId);
          if (targetTab) {
            targetTab.classList.add("active");
            targetTab.setAttribute("aria-selected", "true");

            // Use Bootstrap Tab API if available
            const Tab = window.bootstrap?.Tab;
            if (Tab && typeof Tab === "function" && "getInstance" in Tab) {
              try {
                const getInstance = Tab.getInstance as (
                  el: Element,
                ) => { show: () => void } | null;
                const tabInstance = getInstance(targetTab);
                if (tabInstance) {
                  tabInstance.show();
                } else {
                  const newTabInstance = new Tab(targetTab);
                  newTabInstance.show();
                }
              } catch {
                // Fallback to manual class manipulation
              }
            }
          }

          // Remove hash from URL if it doesn't match the current route
          if (isMounted && typeof window !== "undefined" && window.location.hash) {
            const hash = window.location.hash.substring(1);
            if (hash !== paneId) {
              window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search,
              );
            }
          }
        }, 100);
      });
    });
  }, [pathname, menus, activeMenuIndex, isMounted]);

  // Show loading state
  if (loading) {
    return (
      <div className="leftbar-tab-menu">
        <div className="main-icon-menu">
          <Link href="/dashboard" className="logo logo-metrica d-block text-center">
            <span>
              <img
                src="/assets/images/logo-sm.png"
                alt="logo-small"
                className="logo-sm"
              />
            </span>
          </Link>
          <div className="main-icon-menu-body d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leftbar-tab-menu">
      {/* Left vertical icon menu */}
      <div className="main-icon-menu">
        {/* Logo (small version) */}
        <Link href="/dashboard" className="logo logo-metrica d-block text-center">
          <span>
            <img
              src="/assets/images/logo-sm.png"
              alt="logo-small"
              className="logo-sm"
            />
          </span>
        </Link>

        {/* Icon navigation */}
        <div className="main-icon-menu-body">
          <div
            className="position-relative h-100"
            data-simplebar
            style={{ overflowX: "hidden" }}
          >
            <ul className="nav nav-tabs" role="tablist" id="tab-menu">
              {menus.map((menu, index) => {
                const tabId = getTabId(menu.menuCode, index);
                const paneId = getPaneId(menu.menuCode, index);
                const isActive = isMounted && activeMenuIndex === index;
                const iconClass = getMenuIcon(menu.icon, menu.menuCode);

                return (
                  <li
                    key={menu.menuId}
                    className="nav-item"
                    data-bs-toggle="tooltip"
                    data-bs-placement="right"
                    data-bs-trigger="hover"
                    title={menu.menuName}
                    suppressHydrationWarning
                  >
                    <a
                      href={`#${paneId}`}
                      id={tabId}
                      className={`nav-link ${isActive ? "active" : ""}`}
                      role="tab"
                      data-bs-toggle="tab"
                      aria-selected={isActive}
                      suppressHydrationWarning
                    >
                      <i className={`${iconClass} menu-icon`}></i>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Profile at bottom */}
        {/* <div className="pro-metrica-end">
          <a href="#" className="profile">
            <Image
              src="/assets/images/users/user-4.jpg"
              alt="profile-user"
              className="rounded-circle thumb-sm"
              width={36}
              height={36}
            />
          </a>
        </div> */}
      </div>

      {/* Main menu content (opens when icon is clicked) */}
      <div className="main-menu-inner">
        {/* Large logo */}
        <div className="topbar-left">
          <Link href="/dashboard" className="logo">
            <span>
              <img
                src="/assets/images/logo-dark.png"
                alt="logo-large"
                className="logo-lg logo-dark"
              />
              <img
                src="/assets/images/logo.png"
                alt="logo-large"
                className="logo-lg logo-light"
              />
            </span>
          </Link>
        </div>

        {/* Tab content */}
        <div
          className="menu-body navbar-vertical tab-content"
          data-simplebar
          style={{ overflowY: "auto" }}
        >
          {menus.map((menu, index) => {
            const paneId = getPaneId(menu.menuCode, index);
            const isActive = isMounted && activeMenuIndex === index;
            
            // Sort submenus by displayOrder
            const sortedSubMenus = menu.subMenus
              ? [...menu.subMenus].sort((a, b) => a.displayOrder - b.displayOrder)
              : [];

            return (
              <div
                key={menu.menuId}
                id={paneId}
                className={`main-icon-menu-pane tab-pane fade ${isActive ? "show active" : ""}`}
                role="tabpanel"
                suppressHydrationWarning
              >
                <div className="title-box">
                  <h6 className="menu-title">{menu.menuName}</h6>
                </div>

                <div className="collapse navbar-collapse" id="sidebarCollapse">
                  <ul className="navbar-nav">
                    {sortedSubMenus.map((subMenu) => {
                      const isSubMenuActive =
                        isMounted && activePathname === subMenu.routePath;

                      return (
                        <li key={subMenu.subMenuId} className="nav-item">
                          <Link
                            className={`nav-link ${isSubMenuActive ? "active" : ""}`}
                            href={subMenu.routePath}
                          >
                            {subMenu.subMenuName}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
