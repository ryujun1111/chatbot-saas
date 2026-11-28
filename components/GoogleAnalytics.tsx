"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// GA4 is only loaded when a real measurement ID is configured
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
};

// Conversion: completed checkout
export const trackPurchase = (plan: string, value: number) => {
  trackEvent("purchase", {
    transaction_id: Date.now().toString(),
    value,
    currency: "USD",
    items: [
      {
        item_name: plan,
        item_category: "subscription",
        price: value,
        quantity: 1,
      },
    ],
  });
};

// Conversion: account created
export const trackSignup = (method: string = "email") => {
  trackEvent("sign_up", { method });
};

export const trackSelectPlan = (plan: string, value: number) => {
  trackEvent("select_item", {
    item_list_name: "pricing_plans",
    items: [{ item_name: plan, price: value }],
  });
};
