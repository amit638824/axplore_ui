"use client";

import Script from "next/script";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    ApexCharts?: new (
      element: HTMLElement | string | null,
      options: unknown,
    ) => {
      render: () => void;
      destroy: () => void;
    };
  }
}


/**
 * Client-only component that initializes ApexCharts on the dashboard.
 * Handles re-initialization on navigation to ensure charts render correctly.
 */
export default function ApexChartsInitializer() {
  const pathname = usePathname();
  const [apexReady, setApexReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldLoadScript, setShouldLoadScript] = useState(true);
  const chartsRef = useRef<Map<string, { destroy: () => void }>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mount state - only runs on client
  useLayoutEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Destroy all charts on unmount
      const charts = chartsRef.current;
      charts.forEach((chart) => {
        try {
          chart.destroy();
        } catch {
          // ignore
        }
      });
      charts.clear();
    };
  }, []);

  // Check if ApexCharts script is already loaded (from dashboard layout) - check periodically
  useEffect(() => {
    const checkApex = () => {
      if (typeof window !== "undefined" && window.ApexCharts && !apexReady) {
        setApexReady(true);
        setShouldLoadScript(false);
      }
    };

    // Check immediately
    checkApex();

    // Also check periodically in case script loads after component mounts
    const interval = setInterval(() => {
      checkApex();
    }, 100);

    return () => clearInterval(interval);
  }, [apexReady]);

  // Initialize ApexCharts when script loads and component mounts
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    // Only initialize on /dashboard route
    const isDashboardRoute =
      pathname === "/dashboard" || pathname?.startsWith("/dashboard/");
    if (!isDashboardRoute) {
      return;
    }

    // Wait for ApexCharts to be available (either from script load or already loaded)
    const checkAndInit = (attempt = 0) => {
      if (!window.ApexCharts) {
        // Retry if ApexCharts not yet loaded (script might still be loading)
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

      // Destroy existing charts when navigating to /dashboard
      const destroyExistingCharts = () => {
        chartsRef.current.forEach((chart) => {
          try {
            chart.destroy();
          } catch {
            // ignore
          }
        });
        chartsRef.current.clear();
      };

      // Initialize ApexCharts instances with retry logic
      const initializeCharts = (retryCount = 0) => {
        if (!window.ApexCharts) return;

        let initializedCount = 0;
        const missingElements: string[] = [];

        // Chart 1: #crm-dash (area chart)
        const crmDashEl = document.querySelector("#crm-dash") as HTMLElement | null;
        if (!crmDashEl) {
          missingElements.push("#crm-dash");
        } else {
          try {
            // Destroy existing chart if any
            const existingChart = chartsRef.current.get("#crm-dash");
            if (existingChart) {
              try {
                existingChart.destroy();
              } catch {
                // ignore
              }
            }

            // Verify element is actually in the DOM
            if (!crmDashEl.parentNode) {
              missingElements.push("#crm-dash");
            } else {
              const options1 = {
                chart: {
                  height: 320,
                  type: "area",
                  width: "100%",
                  stacked: true,
                  toolbar: { show: false, autoSelected: "zoom" },
                },
                colors: ["#2a77f4", "#a5c2f1"],
                dataLabels: { enabled: false },
                stroke: {
                  curve: "smooth",
                  width: [1.5, 1.5],
                  dashArray: [0, 4],
                  lineCap: "round",
                },
                grid: { padding: { left: 0, right: 0 }, strokeDashArray: 3 },
                markers: { size: 0, hover: { size: 0 } },
                series: [
                  {
                    name: "New Visits",
                    data: [0, 60, 20, 90, 45, 110, 55, 130, 44, 110, 75, 120],
                  },
                  {
                    name: "Unique Visits",
                    data: [0, 45, 10, 75, 35, 94, 40, 115, 30, 105, 65, 110],
                  },
                ],
                xaxis: {
                  type: "month",
                  categories: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  axisBorder: { show: true },
                  axisTicks: { show: true },
                },
                fill: {
                  type: "gradient",
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.3,
                    stops: [0, 90, 100],
                  },
                },
                tooltip: { x: { format: "dd/MM/yy HH:mm" } },
                legend: { position: "top", horizontalAlign: "right" },
              };

              // Pass the actual DOM element instead of selector string
              const chart1 = new window.ApexCharts(crmDashEl, options1);
              chart1.render();
              chartsRef.current.set("#crm-dash", chart1);
              initializedCount++;
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn(`Failed to initialize chart #crm-dash:`, error);
            }
          }
        }

        // Chart 2: #email_report (donut chart)
        const emailReportEl = document.querySelector("#email_report") as HTMLElement | null;
        if (!emailReportEl) {
          missingElements.push("#email_report");
        } else {
          try {
            // Destroy existing chart if any
            const existingChart = chartsRef.current.get("#email_report");
            if (existingChart) {
              try {
                existingChart.destroy();
              } catch {
                // ignore
              }
            }

            // Verify element is actually in the DOM
            if (!emailReportEl.parentNode) {
              missingElements.push("#email_report");
            } else {
              const options2 = {
                chart: { height: 205, type: "donut" },
                plotOptions: {
                  pie: {
                    donut: {
                      size: "85%",
                    },
                  },
                },
                dataLabels: { enabled: false },
                stroke: {
                  show: true,
                  width: 2,
                  colors: ["transparent"],
                },
                series: [10, 65, 25],
                legend: {
                  show: false,
                  position: "bottom",
                  horizontalAlign: "center",
                  verticalAlign: "middle",
                  floating: false,
                  fontSize: "14px",
                  offsetX: 0,
                  offsetY: 5,
                },
                labels: ["Sent", "Opened", "Not Opened"],
                colors: ["#fdb5c8", "#2a76f4", "#67c8ff"],
                responsive: [
                  {
                    breakpoint: 600,
                    options: {
                      plotOptions: {
                        donut: {
                          customScale: 0.2,
                        },
                      },
                      chart: { height: 200 },
                      legend: { show: false },
                    },
                  },
                ],
                tooltip: {
                  y: {
                    formatter: function (val: number) {
                      return val + " %";
                    },
                  },
                },
              };

              // Pass the actual DOM element instead of selector string
              const chart2 = new window.ApexCharts(emailReportEl, options2);
              chart2.render();
              chartsRef.current.set("#email_report", chart2);
              initializedCount++;
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn(`Failed to initialize chart #email_report:`, error);
            }
          }
        }

        // Retry if elements are missing (DOM might not be fully ready yet)
        if (missingElements.length > 0 && retryCount < 10) {
          timeoutRef.current = setTimeout(() => {
            initializeCharts(retryCount + 1);
          }, 100);
          return;
        }

        // If we initialized any, log for debugging
        if (initializedCount > 0 && process.env.NODE_ENV === "development") {
          console.log(`ApexCharts initialized ${initializedCount} chart(s)`);
        }
      };

      // Destroy existing charts first
      destroyExistingCharts();

      // Use multiple RAF + setTimeout to ensure React hydration and DOM updates are complete
      // This is critical for direct navigation to /dashboard
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            timeoutRef.current = setTimeout(() => {
              initializeCharts();
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
  }, [isMounted, apexReady, pathname]);

  return (
    <>
      {/* Only load script if not already loaded from dashboard layout */}
      {shouldLoadScript && (
        <Script
          src="/assets/libs/apexcharts/apexcharts.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            // Small delay to ensure script is fully loaded
            setTimeout(() => {
              setApexReady(true);
            }, 50);
          }}
          onError={() => {
            console.error("Failed to load ApexCharts script");
          }}
        />
      )}
    </>
  );
}
