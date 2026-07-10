"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_KEY = "airconsstore_cookie_consent";

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);

    if (stored === "accepted" || stored === "declined") {
      setConsent(stored);
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
    });
  }, []);

  const accept = () => {
    window.localStorage.setItem(CONSENT_KEY, "accepted");
    window.gtag?.("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    setConsent("accepted");
  };

  const decline = () => {
    window.localStorage.setItem(CONSENT_KEY, "declined");
    setConsent("declined");
  };

  return (
    <>
      {consent === "accepted" && process.env.NEXT_PUBLIC_GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`}
        </Script>
      )}

      {consent === "accepted" && process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
          </Script>
        </>
      )}

      {consent === null && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-3xl rounded-xl border bg-white p-4 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-700">
              We use optional analytics and advertising cookies only with your consent. Essential security cookies remain active.
            </p>
            <div className="flex gap-2">
              <button onClick={decline} className="rounded-lg border px-4 py-2 text-sm">Decline</button>
              <button onClick={accept} className="rounded-lg bg-[#1C99D6] px-4 py-2 text-sm text-white">Accept</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
