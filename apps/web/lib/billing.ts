const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface PlanRow {
  plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
  limits: {
    tokensPerMonth: number;
    maxAgents: number;
    maxFiles: number;
    priceUsd: number;
  };
  priceId: string | null;
}

export interface UsageRow {
  plan: PlanRow['plan'];
  limits: PlanRow['limits'];
  tokensUsed: number;
  tokensLimit: number;
  allowed: boolean;
}

export const billingApi = {
  async plans(): Promise<PlanRow[]> {
    const r = await fetch(`${API}/billing/plans`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json();
  },
  async usage(token: string): Promise<UsageRow> {
    const r = await fetch(`${API}/billing/usage`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json();
  },
  async checkout(
    token: string,
    body: { plan: Exclude<PlanRow['plan'], 'FREE'>; successUrl: string; cancelUrl: string },
  ): Promise<{ url: string }> {
    const r = await fetch(`${API}/billing/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json();
  },
  async portal(token: string, returnUrl: string): Promise<{ url: string }> {
    const r = await fetch(`${API}/billing/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ returnUrl }),
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json();
  },
};
