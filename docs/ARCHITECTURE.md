# Nexa — Architecture

> 5-minute orientation for any engineer joining mid-build. The PRD is the spec; this is the map of how the spec was implemented.

---

## Top-level shape

```
           ┌────────────────────────┐
  Browser ─┤ apps/web (Next.js 14)  ├─ Vercel
           └──────────┬─────────────┘
                      │ HTTPS · SSE · multipart
                      │ Clerk JWT in Authorization header
                      ▼
           ┌────────────────────────┐
           │ apps/api (NestJS 10)   │ Railway (Docker)
           └──┬───────┬─────────────┘
              │       │
   Postgres ◀─┤       ├─▶ Redis (BullMQ)         Upstash
   pgvector   │       │
   Neon       │       ├─▶ Cloudflare R2          tenant-scoped keys
              │       │
              │       ├─▶ Anthropic              streaming + tools + prompt cache
              │       ├─▶ OpenAI                 embeddings only
              │       ├─▶ Stripe                 subscription billing + webhook
              │       ├─▶ Spotify (Music)
              │       ├─▶ Freesound (Music)
              │       ├─▶ Langfuse               LLM tracing
              │       └─▶ Sentry                 5xx forwarding
              │
              └─ Clerk ─ JWT validation + webhook for user sync
```

---

## Monorepo

Turborepo + pnpm 9.6 workspaces.

```
apps/
  web/       Next.js 14 App Router (React 18, Tailwind, shadcn primitives, TanStack Query, Vercel AI SDK)
  api/       NestJS 10 + Prisma 5 + BullMQ + Anthropic SDK + AWS SDK v3 (R2)
packages/
  types/     Shared TS contracts (AgentType, Message, StreamEvent, Plan, etc.)
  validators/  Shared Zod schemas
  config/    Shared TS / ESLint / Tailwind presets
docker/      Local Postgres+pgvector + Redis compose
docs/        PRD, ARCHITECTURE, API, DEPLOYMENT
.github/workflows/  ci.yml + deploy-api.yml + deploy-web.yml + codeql.yml
```

Single `pnpm verify` runs typecheck + lint + test + build across all workspaces.

---

## Module map (apps/api)

```
src/
  main.ts                    Sentry init → Nest bootstrap → integration banner → listen
  app.module.ts              Registers shared infra modules first, then feature modules

  config/
    env.ts                   Zod schema; required (DB/Redis/Clerk/Anthropic/OpenAI) fail boot

  common/
    decorators/              @Public, @CurrentUser
    guards/                  ClerkAuthGuard (global, opt-out via @Public), AdminGuard
    filters/                 AllExceptionsFilter — Prisma + Zod + Http exceptions, Sentry on 5xx

  shared/                    Cross-cutting infra (every module can inject)
    prisma/                  PrismaService + runAsUser(userId, fn) for RLS-scoped txns
    redis/                   IORedis client + @nestjs/bullmq root
    storage/                 R2StorageService — tenant-scoped key builder + presign helper
    claude/                  ClaudeService — Anthropic 0.36.x wrapper, prompt cache, cost estimate
    rag/                     ChunkingService (512/64 cl100k_base) + EmbeddingService (text-embedding-3-small)
                             + RetrievalService (pgvector <=> cosine, userId+agentType scoped)
    tools/                   ToolRegistry + ITool interface + Zod→Anthropic JSON schema converter
    observability/           LangfuseService + Sentry init + integration-status banner

  modules/                   Feature modules
    auth/                    Clerk webhook (Svix) + sync to User table
    users/                   PATCH /users/me
    agents/                  GET /agents (catalogue) + per-agent submodules
      trading/               BacktestEngine + 6 tools + REST CRUD
      content/               Platform specs + calendar + 6 tools
      life-coach/            Theme extractor + decision framework + 6 tools
      music/                 Spotify + Freesound + palettes + 6 tools
    chat/                    ConversationsService + ClaudeOrchestratorService (agent loop) + SSE controller + UsageService
    documents/               Upload + BullMQ DocumentProcessor + RAG indexing
    billing/                 StripeService + BillingService (checkout, portal, webhook reconciliation)
    admin/                   Paginated users + platform stats + agent usage + CSV export (AdminGuard)
```

---

## The agent loop (PRD §6, the critical path)

`ClaudeOrchestratorService.run(opts)` returns an Observable of `StreamEvent`.

```
1. Persist USER message
2. Open Langfuse trace (no-op without keys)
3. RAG retrieve (userId + agentType scoped) → splice into system prompt
4. Build Anthropic MessageParam[] from history
5. Loop iter 0..MAX_TOOL_ITERATIONS-1:
     a. claude.stream({ system: [TextBlock w/ cache_control], messages, tools })
     b. on 'text' delta → emit content_delta SSE
     c. await stream.finalMessage()
     d. Langfuse.recordGeneration(traceId, claude.iter<n>, tokens, cost)
     e. if no tool_use blocks OR stop_reason != tool_use → break
     f. push assistant turn (with tool_use blocks) into messages
     g. for each tool_use:
          - emit tool_use SSE
          - ToolRegistry.execute (Zod validate → tool.execute(input, ctx))
          - emit tool_result SSE
          - push tool_result block into next user turn
     h. push toolResultBlocks as a single user turn
6. Persist ASSISTANT message (content + toolCalls JSON + toolResults JSON + tokens)
7. UsageService.record (userId + agentType + tokens + costUsd)
8. emit message_end SSE { tokensInput, tokensOutput, costUsd }
```

### Invariants enforced

- **Tool-call cap:** `MAX_TOOL_ITERATIONS = 10` constant in `shared/claude/types.ts`
- **Tenant scoping:** `RetrievalService.retrieve` raw SQL filters `userId AND agentType AND status='INDEXED'`. Same scope baked into `R2StorageService.buildKey`
- **No fabricated metrics:** every Trading number originates from `BacktestEngine` (pure function); every Content platform constraint comes from `SOCIAL_SPECS`/`VIDEO_SPECS`/`BLOG_SEO_SPEC`; every Life Coach theme comes from `extractThemes()` (deterministic word frequency); every Music palette from `PALETTES` lookup
- **Plan quota:** `MessagesController` calls `UsageService.canSpend(userId)` BEFORE opening a Claude stream. Hard cutoff returns 403
- **System prompt cache hit:** `system` is a `TextBlockParam[]` with `cache_control.ephemeral`

---

## Per-agent module convention (Phase 3 pattern)

Every agent module follows the same shape:

```
agents/<agent>/
  <agent>.service.ts        Business logic, tenant-scoped via ctx.userId
  <agent>.module.ts         DI + OnModuleInit → ToolRegistry.register(tool)
  <domain-files>.ts         Deterministic resources (palettes, specs, engines)
  tools/
    <tool>.tool.ts × N      ITool implementations, Zod input schemas
    index.ts
```

`OnModuleInit` is the registration seam — each agent module registers its tools when Nest constructs the dep graph. The chat orchestrator reads `ToolRegistry.toAnthropic(agentType)` lazily per turn, so adding a tool means: write a class, list it in the module's providers, register it in `onModuleInit`.

---

## Data layer

**Prisma 5 + Postgres 16 + pgvector(1536).** Schema in `apps/api/prisma/schema.prisma`. RLS policies in `apps/api/prisma/rls.sql` (apply post-migration).

Critical models:

- `User` — Clerk-synced. `plan` enum drives `PLAN_LIMITS` in `@nexa/types`. `stripeCustomerId` set on first checkout
- `Agent` — seeded singletons, one row per `AgentType`. `tools` is JSON metadata only — actual tool execution lives in code
- `Conversation` + `Message` — RLS scoped; `Message.toolCalls` and `toolResults` are JSON for replay
- `Document` + `DocumentChunk` — `embedding vector(1536)`. RLS scoped. TRADING CSVs short-circuit chunking
- `UsageRecord` — append-only ledger; aggregated per-month for plan enforcement and admin stats
- `TradingStrategy` + `Backtest` — strategy is JSON DSL, backtest stores full trade log JSON

**RLS pattern:** `PrismaService.runAsUser(userId, fn)` runs `set_config('app.current_user_id', $1, true)` inside a transaction. Every RLS policy in `rls.sql` references `current_setting('app.current_user_id')`. Bypass = explicit raw query without the wrapper (used for admin reads).

---

## RAG pipeline

```
POST /documents/upload?agentType=...
  → DocumentsService.upload
       store in R2: users/{userId}/agents/{agentType}/{fileId}.{ext}
       create Document(status=PROCESSING)
       enqueue BullMQ job (3 retries exponential backoff)

DocumentProcessor (background)
  → if TRADING + text/csv: flip to INDEXED, return (raw bars consumed by backtest engine, not RAG)
  → else: R2 fetch → FileParserService (pdf-parse / mammoth / plain)
        → ChunkingService (512 tokens, 64 overlap, cl100k_base)
        → EmbeddingService.embedMany (OpenAI text-embedding-3-small, batch 20)
        → tx: deleteMany existing chunks + insert with raw SQL (vector cast)
        → Document.status = INDEXED
  → Terminal failure: status = FAILED with error in metadata
```

Retrieval at chat time uses `<=>` cosine distance, top K=6, scoped by `userId AND agentType AND status='INDEXED'`.

---

## Auth + Clerk

- **API:** `ClerkAuthGuard` is global (`APP_GUARD`). Routes opt out with `@Public()`. Inside, `req.user` becomes `{ clerkId, sessionId, orgId, role }` where `role` comes from `sessionClaims.metadata.role` (Clerk JWT template must include `publicMetadata`).
- **Web:** `clerkMiddleware` with `createRouteMatcher` allows `/`, `/pricing`, `/about`, `/sign-in*`, `/sign-up*`, `/api/webhooks/*`; everything else `auth().protect()`.
- **Sync:** Svix-verified webhook at `POST /api/v1/auth/webhook/clerk` handles `user.created/updated/deleted` → upserts the User row.
- **Admin:** `AdminGuard` checks `req.user.role === 'admin'`. Set in Clerk dashboard under user → `publicMetadata.role`.

---

## Billing flow (Stripe live mode)

```
Web /billing
  → checkout button POST /api/v1/billing/checkout { plan, successUrl, cancelUrl }
  → BillingService.ensureStripeCustomer (creates if needed, persists stripeCustomerId)
  → stripe.checkout.sessions.create(mode=subscription, metadata={clerkId,plan})
  → return { url } → window.location

Stripe → POST /api/v1/billing/webhook (signed)
  → BillingController verifies signature with rawBody + STRIPE_WEBHOOK_SECRET
  → BillingService.handleWebhookEvent
       checkout.session.completed → retrieve subscription → applySubscription
       customer.subscription.created/updated → applySubscription
       customer.subscription.deleted → updateMany plan=FREE
       invoice.payment_failed → no-op (subscription.updated will arrive separately)
       any other event → ack 200 (avoid retry storms)
  → applySubscription: lookup priceId in catalogue → if active|trialing grant plan, else FREE
```

Webhook reconciliation has 8 unit tests in `billing.service.spec.ts` covering grant, trial, past_due downgrade, deletion, hydration, non-subscription mode, unknown price, unknown event.

---

## Observability

| Source               | Tool                   | Trigger                                                                                             |
| -------------------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| 5xx exceptions (API) | Sentry                 | `AllExceptionsFilter` forwards on `statusCode >= 500`                                               |
| 5xx exceptions (Web) | Sentry                 | Next.js `instrumentation.ts` + sentry.client/server/edge.config.ts                                  |
| LLM traces + cost    | Langfuse               | `LangfuseService.trace` per user message + `recordGeneration` per Claude call inside the agent loop |
| Token cost ledger    | Postgres `UsageRecord` | Appended after every successful agent turn                                                          |
| Boot health          | stdout banner          | `logIntegrationStatus()` in `main.ts` after Nest factory                                            |

Each observability sink is **lazy and no-op without keys** — local dev stays quiet.

---

## Frontend layout

```
apps/web/app/
  (marketing)/      Public — landing, pricing, about
  (auth)/           Clerk-rendered sign-in / sign-up
  (dashboard)/
    layout.tsx      Sidebar with 4 agent tabs + UserButton
    dashboard/      Overview
    agents/
      [slug]/       Generic chat (catch-all for any agent)
      trading/      Trading-specific workspace (sidebar + Recharts)
      content/      Chat + brand voice KB
      life-coach/   Chat + journals KB
      music/        Chat + mixing notes KB
    billing/        Plans + usage + Stripe checkout / portal
  admin/            (own layout, AdminGuard on API side)
```

Design tokens in `packages/config/tailwind/preset.ts`. Brand: pure black (`#000000`) + vibrant orange (`#FF9100`). Google Sans Display headings, Google Sans Text body, JetBrains Mono code.

---

## Tests

```
apps/api/src/**/*.spec.ts → vitest
  trading/backtest/        indicators, csv, engine, metrics
  shared/rag/              chunking
  shared/tools/            tool-registry, zod-to-json-schema
  life-coach/              themes
  content/                 calendar
  billing/                 webhook reconciliation (8 tests)
```

56 tests, ~600ms total. Run via `pnpm --filter @nexa/api test` or `pnpm verify`.

---

## When something breaks — first place to look

| Symptom                             | First thing to check                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` fails on boot            | `pnpm --filter @nexa/api typecheck` then env Zod errors in stderr                                                      |
| API boots but Stripe checkout 503s  | Boot banner — `Stripe billing  OFF (paid plans disabled)` means the env vars are missing                               |
| Chat starts then halts mid-turn     | `MAX_TOOL_ITERATIONS=10` cap hit; check Langfuse trace for the iteration count                                         |
| RAG returns nothing for a known doc | `Document.status` should be `INDEXED`. If `FAILED`, inspect `metadata.error`                                           |
| Cross-user data leak suspicion      | grep `RetrievalService.retrieve` callers; every one MUST scope `userId + agentType`                                    |
| Cost spike                          | `/admin` agent usage table → narrows to one agent; Langfuse trace by `userId` → narrows to one user                    |
| Webhook misses                      | Stripe dashboard → Developers → Webhooks → resend; check API logs for signature errors                                 |
| RLS leak                            | `prisma/rls.sql` has the policies; reapply if drift suspected. All paths into user-owned tables go through `runAsUser` |

---

## Stable seams (where to add things without ripple)

- **New tool for an existing agent:** add a class in `agents/<agent>/tools/`, list in module providers, register in `onModuleInit`. Done.
- **New agent type:** add to `AgentType` enum in Prisma + `@nexa/types`, create `agents/<new>/` module on the same convention, register in `AppModule`, seed an `Agent` row in `prisma/seed.ts`.
- **New Stripe price:** create in Stripe dashboard, add `STRIPE_PRICE_<NAME>` env var, extend `StripeService.priceIdFor/planForPriceId`. The webhook reconciler picks it up automatically.
- **New observability sink:** add to `shared/observability/`, wire from where it's needed. Follow the lazy/no-op-without-keys pattern.
