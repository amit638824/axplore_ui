"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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
  "#fromSelectCity",
  "#toCity",
  "#fromSelectCity1",
  "#toCity1",
  "#fromSelectCity2",
  "#toCity2",
  "#fromSelectCity3",
  "#toCity3",
];

export default function LeadsScripts() {
  const [selectrReady, setSelectrReady] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!selectrReady || initializedRef.current) return;
    if (typeof window === "undefined") return;
    if (!window.Selectr) return;

    // Initialize only if element exists (avoid runtime errors).
    for (const id of SELECTR_IDS) {
      const el = document.querySelector(id);
      if (!el) continue;
      try {
        // eslint-disable-next-line no-new
        new window.Selectr(id);
      } catch {
        // ignore duplicate init or missing element edge cases
      }
    }

    initializedRef.current = true;
  }, [selectrReady]);

  return (
    <>
      <Script
        src="/assets/libs/mobius1-selectr/selectr.min.js"
        strategy="afterInteractive"
        onLoad={() => setSelectrReady(true)}
      />
    </>
  );
}

