"use client";

import { useEffect } from "react";

async function sha256(value: string) {
  const normalized = value.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function LeadTracking({ value, email, phone, itemIds }: { value: number; email: string | null; phone: string | null; itemIds: string[] }) {
  useEffect(() => {
    async function track() {
      const consent = window.localStorage.getItem("airconsstore_cookie_consent");

      if (consent !== "accepted" || !window.gtag) {
        return;
      }

      const enhancedData: Record<string, string> = {};

      if (email) {
        enhancedData.sha256_email_address = await sha256(email);
      }

      if (phone) {
        enhancedData.sha256_phone_number = await sha256(phone);
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "generate_lead",
        value,
        currency: "ZAR",
        item_ids: itemIds,
        enhanced_conversion_data: enhancedData,
      });

      window.gtag("event", "generate_lead", {
        value,
        currency: "ZAR",
        items: itemIds.map((id) => ({ item_id: id })),
        ...enhancedData,
      });
    }

    track();
  }, [email, itemIds, phone, value]);

  return null;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
