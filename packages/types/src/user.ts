export const PLANS = ['FREE', 'STARTER', 'PRO', 'BUSINESS'] as const;
export type Plan = (typeof PLANS)[number];

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanLimits {
  tokensPerMonth: number;
  maxAgents: number;
  maxFiles: number;
  priceUsd: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { tokensPerMonth: 100_000, maxAgents: 1, maxFiles: 10, priceUsd: 0 },
  STARTER: { tokensPerMonth: 1_000_000, maxAgents: 2, maxFiles: 50, priceUsd: 19 },
  PRO: { tokensPerMonth: 5_000_000, maxAgents: 4, maxFiles: 500, priceUsd: 49 },
  BUSINESS: {
    tokensPerMonth: 20_000_000,
    maxAgents: 4,
    maxFiles: Number.POSITIVE_INFINITY,
    priceUsd: 149,
  },
};
