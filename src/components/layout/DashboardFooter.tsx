"use client";

import { useLayoutEffect, useState } from "react";

export default function DashboardFooter() {
  const [year, setYear] = useState<number | null>(null);

  useLayoutEffect(() => {

    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="footer text-center text-sm-start" suppressHydrationWarning>
      &copy; {year ?? "2025"} Axplore{" "}
      <span className="text-muted d-none d-sm-inline-block float-end">
        Crafted with <i className="mdi mdi-heart text-danger"></i> by HashTag Labs
      </span>
    </footer>
  );
}
