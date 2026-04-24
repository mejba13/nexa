# Nexa

> **One platform. Infinite intelligence.**
> A multi-agent AI platform powered by Claude — four specialized autonomous agents (Trading, Music, Content, Life Coach) in one unified workspace.

**Status:** Phase 1 — Foundation (Weeks 1–2)
**Source of truth:** [`NEXA-PRD.md`](./NEXA-PRD.md)
**Developer:** [Engr. Mejba Ahmed](https://www.mejba.me/)

---

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Web:** Next.js 14 (App Router), React 18, TypeScript, Tailwind, shadcn/ui, Vercel AI SDK, Clerk
- **API:** NestJS 10, Prisma 5, PostgreSQL 16 + pgvector, Redis 7, BullMQ, `@anthropic-ai/sdk`
- **Storage:** Cloudflare R2
- **Observability:** Langfuse + Sentry + PostHog
- **Billing:** Stripe

See PRD §7 for exact package versions — do not substitute.

---

## Quickstart

### Prerequisites

- Node.js `>=20.11` (we pin `22.13.0` in `.nvmrc`)
- pnpm `>=9.0`
- Docker + Docker Compose
- A Clerk dev instance, Anthropic API key, OpenAI API key (embeddings only)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in secrets
cp .env.example .env
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env

# 3. Start Postgres (with pgvector) + Redis
pnpm db:up

# 4. Generate Prisma client and apply migrations
pnpm db:migrate

# 5. (Optional) seed default agent rows
pnpm db:seed

# 6. Run both apps in dev
pnpm dev
```

The web app boots at `http://localhost:3000` and the API at `http://localhost:3001/api/v1`.

### Common Scripts

| Command                  | What it does                              |
| ------------------------ | ----------------------------------------- |
| `pnpm dev`               | Run web + api concurrently via Turbo      |
| `pnpm --filter web dev`  | Run only the Next.js app                  |
| `pnpm --filter api dev`  | Run only the NestJS api                   |
| `pnpm build`             | Build every workspace                     |
| `pnpm lint`              | ESLint across all packages                |
| `pnpm typecheck`         | TypeScript `--noEmit` across all packages |
| `pnpm test`              | Vitest unit tests                         |
| `pnpm test:e2e`          | Playwright end-to-end tests               |
| `pnpm format`            | Prettier write                            |
| `pnpm db:up` / `db:down` | Start/stop local Postgres+pgvector+Redis  |
| `pnpm db:migrate`        | `prisma migrate dev`                      |
| `pnpm db:seed`           | Seed default agents                       |

---

## Repository Layout

```
nexa/
├── apps/
│   ├── web/              # Next.js 14 (App Router)
│   └── api/              # NestJS + Prisma
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── validators/       # Shared Zod schemas
│   └── config/           # Shared ESLint / TS / Tailwind presets
├── docker/               # docker-compose for local pg+pgvector+redis
├── .github/workflows/    # CI
├── NEXA-PRD.md           # Product requirements (source of truth)
├── CLAUDE.md             # Guidance for Claude Code sessions
└── turbo.json
```

Full structure spec lives in PRD §14.

---

## Environment Variables

All keys ship in [`.env.example`](./.env.example). Secrets split across:

- Shared infra (`DATABASE_URL`, `REDIS_URL`)
- Auth (`CLERK_*`)
- LLM providers (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`)
- Storage (`R2_*`)
- Billing (`STRIPE_*`)
- Observability (`LANGFUSE_*`, `SENTRY_DSN`, `POSTHOG_KEY`)
- External APIs (`SPOTIFY_*`, `FREESOUND_API_KEY`)

Never commit a real `.env`. Production secrets live in Vercel (web) and Railway (api).

---

## Working Protocol

- **Feature IDs** in every commit and PR: `feat(F-005): stream Claude responses via SSE`
- **RLS is non-negotiable** — see PRD §12. All user-owned tables filter by `userId` (+ `agentType` where applicable) at the DB layer.
- **No fabricated trading numbers** — Trading agent metrics come from the deterministic backtest engine only (PRD §5, §18).
- **Tool-call cap:** 10 iterations per message (PRD §F-005).
- **Type-share** via `@nexa/types`; validate shared DTOs via `@nexa/validators` (Zod).
- Read [`CLAUDE.md`](./CLAUDE.md) and [`NEXA-PRD.md`](./NEXA-PRD.md) before making architectural decisions.

---

## Roadmap

| Phase | Weeks | Deliverable                                              |
| ----- | ----- | -------------------------------------------------------- |
| 1     | 1–2   | Monorepo + auth + skeleton (current)                     |
| 2     | 3–4   | Claude orchestrator + SSE + RAG + file upload            |
| 3     | 5–9   | Four agents (Trading → Content → Life Coach → Music)     |
| 4     | 10–12 | Billing, admin, observability, perf + security hardening |
| 5     | 13–14 | Private beta → public launch                             |

Detailed breakdown: PRD §15.

---

## License

Proprietary. All rights reserved © Engr. Mejba Ahmed.
