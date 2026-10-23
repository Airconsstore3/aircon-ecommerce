"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.getElementById("scroll-root");
    if (!root) return;
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    root.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
