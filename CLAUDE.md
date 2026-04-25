# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth

Always read `NEXA-PRD.md` before implementing — it is the canonical spec. Reference feature IDs (`F-001`…`F-009`) in commits and PRs. `docs/ARCHITECTURE.md` and `docs/API.md` expand on the runtime; `docs/DEPLOYMENT.md` covers Vercel/Railway/Neon/Upstash.

## Product

Nexa — multi-tenant SaaS hosting four Claude-powered agents (Trading, Music, Content, Life Coach) in one authenticated workspace. Each agent: isolated knowledge base (pgvector RAG), custom tools, streaming chat, per-user data.

## Stack (locked — do not substitute)

- **Monorepo:** Turborepo + pnpm workspaces (`pnpm@9.6.0`, Node `>=20.11`)
- **Web (`apps/web`, `@nexa/web`):** Next.js 14 App Router, React 18, TypeScript, Tailwind, shadcn/ui (Radix), Vercel AI SDK (`ai`), TanStack Query, Zustand, Clerk (`@clerk/nextjs`), Recharts, Framer Motion
- **API (`apps/api`, `@nexa/api`):** NestJS 10, Prisma 5, class-validator, `@nestjs/throttler`, `@nestjs/bullmq` + BullMQ, `@anthropic-ai/sdk`, `openai` (embeddings only), Multer, `pdf-parse`, `mammoth`, Langfuse, Sentry
- **Shared packages:** `@nexa/types`, `@nexa/validators` (Zod), `@nexa/config` (eslint/tsconfig/tailwind)
- **Data:** PostgreSQL 16 + pgvector, Redis 7, Cloudflare R2
- **Models:** `claude-opus-4-7` default for agents; OpenAI `text-embedding-3-small` (1536-dim) for embeddings

## Commands

Run from repo root unless stated otherwise. Workspace filters use the package name (`@nexa/api`, `@nexa/web`), not the directory.

| Command                                                     | Purpose                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                                                  | Turbo runs web + api concurrently                             |
| `pnpm --filter @nexa/web dev`                               | Next.js only (port **3002**)                                  |
| `pnpm --filter @nexa/api dev`                               | NestJS only (port **3001**, base path `/api/v1`)              |
| `pnpm build` / `pnpm typecheck` / `pnpm lint` / `pnpm test` | Turbo across all workspaces                                   |
| `pnpm test:e2e`                                             | Playwright (web) + Vitest e2e (api)                           |
| `pnpm verify`                                               | `typecheck lint test build` — run before declaring work done  |
| `pnpm format` / `pnpm format:check`                         | Prettier                                                      |
| `pnpm db:up` / `pnpm db:down` / `pnpm db:logs`              | Local Postgres+pgvector+Redis via `docker/docker-compose.yml` |
| `pnpm db:migrate`                                           | `prisma migrate dev` (proxies to `@nexa/api`)                 |
| `pnpm db:seed`                                              | Seed default agent rows                                       |
| `pnpm --filter @nexa/api prisma:studio`                     | Prisma Studio                                                 |
| `pnpm --filter @nexa/api test:watch`                        | Vitest watch for the api                                      |

Single test (Vitest): `pnpm --filter @nexa/api test -- path/to/file.spec.ts -t "case name"`. Single Playwright spec: `pnpm --filter @nexa/web exec playwright test path/to/spec.ts`.

Local Docker maps **host 55432→pg, host 56379→redis** (avoids host clashes). Local `DATABASE_URL`/`REDIS_URL` must point at those host ports, not 5432/6379.

## Architecture

```
Next.js web ──HTTPS+SSE──▶ NestJS api ──▶ {Claude orchestrator, BullMQ workers, R2}
                                      └──▶ Postgres(pgvector) + Redis
```

**Agent loop** (`apps/api/src/modules/chat/claude-orchestrator.service.ts`): load history → pgvector RAG retrieval (filtered by `userId` AND `agentType`) → build prompt → stream Claude API with tools → on `tool_use` run tool → feed result back → loop (max 10 iterations) → persist messages + log to Langfuse.

**Streaming contract:** NestJS returns SSE with event types `message_start` | `content_delta` | `tool_use` | `tool_result` | `message_end`. Frontend consumes via Vercel AI SDK `useChat()`.

**Tool pattern:** every tool implements `ITool { name, description, inputSchema, execute(input, ctx) }` from `apps/api/src/shared/tools/tool.interface.ts`. Each agent module registers its tools in `ToolRegistry.onModuleInit` (`shared/tools/tool-registry.service.ts`). Zod schemas → JSON Schema via `zod-to-json-schema.ts`. Tools return structured JSON; Claude narrates.

## Layout (actual)

```
apps/
  web/                   Next.js — app/(marketing|auth|dashboard), components, lib, sentry.* configs
  api/
    prisma/              schema.prisma, rls.sql, seed.ts, migrations/
    src/
      modules/{auth,users,agents/{trading,music,content,life-coach},chat,documents,billing,admin}
      shared/{claude,observability,prisma,rag,redis,storage,tools}
      common/{decorators,filters,guards}
      config/, app.module.ts, main.ts
packages/
  types/                 Shared TS types (built — has dist/)
  validators/            Shared Zod schemas (built — has dist/)
  config/                Shared eslint/tsconfig/tailwind presets
docker/                  docker-compose.yml + postgres-init/
docs/                    ARCHITECTURE.md, API.md, DEPLOYMENT.md
```

`packages/types` and `packages/validators` build to `dist/` — Turbo `^build` ensures they compile before the apps consume them. If types-only edits don't show up, re-run the package build.

## Non-negotiable constraints

- **Data isolation is P0.** Postgres RLS is enforced via `apps/api/prisma/rls.sql` on `Document`, `DocumentChunk`, `Message`, `Conversation`, `TradingStrategy`. R2 keys: `users/{userId}/agents/{agentType}/{fileId}.{ext}`. pgvector queries ALWAYS filter by `userId` AND `agentType`. No cross-user leakage, ever.
- **Trading agent must not fabricate numbers.** All P/L, win rate, drawdown, Sharpe come from the deterministic `BacktestEngine` in `apps/api/src/modules/agents/trading/backtest/`. Claude only interprets results.
- **Tool-call cap: 10 iterations per message.** Prevent infinite loops.
- **RAG chunking:** 512 tokens, 64-token overlap. Embedding batch size 20. Retry failed jobs 3× with exponential backoff.
- **Auth:** Clerk owns passwords. Never store them. Admin check via `publicMetadata.role === 'admin'`. All protected routes validate Clerk JWT via NestJS guard (`common/guards`).
- **Tier enforcement:** hard token cutoff when quota hit (`modules/chat/usage.service.ts`). Pricing in PRD §F-009.
- **LLM abstraction:** wrap Claude calls behind `shared/claude/` interface (vendor-lock mitigation per PRD §18).
- **TRADING CSVs skip RAG.** `DocumentProcessor` (`modules/documents/document.processor.ts`) short-circuits when `agentType === 'TRADING' && mimeType === 'text/csv'` — we need raw bars, not embeddings.

## Perf budgets

First-token <2s P95, API non-LLM <200ms P95, vector search <200ms P95, LCP <2.5s. Use prompt caching and Haiku fallback for simple tasks to keep costs bounded.

## Build order

PRD §15 phases: Phase 1 scaffolding → Phase 2 agent core (orchestrator + SSE + RAG + file upload) → Phase 3 four agents (Trading → Content → Life Coach → Music) → Phase 4 billing/admin/observability → Phase 5 launch. Each phase is a deliverable gate. Phase 3 agents follow the `apps/api/src/modules/agents/<agent>/` pattern: `<agent>.service.ts`, `<agent>.controller.ts`, `tools/` (one file per tool implementing `ITool`), `<agent>.module.ts` wiring + `registry.register()` on bootstrap.

## Deterministic invariants (Phase 3+)

- **Trading agent:** metrics come from `BacktestEngine`. The six trading tools return structured JSON; Claude narrates only. Rule DSL: `RuleGroup { combinator: 'all'|'any', conditions: Condition[] }` over `{sma, ema, rsi, price, return}` indicators. One symbol, long-only, fills at close, flat `perTradePct` fees. CSV parser accepts `date|time|timestamp, open, high, low, close[, volume]` (any order, ISO/unix).

## Open items (PRD §20)

Pricing tier confirmation, domain choice, market data provider (Alpha Vantage vs Polygon vs Yahoo), geo scope (GDPR impact), branding, beta pool. Flag new ambiguity as an Open Question rather than guessing.
