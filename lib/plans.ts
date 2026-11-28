// Single source of truth for plan limits, prices and Paddle price IDs.
// Price IDs come from env so sandbox and live accounts can be swapped without code changes.

export type PlanId = "free" | "starter" | "growth" | "agency";

export const PLANS: Record<
  PlanId,
  { name: string; price: number; messages: number; chatbots: number }
> = {
  free: { name: "Free", price: 0, messages: 50, chatbots: 1 },
  starter: { name: "Starter", price: 19, messages: 1000, chatbots: 3 },
  growth: { name: "Growth", price: 49, messages: 5000, chatbots: 10 },
  agency: { name: "Agency", price: 99, messages: 15000, chatbots: Infinity },
};

export const PADDLE_PRICE_IDS: Partial<Record<PlanId, string>> = {
  starter: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER,
  growth: process.env.NEXT_PUBLIC_PADDLE_PRICE_GROWTH,
  agency: process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY,
};

export function planFromPriceId(priceId: string | undefined): PlanId | null {
  if (!priceId) return null;
  const match = (
    Object.entries(PADDLE_PRICE_IDS) as [PlanId, string | undefined][]
  ).find(([, id]) => id === priceId);
  return match ? match[0] : null;
}

export function getPlan(plan: string | null | undefined) {
  return PLANS[(plan as PlanId) in PLANS ? (plan as PlanId) : "free"];
}
