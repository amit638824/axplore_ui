"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Client-only footer component to avoid hydration mismatch from Date.getFullYear()
 * (server and client can render different years around midnight).
 */
export default function DashboardFooter() {
  const [year, setYear] = useState<number | null>(null);

  useLayoutEffect(() => {
    // Only set year on client to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setYear(new Date().getFullYear());
  }, []);

  // Render placeholder during SSR/hydration, then update with actual year
  // Use suppressHydrationWarning since year changes after mount
  return (
    <footer className="footer text-center text-sm-start" suppressHydrationWarning>
      &copy; {year ?? "2025"} Axplore{" "}
      <span className="text-muted d-none d-sm-inline-block float-end">
        Crafted with <i className="mdi mdi-heart text-danger"></i> by HashTag Labs
      </span>
    </footer>
  );
}
