"use client";

import { usePathname } from "next/navigation";

// Hides the marketing footer on checkout to keep the page focused.
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/checkout") return null;
  return <>{children}</>;
}
