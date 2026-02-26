"use client";

import Script from "next/script";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    simpleDatatables?: {
      DataTable: new (
        element: string | HTMLElement,
        options?: unknown,
      ) => {
        destroy: () => void;
        export: (options: {
          type: string;
          download?: boolean;
          lineDelimiter?: string;
          columnDelimiter?: string;
        }) => void;
      };
    };
  }
}

/**
 * Client-only component that initializes Simple DataTables on the lead-list page.
 * Handles re-initialization on navigation to ensure data table works correctly.
 */
export default function DataTableInitializer() {
  const pathname = usePathname();
  const [datatableReady, setDatatableReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldLoadScript, setShouldLoadScript] = useState(true);
  const dataTableRef = useRef<{
    destroy: () => void;
    export: (options: {
      type: string;
      download?: boolean;
      lineDelimiter?: string;
      columnDelimiter?: string;
    }) => void;
  } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mount state - only runs on client
  useLayoutEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Destroy data table on unmount
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
        } catch {
          // ignore
        }
        dataTableRef.current = null;
      }
    };
  }, []);

  // Check if Simple DataTables script is already loaded (from dashboard layout) - check periodically
  useEffect(() => {
    const checkDataTable = () => {
      if (
        typeof window !== "undefined" &&
        window.simpleDatatables &&
        !datatableReady
      ) {
        setDatatableReady(true);
        setShouldLoadScript(false);
      }
    };

    // Check immediately
    checkDataTable();

    // Also check periodically in case script loads after component mounts
    const interval = setInterval(() => {
      checkDataTable();
    }, 100);

    return () => clearInterval(interval);
  }, [datatableReady]);

  // Initialize DataTable when script loads and component mounts
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    // Initialize on /lead-list or /leads (lead list is now inside leads page)
    const isLeadListRoute =
      pathname === "/lead-list" || pathname?.startsWith("/lead-list/");
    const isLeadsRoute =
      pathname === "/leads" || pathname?.startsWith("/leads/");
    if (!isLeadListRoute && !isLeadsRoute) {
      return;
    }

    // Wait for Simple DataTables to be available (either from script load or already loaded)
    const checkAndInit = (attempt = 0) => {
      if (!window.simpleDatatables) {
        // Retry if Simple DataTables not yet loaded (script might still be loading)
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

      // Destroy existing data table when navigating to /lead-list
      const destroyExistingDataTable = () => {
        const tableElement = document.querySelector("#datatable_2");
        if (tableElement) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const existingInstance = (tableElement as any).datatable;
          if (existingInstance && typeof existingInstance.destroy === "function") {
            try {
              existingInstance.destroy();
            } catch {
              // ignore
            }
          }
        }
        dataTableRef.current = null;
      };

      // Initialize DataTable with retry logic
      const initializeDataTable = (retryCount = 0) => {
        if (!window.simpleDatatables) return;

        const tableElement = document.querySelector("#datatable_2") as HTMLElement | null;
        if (!tableElement) {
          // Retry if element not found (DOM might not be fully ready yet)
          if (retryCount < 10) {
            timeoutRef.current = setTimeout(() => {
              initializeDataTable(retryCount + 1);
            }, 100);
          }
          return;
        }

        // Only init when leads have finished loading (avoids broken UI after login)
        if (tableElement.getAttribute("data-table-ready") !== "true") {
          if (retryCount < 30) {
            timeoutRef.current = setTimeout(() => {
              initializeDataTable(retryCount + 1);
            }, 150);
          }
          return;
        }

        // Skip when using server-side pagination (lead list uses its own pagination)
        if (tableElement.getAttribute("data-pagination") === "server") {
          return;
        }

        // Verify element is actually in the DOM
        if (!tableElement.parentNode) {
          if (retryCount < 10) {
            timeoutRef.current = setTimeout(() => {
              initializeDataTable(retryCount + 1);
            }, 100);
          }
          return;
        }

        // Check if already initialized
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((tableElement as any).datatable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dataTableRef.current = (tableElement as any).datatable;
          return;
        }

        try {
          const dataTable = new window.simpleDatatables.DataTable("#datatable_2", {
            searchable: true,
            sortable: true,
            perPage: 10,
            perPageSelect: [5, 10, 15, 20, 25],
            labels: {
              placeholder: "Search...",
              perPage: "{select} entries per page",
              noRows: "No entries found",
              info: "Showing {start} to {end} of {rows} entries",
            },
          });

          // Store reference
          dataTableRef.current = dataTable;

          // Setup export buttons with proper cleanup
          const csvButton = document.querySelector("button.csv");
          if (csvButton) {
            // Remove existing listeners by cloning (avoids duplicate listeners)
            const csvHandler = () => {
              dataTable.export({
                type: "csv",
                download: true,
                lineDelimiter: "\n\n",
                columnDelimiter: ";",
              });
            };
            // Clone to remove old listeners
            const newCsvButton = csvButton.cloneNode(true) as HTMLButtonElement;
            csvButton.parentNode?.replaceChild(newCsvButton, csvButton);
            newCsvButton.addEventListener("click", csvHandler);
          }

          const pdfButton = document.querySelector("button.pdf");
          if (pdfButton) {
            // Remove existing listeners by cloning (avoids duplicate listeners)
            const pdfHandler = () => {
              dataTable.export({
                type: "pdf",
                download: true,
              });
            };
            // Clone to remove old listeners
            const newPdfButton = pdfButton.cloneNode(true) as HTMLButtonElement;
            pdfButton.parentNode?.replaceChild(newPdfButton, pdfButton);
            newPdfButton.addEventListener("click", pdfHandler);
          }

          if (process.env.NODE_ENV === "development") {
            console.log("Simple DataTables initialized successfully");
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to initialize Simple DataTables:", error);
          }
        }
      };

      // Destroy existing instance first
      destroyExistingDataTable();

      // Use multiple RAF + setTimeout to ensure React hydration and DOM updates are complete
      // This is critical for direct navigation to /lead-list
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            timeoutRef.current = setTimeout(() => {
              initializeDataTable();
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
  }, [isMounted, datatableReady, pathname]);

  return (
    <>
      {/* Only load script if not already loaded from dashboard layout */}
      {shouldLoadScript && (
        <Script
          src="/assets/libs/simple-datatables/umd/simple-datatables.js"
          strategy="afterInteractive"
          onLoad={() => {
            // Small delay to ensure script is fully loaded
            setTimeout(() => {
              setDatatableReady(true);
            }, 50);
          }}
          onError={() => {
            console.error("Failed to load Simple DataTables script");
          }}
        />
      )}
    </>
  );
}
