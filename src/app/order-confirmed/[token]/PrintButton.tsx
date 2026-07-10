"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="outline" className="rounded-lg" onClick={() => window.print()}>
      Print or save as PDF
    </Button>
  );
}
