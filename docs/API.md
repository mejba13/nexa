# Nexa API Reference

> **Base URL (dev):** `http://localhost:3001/api/v1`
> **Base URL (prod):** `https://api.nexa.ai/v1`
>
> All routes require `Authorization: Bearer <CLERK_JWT>` unless explicitly marked **Public**.
> All errors return JSON: `{ statusCode, error, message, path, timestamp }`.
>
> Swagger UI (non-prod): `http://localhost:3001/api/docs`

---

## Health

| Method | Path      | Auth   | Description                                                              |
| ------ | --------- | ------ | ------------------------------------------------------------------------ |
| GET    | `/health` | Public | Liveness probe — returns `{ status: "ok", service, version, timestamp }` |

---

## Auth

| Method | Path                  | Auth                  | Description                                                       |
| ------ | --------------------- | --------------------- | ----------------------------------------------------------------- |
| POST   | `/auth/sync`          | Bearer                | Idempotent sync of the Clerk user into our DB. Call after sign-up |
| GET    | `/auth/me`            | Bearer                | Current user record                                               |
| DELETE | `/auth/me`            | Bearer                | Deletes user + cascades all owned rows                            |
| POST   | `/auth/webhook/clerk` | Public, Svix-verified | Clerk webhook — handles `user.created/updated/deleted`            |

---

## Users

| Method | Path        | Auth   | Body                    | Description    |
| ------ | ----------- | ------ | ----------------------- | -------------- |
| PATCH  | `/users/me` | Bearer | `{ name?, avatarUrl? }` | Update profile |

---

## Agents

| Method | Path                   | Auth   | Description                                                              |
| ------ | ---------------------- | ------ | ------------------------------------------------------------------------ |
| GET    | `/agents`              | Bearer | List active agent definitions                                            |
| GET    | `/agents/:type`        | Bearer | Single agent by type (`TRADING` \| `MUSIC` \| `CONTENT` \| `LIFE_COACH`) |
| GET    | `/agents/:type/status` | Bearer | Plan-cap access check; 403 if plan limit reached                         |

---

## Conversations

| Method | Path                                  | Auth   | Description                                           |
| ------ | ------------------------------------- | ------ | ----------------------------------------------------- |
| GET    | `/conversations?agentType=&archived=` | Bearer | List user's conversations, sorted by `updatedAt` desc |
| POST   | `/conversations`                      | Bearer | Body `{ agentType, title? }` — create                 |
| GET    | `/conversations/:id`                  | Bearer | Conversation + ordered messages                       |
| PATCH  | `/conversations/:id`                  | Bearer | Body `{ title?, isStarred?, isArchived? }`            |
| DELETE | `/conversations/:id`                  | Bearer | Hard delete (cascades messages)                       |
| GET    | `/conversations/:id/export`           | Bearer | Markdown export, `Content-Disposition: attachment`    |

---

## Messages (the streaming endpoint)

| Method | Path                          | Auth   | Description                              |
| ------ | ----------------------------- | ------ | ---------------------------------------- |
| POST   | `/conversations/:id/messages` | Bearer | Body `{ content }` — opens an SSE stream |

### SSE event shape

```
event: message_start
data: {"messageId":"msg_xyz"}

event: content_delta
data: {"delta":"…"}

event: tool_use
data: {"toolCall":{"id":"tu_…","name":"…","input":{…}}}

event: tool_result
data: {"toolCallId":"tu_…","result":…,"isError":false}

event: message_end
data: {"tokensInput":…,"tokensOutput":…,"costUsd":…}

event: error
data: {"message":"…","code":"…"}
```

The full TS contract lives in `@nexa/types` as `StreamEvent`. The web client consumes via `apps/web/lib/sse.ts` (custom parser — `EventSource` doesn't support POST + bearer auth).

**Pre-conditions checked before stream opens:**

- Bearer token valid (Clerk)
- Conversation exists and belongs to caller
- `UsageService.canSpend(userId)` — monthly token quota not exhausted (403 otherwise)

---

## Documents (RAG knowledge base)

| Method | Path                           | Auth   | Description                                                                                                                                                                                               |
| ------ | ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/documents?agentType=`        | Bearer | List user's documents                                                                                                                                                                                     |
| POST   | `/documents/upload?agentType=` | Bearer | `multipart/form-data` with `file` field. Max 50 MB. Allowed MIME: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, `text/markdown`, `text/csv` |
| GET    | `/documents/:id`               | Bearer | Document details                                                                                                                                                                                          |
| DELETE | `/documents/:id`               | Bearer | Delete + remove R2 object + cascade chunks                                                                                                                                                                |
| POST   | `/documents/:id/reindex`       | Bearer | Re-run chunk + embed                                                                                                                                                                                      |

`status` cycles `PROCESSING → INDEXED \| FAILED`. Web polls every 3s while any document is `PROCESSING`.

---

## Trading

| Method | Path                             | Auth   | Description                                                                                                           |
| ------ | -------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| GET    | `/trading/strategies`            | Bearer | List user's strategies                                                                                                |
| POST   | `/trading/strategies`            | Bearer | Body `{ name, description, rules }` (rules is the DSL — see `apps/api/src/modules/agents/trading/backtest/schema.ts`) |
| GET    | `/trading/strategies/:id`        | Bearer | Single strategy                                                                                                       |
| DELETE | `/trading/strategies/:id`        | Bearer | Delete                                                                                                                |
| POST   | `/trading/backtests`             | Bearer | Body `{ strategyId, initialCapital, csv? \| documentId? }` — runs synchronously, returns `{ backtest, result }`       |
| GET    | `/trading/backtests?strategyId=` | Bearer | List recent backtests                                                                                                 |
| GET    | `/trading/backtests/:id`         | Bearer | Single backtest with full trade log                                                                                   |
| GET    | `/trading/backtests/:id/status`  | Bearer | Always returns `COMPLETED` in v1 (synchronous)                                                                        |

### Strategy rules DSL

```jsonc
{
  "symbol": "BTC",
  "entry": {
    "combinator": "all",
    "conditions": [{ "left": { "indicator": "rsi", "period": 14 }, "op": "<", "right": 30 }],
  },
  "exit": {
    "combinator": "all",
    "conditions": [{ "left": { "indicator": "rsi", "period": 14 }, "op": ">", "right": 70 }],
  },
  "sizing": { "type": "fixed_fraction", "fraction": 1 },
  "fees": { "perTradePct": 0.001 },
}
```

Indicators: `sma | ema | rsi | price | return`. Ops: `< | <= | > | >= | ==`. Sources: `o | h | l | c` (default `c`). `RuleGroup` is recursive.

---

## Billing

| Method | Path                | Auth                  | Description                                                                                                                    |
| ------ | ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/billing/plans`    | Public                | Plan catalogue with limits + Stripe price IDs                                                                                  |
| POST   | `/billing/checkout` | Bearer                | Body `{ plan, successUrl, cancelUrl }` — returns `{ url }` (Stripe Checkout)                                                   |
| POST   | `/billing/portal`   | Bearer                | Body `{ returnUrl }` — returns `{ url }` (Stripe Customer Portal)                                                              |
| GET    | `/billing/usage`    | Bearer                | `{ plan, limits, tokensUsed, tokensLimit, allowed }`                                                                           |
| POST   | `/billing/webhook`  | Public, Stripe-signed | Idempotent reconciler: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed` |

`POST /billing/checkout` requires the corresponding `STRIPE_PRICE_<PLAN>` env var to be set on the API; otherwise 400.

---

## Admin

All require `Authorization: Bearer <admin-jwt>` (Clerk `publicMetadata.role === 'admin'`).

| Method | Path                             | Description                                                                               |
| ------ | -------------------------------- | ----------------------------------------------------------------------------------------- |
| GET    | `/admin/users?cursor=&limit=&q=` | Cursor-paginated user list with optional search                                           |
| GET    | `/admin/users/:id`               | User details + last 30 days usage by agent                                                |
| GET    | `/admin/users/export.csv`        | CSV download of all users                                                                 |
| GET    | `/admin/stats?days=`             | Platform stats (totals, paid users, DAU proxy, conversations + tokens + cost over window) |
| GET    | `/admin/agents/usage?days=`      | Per-agent calls + tokens + cost over window                                               |

---

## Rate limiting

`@nestjs/throttler` global guard:

- **short:** 60 req/min
- **long:** 100 req/min

Both apply per IP. Plan-tier-aware throttling is a v2 item.

---

## Error shape

```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": ["body.content: String must contain at least 1 character(s)"],
  "path": "/api/v1/conversations/conv_abc/messages",
  "timestamp": "2026-04-24T15:48:19.012Z"
}
```

| Status | Common cause                                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 400    | Zod validation failure (array of field-level messages) or missing required body                                                     |
| 401    | Clerk JWT invalid or missing on a protected route                                                                                   |
| 403    | Admin route without admin role, or monthly token quota exhausted                                                                    |
| 404    | Resource not found OR Prisma `P2025` (record missing)                                                                               |
| 409    | Prisma `P2002` (unique constraint, e.g. duplicate Stripe customer)                                                                  |
| 413    | Document upload exceeds 50 MB                                                                                                       |
| 415    | Unsupported MIME type on upload                                                                                                     |
| 500    | Forwarded to Sentry. Body is a generic "Unexpected error" — check Sentry for the trace                                              |
| 503    | An optional integration is required for this operation but isn't configured (e.g. Stripe checkout when `STRIPE_SECRET_KEY` missing) |

---

## Quick local cURL recipes

```bash
# Health (public)
curl http://localhost:3001/api/v1/health

# Plans (public)
curl http://localhost:3001/api/v1/billing/plans

# Anything authed — grab a Clerk JWT from the web app's network tab
TOKEN="..."

# List your conversations
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/conversations?agentType=TRADING"

# Open an SSE stream against a conversation
curl -N -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"content":"hello"}' \
  "http://localhost:3001/api/v1/conversations/conv_abc/messages"

# Upload a brand-voice doc
curl -H "Authorization: Bearer $TOKEN" \
  -F "file=@brand-guide.pdf" \
  "http://localhost:3001/api/v1/documents/upload?agentType=CONTENT"
```
