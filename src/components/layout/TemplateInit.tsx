"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type BootstrapCollapse = (new (
  el: Element,
  opts?: { toggle?: boolean },
) => { hide: () => void }) & {
  getInstance?: (el: Element) => { hide?: () => void } | null;
};

declare global {
  interface Window {
    feather?: { replace?: () => void };
    bootstrap?: {
      Tooltip?: new (el: Element) => unknown;
      Tab?: (new (el: Element) => { show: () => void; dispose?: () => void }) & {
        getInstance?: (el: Element) => { show: () => void; dispose?: () => void } | null;
      };
      Collapse?: BootstrapCollapse;
    };
  }
}

function initTooltips() {
  const Tooltip = window.bootstrap?.Tooltip;
  if (!Tooltip) return;

  const triggers = Array.from(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );

  for (const el of triggers) {
    try {
      void new Tooltip(el);
    } catch {
      // ignore duplicate init / edge cases
    }
  }
}

function initTabMenu() {
  const Tab = window.bootstrap?.Tab;
  if (!Tab) return;

  // Delay Bootstrap tab initialization until after React hydration completes
  // This prevents hydration mismatches from Bootstrap modifying DOM attributes
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const links = Array.from(document.querySelectorAll("#tab-menu a"));
      for (const el of links) {
        const a = el as HTMLAnchorElement;
        // Avoid double-binding on client navigations
        if (a.dataset["tabInit"] === "1") continue;
        a.dataset["tabInit"] = "1";

        // Only initialize Bootstrap tabs for sidebar icon toggles (href="#...")
        // Skip Next.js Link components (they have full URLs or are handled by React Router)
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) {
          continue;
        }

        // Destroy existing instance if any (for re-initialization on navigation)
        try {
          if ("getInstance" in Tab && typeof Tab.getInstance === "function") {
            const existingInstance = Tab.getInstance(a);
            if (existingInstance) {
              // Dispose of existing instance
              existingInstance.dispose?.();
            }
          }
        } catch {
          // ignore
        }

        let tab: { show: () => void; dispose?: () => void } | null = null;
        try {
          tab = new Tab(a);
        } catch {
          tab = null;
        }

        a.addEventListener("click", (e) => {
          // Only prevent default for sidebar tab toggles (hash links like #MetricaDashboard)
          // This allows sidebar menu sections to toggle without page navigation
          e.preventDefault();
          try {
            tab?.show?.();
          } catch {
            // ignore
          }
          document.body.classList.remove("enlarge-menu");

          // Update URL hash without triggering navigation
          // Use replaceState to avoid adding to history
          if (href && typeof window !== "undefined") {
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search + href,
            );
          }
        });
      }
    });
  });
}

function initNavbarCollapses() {
  const Collapse = window.bootstrap?.Collapse;
  if (!Collapse) return;

  const collapses = Array.from(document.querySelectorAll(".navbar-nav .collapse"));
  for (const el of collapses) {
    const c = el as HTMLElement;
    // Avoid double-binding
    if (c.dataset["collapseInit"] === "1") continue;
    c.dataset["collapseInit"] = "1";

    let instance: { hide: () => void } | null = null;
    try {
      instance = new Collapse(c, { toggle: false });
    } catch {
      instance = null;
    }

    c.addEventListener("show.bs.collapse", (evt: Event) => {
      evt.stopPropagation();
      const parent = c.parentElement?.closest(".collapse") as HTMLElement | null;
      if (!parent) return;
      const nested = Array.from(parent.querySelectorAll(".collapse"));
      for (const n of nested) {
        if (n === c) continue;
        try {
          window.bootstrap?.Collapse?.getInstance?.(n)?.hide?.();
        } catch {
          // ignore
        }
      }
    });

    c.addEventListener("hide.bs.collapse", (evt: Event) => {
      evt.stopPropagation();
      const nested = Array.from(c.querySelectorAll(".collapse"));
      for (const n of nested) {
        try {
          window.bootstrap?.Collapse?.getInstance?.(n)?.hide?.();
        } catch {
          // ignore
        }
      }
    });

    // Keep reference alive (avoids unused warnings)
    void instance;
  }
}

function initStickyTopbar() {
  const nav = document.getElementById("navbar-custom");
  if (!nav) return;

  const shouldStick =
    document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50;

  if (shouldStick) nav.classList.add("nav-sticky");
  else nav.classList.remove("nav-sticky");
}

function applyResponsiveBodyClasses() {
  const body = document.body;
  if (!body) return;

  const w = window.innerWidth;

  // Mirrors the template intent but safely.
  if (w < 1025) {
    body.classList.add("enlarge-menu", "enlarge-menu-all");
  } else if (w < 1340) {
    body.classList.remove("enlarge-menu-all");
    body.classList.add("enlarge-menu");
  } else {
    body.classList.remove("enlarge-menu", "enlarge-menu-all");
  }

  // Never keep the mobile drawer open when resizing up.
  if (w >= 992) body.classList.remove("sidebar-open");
}

export default function TemplateInit() {
  const pathname = usePathname();

  // One-time listeners
  useEffect(() => {
    const onScroll = () => initStickyTopbar();
    const onResize = () => applyResponsiveBodyClasses();

    // Initial run
    initStickyTopbar();
    applyResponsiveBodyClasses();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Re-run inits on navigation and when scripts become available
  useEffect(() => {
    let cancelled = false;
    // Use a stable timestamp instead of Date.now() to avoid hydration issues
    // This timestamp is only used for timeout calculation, not rendering
    const startedAt = typeof window !== "undefined" ? Date.now() : 0;

    // Use requestAnimationFrame to ensure DOM is ready before manipulating body classes
    requestAnimationFrame(() => {
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.remove("sidebar-open");
      }
    });

    const tick = () => {
      if (cancelled) return;
      if (typeof window === "undefined" || typeof document === "undefined") return;

      // Always safe to run
      initStickyTopbar();
      applyResponsiveBodyClasses();

      // These depend on vendor scripts being loaded
      try {
        window.feather?.replace?.();
      } catch {
        // ignore
      }

      initTooltips();
      // Delay tab menu init to avoid hydration mismatch (Bootstrap modifies DOM)
      setTimeout(() => {
        if (!cancelled) {
          initTabMenu();
        }
      }, 0);
      initNavbarCollapses();

      const hasBootstrap = Boolean(window.bootstrap);
      const hasFeather = Boolean(window.feather);

      // Retry briefly (helps first client navigation from /login → /dashboard)
      if (Date.now() - startedAt < 2000 && (!hasBootstrap || !hasFeather)) {
        setTimeout(tick, 50);
      }
    };

    // Delay initial tick to ensure React hydration is complete
    requestAnimationFrame(() => {
      if (!cancelled) {
        tick();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}

