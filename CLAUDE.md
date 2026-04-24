# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo State

Pre-code. Only `NEXA-PRD.md` exists. No `package.json`, no scaffolding, no git yet. Everything below is the spec to build against — when scaffolding, match it exactly rather than picking alternatives.

**Always read `NEXA-PRD.md` before implementing.** It is the single source of truth. Reference feature IDs (`F-001`…`F-009`) in commits and PRs.

## Product

Nexa — multi-tenant SaaS hosting four Claude-powered agents (Trading, Music, Content, Life Coach) in one authenticated workspace. Each agent: isolated knowledge base (pgvector RAG), custom tools, streaming chat, per-user data.

## Stack (locked — do not substitute)

- **Monorepo:** Turborepo + pnpm workspaces
- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind, shadcn/ui, Vercel AI SDK (`ai` pkg) for streaming, TanStack Query, Zustand, Clerk (`@clerk/nextjs`), Recharts
- **Backend:** NestJS 10, Prisma 5, class-validator, `@nestjs/throttler`, `@nestjs/bull` + BullMQ, `@anthropic-ai/sdk`, `openai` (embeddings only), Multer, `pdf-parse`, `mammoth`
- **Data:** PostgreSQL 16 + pgvector, Redis 7, Cloudflare R2
- **Infra:** Vercel (web), Railway (api), Neon/Supabase (pg), Upstash (redis), Clerk, Stripe, Langfuse, Sentry, PostHog
- **Models:** `claude-opus-4-7` default for agents; OpenAI `text-embedding-3-small` (1536-dim) for embeddings

## Architecture

```
Next.js web ──HTTPS+SSE──▶ NestJS api ──▶ {Claude orchestrator, BullMQ workers, R2}
                                      └──▶ Postgres(pgvector) + Redis
```

**Agent loop** (`apps/api/src/modules/chat/claude-orchestrator.service.ts`): load history → pgvector RAG retrieval (filtered by `userId` AND `agentType`) → build prompt → stream Claude API with tools → on `tool_use` run tool → feed result back → loop (max 10 iterations) → persist messages + log to Langfuse.

**Streaming contract:** NestJS returns SSE with event types `message_start` | `content_delta` | `tool_use` | `tool_result` | `message_end`. Frontend consumes via Vercel AI SDK `useChat()`.

**Tool pattern:** every tool implements `ITool { name, description, inputSchema: JSONSchema, execute(input, ctx) }`. Register in a central `ToolRegistry`. Zod-validate inputs. Return structured JSON.

## Project Layout (target)

```
apps/web        Next.js 14 (app/(marketing), (auth), (dashboard)/agents/{trading,music,content,life-coach})
apps/api        NestJS (modules/{auth,users,agents/{trading,music,content,life-coach},chat,documents,billing,admin})
packages/types  Shared TS types
packages/validators  Shared Zod schemas
packages/config      Shared eslint/tsconfig/tailwind
```

Prisma schema lives at `apps/api/prisma/schema.prisma`. See PRD §8 for full schema — do not deviate.

## Non-negotiable constraints

- **Data isolation is P0.** Enable Postgres RLS on `Document`, `DocumentChunk`, `Message`, `Conversation`, `TradingStrategy`. R2 keys: `users/{userId}/agents/{agentType}/{fileId}.{ext}`. pgvector queries ALWAYS filter by `userId` AND `agentType`. No cross-user leakage, ever.
- **Trading agent must not fabricate numbers.** All P/L, win rate, drawdown, Sharpe come from the deterministic backtest engine. Claude only interprets results.
- **Tool-call cap: 10 iterations per message.** Prevent infinite loops.
- **RAG chunking:** 512 tokens, 64-token overlap. Embedding batch size 20. Retry failed jobs 3× with exponential backoff.
- **Auth:** Clerk owns passwords. Never store them. Admin check via `publicMetadata.role === 'admin'`. All protected routes validate Clerk JWT via NestJS guard.
- **Tier enforcement:** hard token cutoff when quota hit. Pricing in PRD §F-009.
- **LLM abstraction:** wrap Claude calls behind an interface (vendor-lock mitigation per PRD §18).

## Perf budgets

First-token <2s P95, API non-LLM <200ms P95, vector search <200ms P95, LCP <2.5s. Use prompt caching and Haiku fallback for simple tasks to keep costs bounded.

## Commands (will exist once scaffolded — not yet)

Planned: `pnpm dev` (turbo dev all), `pnpm --filter web dev`, `pnpm --filter api dev`, `pnpm --filter api prisma migrate dev`, `pnpm test` (Vitest), `pnpm test:e2e` (Playwright), `pnpm lint`. Docker compose for local Postgres+pgvector+Redis under `docker/`.

## Build order

Follow PRD §15 phases. Phase 1 scaffolding → Phase 2 agent core (orchestrator + SSE + RAG + file upload) → Phase 3 four agents (Trading → Content → Life Coach → Music) → Phase 4 billing/admin/observability → Phase 5 launch. Do not jump ahead; each phase is a deliverable gate.

## Open items (PRD §20)

Pricing tier confirmation, domain choice, market data provider (Alpha Vantage vs Polygon vs Yahoo), geo scope (GDPR impact), branding, beta pool. Flag new ambiguity as an Open Question rather than guessing.
