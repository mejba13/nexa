const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface AdminUserRow {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
  createdAt: string;
}

export interface AdminUsersPage {
  items: AdminUserRow[];
  nextCursor: string | null;
}

export interface PlatformStats {
  windowDays: number;
  totalUsers: number;
  paidUsers: number;
  dauApprox: number;
  conversations30d: number;
  tokensInput30d: number;
  tokensOutput30d: number;
  costUsd30d: string;
}

export interface AgentUsageRow {
  agentType: 'TRADING' | 'MUSIC' | 'CONTENT' | 'LIFE_COACH';
  calls: number;
  tokensInput: number;
  tokensOutput: number;
  costUsd: string;
}

async function authed<T>(path: string, token: string): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`Admin API ${r.status}`);
  return r.json();
}

export const adminApi = {
  listUsers: (token: string, search?: string, cursor?: string) =>
    authed<AdminUsersPage>(
      `/admin/users${
        new URLSearchParams({
          ...(search ? { q: search } : {}),
          ...(cursor ? { cursor } : {}),
        }).toString().length
          ? '?' +
            new URLSearchParams({
              ...(search ? { q: search } : {}),
              ...(cursor ? { cursor } : {}),
            }).toString()
          : ''
      }`,
      token,
    ),
  stats: (token: string) => authed<PlatformStats>('/admin/stats', token),
  agentUsage: (token: string) => authed<AgentUsageRow[]>('/admin/agents/usage', token),
};
