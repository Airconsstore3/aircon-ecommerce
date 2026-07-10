"use client";

import { Button } from "@/components/ui/button";

import { markWhatsAppSent } from "@/app/(shop)/checkout/actions";

export function WhatsAppButton({ orderId, whatsappUrl }: { orderId: string; whatsappUrl: string }) {
  const handleClick = async () => {
    const consent = window.localStorage.getItem("airconsstore_cookie_consent");

    if (consent === "accepted" && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT_CONVERSION_ID,
      });
    }

    await markWhatsAppSent(orderId);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button onClick={handleClick} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
      Open WhatsApp
    </Button>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
