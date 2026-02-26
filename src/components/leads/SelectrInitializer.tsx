"use client";

import Script from "next/script";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Selectr?: new (selector: string, options?: { multiple?: boolean }) => {
      destroy?: () => void;
      set?: (value: string) => void;
      refresh?: () => void;
    };
  }
}

const SELECTR_IDS = [
  "#default",
  "#division",
  "#subdivision",
  "#contractingTeamLeads",
  "#fromSelectCity",
  "#toCity",
  "#fromSelectCity1",
  "#toCity1",
  "#fromSelectCity2",
  "#toCity2",
  "#fromSelectCity3",
  "#toCity3",
  "#costsheeHead",
  "#costsheeParticulars",
  "#costsheetCurrency",
  "#costsheeHead1",
  "#costsheeParticulars1",
  "#costsheetCurrency1",
  "#costsheeHead2",
  "#costsheeParticulars2",
  "#costsheetCurrency2",
  "#costsheeHead3",
  "#costsheeParticulars3",
  "#costsheetCurrency3",
  "#multiSelect",
  "#contractingTeam",
];

/**
 * Client-only component that initializes Selectr dropdowns.
 * Handles re-initialization on navigation to ensure dropdowns work correctly.
 */
export default function SelectrInitializer() {
  const pathname = usePathname();
  const [selectrReady, setSelectrReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldLoadScript, setShouldLoadScript] = useState(true);
  const initializedRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mount state - only runs on client
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsMounted(true);
    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Check if Selectr script is already loaded (from dashboard layout) - check periodically
  useEffect(() => {
    const checkSelectr = () => {
      if (typeof window !== "undefined" && window.Selectr && !selectrReady) {
        setSelectrReady(true);
        setShouldLoadScript(false);
      }
    };

    // Check immediately
    checkSelectr();

    // Also check periodically in case script loads after component mounts
    const interval = setInterval(() => {
      checkSelectr();
    }, 100);

    return () => clearInterval(interval);
  }, [selectrReady]);

  // Initialize Selectr when script loads and component mounts
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    // Only initialize on /leads route
    const isLeadsRoute = pathname === "/leads" || pathname?.startsWith("/leads/");
    if (!isLeadsRoute) {
      return;
    }

      // Wait for Selectr to be available (either from script load or already loaded)
      const checkAndInit = (attempt = 0) => {
        if (!window.Selectr) {
          // Retry if Selectr not yet loaded (script might still be loading)
          // Max 20 attempts (1 second total wait time)
          if (attempt < 20) {
            timeoutRef.current = setTimeout(() => checkAndInit(attempt + 1), 50);
          }
          return;
        }

      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Destroy existing instances when navigating to /leads
      const destroyExistingInstances = () => {
        for (const id of SELECTR_IDS) {
          const el = document.querySelector(id);
          if (!el) continue;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const selectrInstance = (el as any).selectr;
          if (selectrInstance && typeof selectrInstance.destroy === "function") {
            try {
              selectrInstance.destroy();
            } catch {
              // ignore
            }
          }
        }
        initializedRef.current.clear();
      };

      // Initialize Selectr instances with retry logic
      const initializeSelectr = (retryCount = 0) => {
        if (!window.Selectr) return;

        let initializedCount = 0;
        const missingElements: string[] = [];

        for (const id of SELECTR_IDS) {
          // Skip if already initialized in this session
          if (initializedRef.current.has(id)) {
            continue;
          }

          const el = document.querySelector(id);
          if (!el) {
            missingElements.push(id);
            continue;
          }

          // Check if Selectr already initialized this element (from previous navigation)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const existingInstance = (el as any).selectr;
          if (existingInstance) {
            // Destroy existing instance before re-initializing
            try {
              if (typeof existingInstance.destroy === "function") {
                existingInstance.destroy();
              }
            } catch {
              // ignore
            }
          }

          try {
            // Enable multiselect for Contracting Team dropdowns
            const isMultiselect = id === "#contractingTeamLeads" || id === "#contractingTeam";
            const options = isMultiselect ? { multiple: true } : undefined;

            new window.Selectr(id, options);
            initializedRef.current.add(id);
            initializedCount++;
          } catch (error) {
            // Log error in development but don't break the app
            if (process.env.NODE_ENV === "development") {
              console.warn(`Failed to initialize Selectr for ${id}:`, error);
            }
          }
        }

        // Retry if elements are missing (DOM might not be fully ready yet)
        if (missingElements.length > 0 && retryCount < 10) {
          timeoutRef.current = setTimeout(() => {
            initializeSelectr(retryCount + 1);
          }, 100);
          return;
        }

        // If we initialized any, log for debugging
        if (initializedCount > 0 && process.env.NODE_ENV === "development") {
          console.log(`Selectr initialized ${initializedCount} dropdown(s)`);
        }
      };

      // Destroy existing instances first
      destroyExistingInstances();

      // Use multiple RAF + setTimeout to ensure React hydration and DOM updates are complete
      // This is critical for direct navigation to /leads
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            timeoutRef.current = setTimeout(() => {
              initializeSelectr();
            }, 150);
          });
        });
      });
    };

    // Start initialization check
    checkAndInit();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isMounted, selectrReady, pathname]);

  return (
    <>
      {/* Only load script if not already loaded from dashboard layout */}
      {shouldLoadScript && (
        <Script
          src="/assets/libs/mobius1-selectr/selectr.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            // Small delay to ensure script is fully loaded
            setTimeout(() => {
              setSelectrReady(true);
            }, 50);
          }}
          onError={() => {
            console.error("Failed to load Selectr script");
          }}
        />
      )}
    </>
  );
}
