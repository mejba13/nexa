# Nexa — Deployment Runbook

> Production targets per PRD §17:
>
> - **Web** → Vercel · `https://nexa.ai`
> - **API** → Railway (Docker) · `https://api.nexa.ai`
> - **Postgres** → Neon · main branch
> - **Redis** → Upstash
> - **Storage** → Cloudflare R2
> - **Auth** → Clerk · production instance
> - **Billing** → Stripe · live mode

This runbook covers a clean first deploy + the recurring promote-to-prod flow.

---

## 0. One-time provisioning

| Service              | Action                                                                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neon                 | Create project. Copy the `DATABASE_URL` (with `?sslmode=require`). Enable the `vector` and `pgcrypto` extensions in the SQL editor.                                                                                                                                                                               |
| Upstash              | Create a Redis database. Copy the rediss:// URL.                                                                                                                                                                                                                                                                  |
| Cloudflare R2        | Create a bucket `nexa-files`. Generate API token (S3-compatible). Note `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.                                                                                                                                                                               |
| Clerk                | Create production instance. Configure JWT template to include `metadata.role` claim. Enable Google + GitHub OAuth. Webhook target → `https://api.nexa.ai/api/v1/auth/webhook/clerk`.                                                                                                                              |
| Stripe               | Create products: Starter ($19), Pro ($49), Business ($149) with monthly recurring prices. Note each `price_…` ID. Add a webhook endpoint → `https://api.nexa.ai/api/v1/billing/webhook` listening for `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`. Copy the signing secret. |
| Anthropic            | Create an org-scoped API key.                                                                                                                                                                                                                                                                                     |
| OpenAI               | Create an embeddings-only key (gives least privilege).                                                                                                                                                                                                                                                            |
| Langfuse             | Create project. Copy public + secret keys.                                                                                                                                                                                                                                                                        |
| Sentry               | Create projects: `nexa-api`, `nexa-web`. Copy DSNs.                                                                                                                                                                                                                                                               |
| Spotify (optional)   | Create Web API app → Client ID + Secret.                                                                                                                                                                                                                                                                          |
| Freesound (optional) | Personal API key.                                                                                                                                                                                                                                                                                                 |

---

## 1. Database bootstrap

```bash
# Locally, against the production Neon URL — runs the same migrations our dev DB has.
DATABASE_URL=postgresql://...neon... pnpm --filter @nexa/api prisma:deploy
psql "$DATABASE_URL" -f apps/api/prisma/rls.sql
DATABASE_URL=... pnpm --filter @nexa/api prisma:seed
```

`rls.sql` is idempotent — re-running on each release is safe.

---

## 2. API deploy (Railway)

### First time

1. Install Railway CLI: `brew install railway`.
2. `railway login`.
3. `railway init` in repo root → choose "Deploy from existing repo".
4. Add a service named `nexa-api`. Point to this repo, `main` branch, root directory.
5. In the Railway dashboard → Settings → set **Builder** to _Dockerfile_ and **Dockerfile path** to `apps/api/Dockerfile` (or accept the `railway.json` checked into the repo).
6. Add environment variables (see env matrix below). Make sure to add `DATABASE_URL`, `REDIS_URL`, `CLERK_*`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `R2_*`, `STRIPE_*`, `LANGFUSE_*`, `SENTRY_DSN`, `NEXT_PUBLIC_APP_URL=https://nexa.ai`.
7. Trigger the first deploy: `railway up --service nexa-api`.
8. Map a custom domain → `api.nexa.ai`.

### Repeat deploy

- **Manual:** `railway up --service nexa-api`.
- **Tag-driven CI:** push a tag matching `api-v*` (e.g. `api-v0.2.0`). The `.github/workflows/deploy-api.yml` workflow runs typecheck + build + tests, then `railway up`.
- Required GitHub repo secrets: `RAILWAY_TOKEN`. Required vars: `RAILWAY_SERVICE=nexa-api`, `API_URL=https://api.nexa.ai`.

### Rollback

`railway rollback --service nexa-api` (Railway keeps the last 10 deploys).

---

## 3. Web deploy (Vercel)

### First time

1. Install Vercel CLI: `npm i -g vercel`.
2. `vercel login`.
3. From repo root: `cd apps/web && vercel link` → choose / create project `nexa-web`.
4. In the Vercel dashboard → Settings → Build & Development:
   - **Root Directory:** `apps/web` (Vercel handles the rest via `vercel.json` checked in).
   - **Framework Preset:** Next.js.
5. Add environment variables (production scope): `NEXT_PUBLIC_*` keys + `CLERK_SECRET_KEY` (server-side). See env matrix.
6. First deploy: `vercel --prod`.
7. Map domain → `nexa.ai`.

### Repeat deploy

- **Manual:** `vercel --prod` from `apps/web`.
- **Tag-driven CI:** push a tag matching `web-v*`. Workflow at `.github/workflows/deploy-web.yml` does `vercel pull → build → deploy --prebuilt`. Secret: `VERCEL_TOKEN`. Var: `WEB_URL=https://nexa.ai`.

### Rollback

Vercel dashboard → Deployments → "Promote to Production" on a prior build.

---

## 4. Env matrix

| Key                                  | Where     | Notes                                                    |
| ------------------------------------ | --------- | -------------------------------------------------------- |
| `DATABASE_URL`                       | api       | Neon connection string with `?sslmode=require`.          |
| `REDIS_URL`                          | api       | Upstash `rediss://`.                                     |
| `CLERK_SECRET_KEY`                   | api + web | Server-side only.                                        |
| `CLERK_WEBHOOK_SECRET`               | api       | From the Clerk webhook config.                           |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | web       | Public.                                                  |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`      | web       | `/sign-in`.                                              |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`      | web       | `/sign-up`.                                              |
| `ANTHROPIC_API_KEY`                  | api       |                                                          |
| `OPENAI_API_KEY`                     | api       |                                                          |
| `R2_ACCOUNT_ID`                      | api       |                                                          |
| `R2_ACCESS_KEY_ID`                   | api       |                                                          |
| `R2_SECRET_ACCESS_KEY`               | api       |                                                          |
| `R2_BUCKET_NAME`                     | api       | `nexa-files`                                             |
| `R2_PUBLIC_URL`                      | api       | `https://files.nexa.ai` (configure custom domain on R2). |
| `STRIPE_SECRET_KEY`                  | api       | live mode `sk_live_…`                                    |
| `STRIPE_WEBHOOK_SECRET`              | api       | from Stripe webhook config                               |
| `STRIPE_PRICE_STARTER`               | api       | `price_…`                                                |
| `STRIPE_PRICE_PRO`                   | api       | `price_…`                                                |
| `STRIPE_PRICE_BUSINESS`              | api       | `price_…`                                                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | web       | live mode `pk_live_…`                                    |
| `LANGFUSE_SECRET_KEY`                | api       |                                                          |
| `LANGFUSE_PUBLIC_KEY`                | api       |                                                          |
| `LANGFUSE_HOST`                      | api       | `https://cloud.langfuse.com` (or self-hosted)            |
| `SENTRY_DSN`                         | api       | API DSN                                                  |
| `NEXT_PUBLIC_SENTRY_DSN`             | web       | Web DSN                                                  |
| `POSTHOG_KEY`                        | api       | optional                                                 |
| `SPOTIFY_CLIENT_ID`                  | api       | optional                                                 |
| `SPOTIFY_CLIENT_SECRET`              | api       | optional                                                 |
| `FREESOUND_API_KEY`                  | api       | optional                                                 |
| `NEXT_PUBLIC_APP_URL`                | api + web | `https://nexa.ai`                                        |
| `NEXT_PUBLIC_API_URL`                | web       | `https://api.nexa.ai/api/v1`                             |

---

## 5. Promote-to-prod checklist

Before tagging:

- [ ] `pnpm typecheck` clean
- [ ] `pnpm test` 48/48 green
- [ ] `pnpm build` succeeds on both apps
- [ ] No new env keys missing from production secrets manager
- [ ] If schema changed: a Prisma migration is committed, reviewed, and `prisma:deploy`-ready
- [ ] If RLS surface changed: `prisma/rls.sql` updated and reapplied to prod
- [ ] Stripe price IDs match the running plan catalogue
- [ ] Clerk webhook health is green
- [ ] Sentry release tag matches the deployed commit (auto-set by workflow)

Then:

```bash
git tag api-v$(date +%Y.%m.%d)-$(git rev-parse --short HEAD)
git tag web-v$(date +%Y.%m.%d)-$(git rev-parse --short HEAD)
git push --tags
```

Both deploy workflows fire concurrently. Web depends on API only insofar as new endpoints must already be live — if you're adding endpoints, deploy API first then web.

---

## 6. Smoke tests after promote

1. `curl https://api.nexa.ai/api/v1/health` → 200 + version JSON.
2. Sign in via Clerk on the production web app.
3. Send a message in any agent → confirm streaming + tool use renders.
4. Upload a small PDF to the Life Coach KB → status reaches `INDEXED` within 30s.
5. Stripe Checkout test: hit Upgrade → land on the customer portal → cancel.
6. Admin sign-in (account with `publicMetadata.role = "admin"`) → `/admin` loads stats.

If any step fails, roll back the API first (most surface area), then web.

---

## 7. Operational notes

- **Cost spikes:** check `/admin` agent usage table first; Langfuse for per-trace breakdown.
- **Stripe webhook misses:** Stripe dashboard → Developers → Webhooks → resend the missed event.
- **RLS leaks:** every retrieval query in this codebase filters by `userId` AND `agentType`; if a leak surfaces, search `RetrievalService.retrieve` callers and `apps/api/src/modules/agents/*/tools/` for any tool that bypasses it.
- **Tool-call infinite loops:** capped at `MAX_TOOL_ITERATIONS=10`. If a real strategy needs more, raise the constant in `apps/api/src/shared/claude/types.ts` and document why.
