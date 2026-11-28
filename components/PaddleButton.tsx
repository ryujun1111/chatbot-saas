"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackSelectPlan, trackPurchase } from "@/components/GoogleAnalytics";
import { createClient } from "@/lib/supabase/client";
import { PLANS, PADDLE_PRICE_IDS, type PlanId } from "@/lib/plans";

declare global {
  interface Window {
    Paddle?: any;
    __paddleReady?: boolean;
  }
}

interface PaddleButtonProps {
  plan: Exclude<PlanId, "free">;
  children: React.ReactNode;
  className?: string;
}

// Opens Paddle checkout for the logged-in user. The user id travels in customData so the
// webhook can grant the plan; the plan itself is derived server-side from the price id.
export default function PaddleButton({
  plan,
  children,
  className,
}: PaddleButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    trackSelectPlan(PLANS[plan].name, PLANS[plan].price);

    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      router.push(`/signup?plan=${plan}`);
      return;
    }

    const priceId = PADDLE_PRICE_IDS[plan];
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!priceId || !token || !window.Paddle) {
      setError("Checkout is not available right now. Please try again later.");
      return;
    }

    // Initialise Paddle.js once per page load
    if (!window.__paddleReady) {
      if (process.env.NEXT_PUBLIC_PADDLE_ENV !== "production")
        window.Paddle.Environment.set("sandbox");
      window.Paddle.Initialize({
        token,
        eventCallback: (event: any) => {
          if (event?.name === "checkout.completed") {
            const item = event.data?.items?.[0];
            trackPurchase(
              item?.product?.name || "subscription",
              Number(event.data?.totals?.total ?? 0),
            );
          }
        },
      });
      window.__paddleReady = true;
    }

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: user.email },
      customData: { user_id: user.id },
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: `${window.location.origin}/dashboard/settings?tab=billing&checkout=success`,
      },
    });
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </>
  );
}
