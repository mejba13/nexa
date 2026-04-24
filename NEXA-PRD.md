# Nexa — Product Requirements Document (PRD)

> **Product:** Nexa — Multi-Agent AI Platform
> **Tagline:** One platform. Infinite intelligence.
> **Document Version:** 1.0
> **Status:** Ready for Development
> **Developer:** Engr. Mejba Ahmed ([mejba.me](https://www.mejba.me/))
> **Last Updated:** April 24, 2026
> **Target Consumers:** AI Coding Agents (Claude Code, Cursor, Windsurf) + Engineering Team

---

## 📋 How to Use This Document (For AI Coding Agents)

This PRD is structured for autonomous implementation. Each feature has:

- **Feature ID** (e.g., `F-001`) — reference in commits, PRs, and prompts
- **Acceptance Criteria** — explicit pass/fail conditions
- **Technical Directives** — concrete implementation instructions
- **Dependencies** — other features or systems required

**For Claude Code / Cursor:**

```
Read NEXA-PRD.md. Implement features in order: F-001 → F-009 → agent-specific features.
Follow the exact tech stack in Section 7. Use the database schema in Section 8.
Create the project structure defined in Section 14.
```

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem & Solution](#2-problem--solution)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [User Personas](#4-user-personas)
5. [The Four Agents](#5-the-four-agents)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Database Schema](#8-database-schema)
9. [API Specifications](#9-api-specifications)
10. [Feature Requirements](#10-feature-requirements)
11. [User Flows](#11-user-flows)
12. [Security Requirements](#12-security-requirements)
13. [Performance Requirements](#13-performance-requirements)
14. [Project Structure](#14-project-structure)
15. [Development Roadmap](#15-development-roadmap)
16. [Testing Strategy](#16-testing-strategy)
17. [Deployment & DevOps](#17-deployment--devops)
18. [Risks & Mitigations](#18-risks--mitigations)
19. [Out of Scope for v1](#19-out-of-scope-for-v1)
20. [Open Questions](#20-open-questions)
21. [Developer Information](#21-developer-information)

---

## 1. Executive Summary

### Product Name

**Nexa**

### One-Line Description

A multi-agent AI platform powered by Claude where four specialized autonomous agents (Trading, Music, Content, Life Coach) operate in a unified workspace with isolated memory, custom tools, and real-time streaming.

### Vision

To become the operating system for specialized AI agents — consolidating fragmented AI tools into one authenticated, intelligent platform.

### Mission

Empower users with an entire AI team in one place — each agent purpose-built for its domain, fully autonomous, and aware of the user's personal context.

### Core Value Proposition

- ✅ Four specialized Claude agents in one workspace
- ✅ Isolated knowledge bases per agent (privacy by design)
- ✅ Autonomous tool use & multi-step reasoning
- ✅ Real-time streaming chat with full conversation history
- ✅ Single sign-on across all agents
- ✅ Production-grade security, scalability, and observability

---

## 2. Problem & Solution

### Problem Statement

Power users today juggle 5–10 disconnected AI subscriptions (ChatGPT, Jasper, Notion AI, specialized trading tools, journaling apps). These tools:

- Do not share memory or context
- Re-learn user preferences from scratch every session
- Lack autonomous multi-step execution
- Have no unified billing, auth, or data ownership
- Force users into manual prompting for every task

### Solution Overview

Nexa consolidates four domain-specialized Claude agents into a single authenticated workspace. Each agent:

- Maintains its own isolated knowledge base (pgvector)
- Has dedicated tools (backtester, content scheduler, RAG over journals, etc.)
- Executes autonomous multi-step workflows via Claude Agent SDK
- Streams responses in real-time via Server-Sent Events (SSE)
- Shares unified auth, billing, and admin dashboard

---

## 3. Goals & Non-Goals

### ✅ Goals (What v1 MUST Achieve)

1. Deliver four fully functional Claude-powered agents
2. Enable secure multi-tenant user authentication
3. Provide per-agent isolated knowledge bases with RAG
4. Support real-time streaming chat with tool-use visualization
5. Include admin dashboard and billing infrastructure
6. Achieve <2s first-token latency for all agents
7. Achieve 99.9% uptime SLA
8. Full observability of all agent actions

### ❌ Non-Goals (What v1 Will NOT Do)

1. Native mobile apps (responsive PWA only)
2. Live trading execution or broker integrations
3. Multi-user teams or shared workspaces
4. User-defined custom agents
5. Voice input/output interfaces
6. Public API or webhook integrations

---

## 4. User Personas

### Persona 1: The Multi-Domain Creator

- **Name:** Alex, 32, Independent Creator
- **Needs:** Manages trading portfolio, produces music, and creates content — tired of switching between 8 different AI tools
- **Goal:** One subscription, one login, all AI workflows

### Persona 2: The Quant Enthusiast

- **Name:** Priya, 28, Retail Trader
- **Needs:** Wants to backtest strategies without learning Python or paying for Bloomberg
- **Goal:** Upload a strategy, get performance metrics, iterate quickly

### Persona 3: The Self-Reflective Founder

- **Name:** Marcus, 40, Startup CEO
- **Needs:** Years of journals he wants to transform into a personal coaching system
- **Goal:** An AI that understands his personality and offers contextual advice

### Persona 4: The Growth Marketer

- **Name:** Sofia, 29, Brand Manager
- **Needs:** Consistent brand voice across 50+ posts/month
- **Goal:** A content agent trained on her brand guidelines that produces publish-ready copy

---

## 5. The Four Agents

### 🔷 Agent 01 — Trading Analyst

**Purpose:** Autonomous quant partner for trading strategy analysis and backtesting.

**Core Capabilities:**

- Ingest trading strategies (text descriptions or structured rules)
- Upload historical market data (CSV, OHLCV format)
- Store strategies and data in isolated agent database
- Execute backtests using deterministic engine
- Generate performance metrics: P/L, win rate, drawdown, Sharpe ratio, trade history
- Analyze results and suggest strategy improvements

**Required Tools:**

```typescript
tools: [
  'upload_strategy', // Store strategy definition
  'upload_market_data', // Store historical OHLCV data
  'run_backtest', // Execute backtest with strategy + data
  'get_performance_metrics', // Compute P/L, win rate, drawdown
  'compare_strategies', // A/B compare two strategies
  'suggest_improvements', // Analyze results, propose changes
];
```

**Tech Requirements:**

- Backtesting engine: Custom Node.js implementation OR Python microservice (FastAPI)
- Data source: Initially CSV uploads; Phase 2 → Alpha Vantage / Polygon.io API
- Chart library: Recharts for visualizations in frontend
- **NEVER let Claude fabricate numbers** — all metrics come from deterministic engine

---

### 🔷 Agent 02 — Music Producer

**Purpose:** Creative collaborator for music creation, production, and mixing guidance.

**Core Capabilities:**

- Find music references based on style/mood
- Suggest sounds, instruments, beats, arrangements
- Provide mixing and mastering guidance
- Generate creative ideas for production
- Assist with lyrics, hooks, and song structure

**Required Tools:**

```typescript
tools: [
  'search_references', // Spotify API for similar tracks
  'suggest_instruments', // Rule-based + Claude reasoning
  'suggest_arrangement', // Structural templates
  'generate_lyrics', // Claude-only (no tool)
  'find_samples', // Freesound.org API
  'mixing_guidance', // Knowledge base queries
];
```

**Tech Requirements:**

- External APIs: Spotify Web API, Freesound.org API
- Audio playback: Web Audio API in frontend
- Waveform viz: Wavesurfer.js (Phase 2)

---

### 🔷 Agent 03 — Content Strategist

**Purpose:** Brand-voice-trained content agent for social, video, blog, and marketing content.

**Core Capabilities:**

- Generate social media posts (Twitter, LinkedIn, Instagram)
- Write video scripts and Reels/Shorts ideas
- Create captions, hooks, and CTAs
- Produce long-form blog content
- Generate content calendars
- Maintain brand-specific voice from uploaded docs

**Required Tools:**

```typescript
tools: [
  'query_brand_voice', // RAG over brand guideline docs
  'generate_social_post', // Platform-specific formatting
  'generate_blog_post', // Long-form with SEO structure
  'generate_video_script', // Hook + body + CTA
  'create_content_calendar', // Multi-week planning
  'research_trends', // Web search integration (Phase 2)
];
```

**Tech Requirements:**

- RAG: pgvector with OpenAI embeddings (`text-embedding-3-small`)
- Brand voice training: Users upload brand docs, style guides
- Stock images: Unsplash API integration (Phase 2)

---

### 🔷 Agent 04 — Life Coach

**Purpose:** Personality-aware coach trained on user journals and personal data.

**Core Capabilities:**

- Ingest uploaded journal entries (PDF, DOCX, TXT, MD)
- Understand user's mindset, personality, and recurring themes
- Generate reflections based on personal data
- Provide decision-making support
- Offer motivation in user's own voice/tone
- Maintain consistent coaching style

**Required Tools:**

```typescript
tools: [
  'ingest_journal', // Parse, chunk, embed journal entries
  'query_past_reflections', // RAG over journal corpus
  'extract_themes', // Identify patterns in journals
  'generate_reflection', // Personalized response
  'mood_tracker', // Optional: log daily mood (Phase 2)
  'decision_framework', // Structured decision-making tool
];
```

**Tech Requirements:**

- Document parsing: `pdf-parse`, `mammoth.js` (DOCX), native Node for TXT/MD
- Chunking strategy: 512-token chunks with 64-token overlap
- Embeddings: OpenAI `text-embedding-3-small` (cost-effective for large corpora)
- **CRITICAL:** Journal data MUST be isolated per user at DB level (RLS)

---

## 6. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  Next.js 14 Web App (React + Tailwind + shadcn/ui)          │
│  - Marketing pages                                           │
│  - Auth (Clerk SDK)                                          │
│  - Dashboard                                                 │
│  - 4 Agent UIs with streaming chat                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS + SSE
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    API LAYER (NestJS)                        │
│  - Auth middleware (JWT from Clerk)                          │
│  - Rate limiting & throttling                                │
│  - Request validation (class-validator)                      │
│  - Modules: /auth /users /agents /chat /files /billing      │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
│ Agent        │  │ Background │  │ File       │
│ Orchestrator │  │ Job Queue  │  │ Processor  │
│ (Core Logic) │  │ (BullMQ)   │  │ (Multer)   │
└───────┬──────┘  └─────┬──────┘  └─────┬──────┘
        │               │                │
┌───────▼───────────────▼────────────────▼──────────────────┐
│                   DATA LAYER                               │
│  PostgreSQL 16 + pgvector  |  Redis  |  Cloudflare R2     │
│  (Users, Agents, Chats,    | (Cache, | (Uploaded files)    │
│   Documents, Embeddings)   |  Queue) |                     │
└───────────────────────────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                            │
│  Anthropic Claude API  |  OpenAI Embeddings  |  Stripe   │
│  (Opus 4.7, Sonnet 4.6)|  (text-embedding-3)|  (Billing) │
└──────────────────────────────────────────────────────────┘
```

### Agent Execution Loop

```
User Message
     │
     ▼
[Load User Context] ──► Retrieve conversation history from DB
     │
     ▼
[RAG Retrieval] ──► Query pgvector for relevant documents
     │
     ▼
[Build Prompt] ──► System prompt + history + RAG context + user message
     │
     ▼
[Call Claude API with Tools] ──► Stream response
     │
     ├──► [Tool Use Requested] ──► Execute tool ──► Feed result back ──► Loop
     │
     └──► [Text Response] ──► Stream to client via SSE
     │
     ▼
[Save to DB] ──► Store message + tool calls + final response
     │
     ▼
[Log to Langfuse] ──► Track tokens, latency, cost
```

---

## 7. Technology Stack

### Frontend

| Package                 | Version  | Purpose                      |
| ----------------------- | -------- | ---------------------------- |
| `next`                  | ^14.2.0  | React framework (App Router) |
| `react`                 | ^18.3.0  | UI library                   |
| `typescript`            | ^5.4.0   | Type safety                  |
| `tailwindcss`           | ^3.4.0   | Utility CSS                  |
| `@shadcn/ui`            | latest   | Component library            |
| `@tanstack/react-query` | ^5.0.0   | Server state                 |
| `zustand`               | ^4.5.0   | Client state                 |
| `react-hook-form`       | ^7.51.0  | Forms                        |
| `zod`                   | ^3.22.0  | Schema validation            |
| `lucide-react`          | ^0.370.0 | Icons                        |
| `framer-motion`         | ^11.0.0  | Animations                   |
| `ai`                    | ^3.0.0   | Vercel AI SDK (streaming)    |
| `@clerk/nextjs`         | ^5.0.0   | Auth SDK                     |
| `recharts`              | ^2.12.0  | Charts (trading agent)       |

### Backend

| Package             | Version  | Purpose            |
| ------------------- | -------- | ------------------ |
| `@nestjs/core`      | ^10.3.0  | Backend framework  |
| `@nestjs/common`    | ^10.3.0  | Core decorators    |
| `@nestjs/config`    | ^3.2.0   | Environment config |
| `@nestjs/passport`  | ^10.0.0  | Auth integration   |
| `@nestjs/jwt`       | ^10.2.0  | JWT handling       |
| `@nestjs/swagger`   | ^7.3.0   | API docs           |
| `@nestjs/bull`      | ^10.1.0  | Queue integration  |
| `@nestjs/throttler` | ^5.1.0   | Rate limiting      |
| `prisma`            | ^5.12.0  | ORM                |
| `@prisma/client`    | ^5.12.0  | Prisma runtime     |
| `class-validator`   | ^0.14.0  | DTO validation     |
| `class-transformer` | ^0.5.0   | Object mapping     |
| `bullmq`            | ^5.4.0   | Job queue          |
| `ioredis`           | ^5.3.0   | Redis client       |
| `@anthropic-ai/sdk` | ^0.20.0  | Claude API         |
| `openai`            | ^4.30.0  | Embeddings only    |
| `multer`            | ^1.4.5   | File uploads       |
| `pdf-parse`         | ^1.1.1   | PDF extraction     |
| `mammoth`           | ^1.7.0   | DOCX extraction    |
| `sharp`             | ^0.33.0  | Image processing   |
| `stripe`            | ^14.20.0 | Billing            |
| `helmet`            | ^7.1.0   | Security headers   |

### Infrastructure

| Service                  | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| **PostgreSQL 16**        | Primary database (with pgvector extension) |
| **Redis 7**              | Cache + queue backing store                |
| **Cloudflare R2**        | File storage (S3-compatible, no egress)    |
| **Vercel**               | Frontend deployment                        |
| **Railway**              | Backend deployment                         |
| **Supabase** or **Neon** | Managed Postgres with pgvector             |
| **Upstash Redis**        | Managed Redis                              |
| **Clerk**                | Authentication provider                    |
| **Stripe**               | Payments & subscriptions                   |
| **Langfuse**             | LLM observability                          |
| **Sentry**               | Error tracking                             |
| **PostHog**              | Product analytics                          |

### DevOps

| Tool                    | Purpose                      |
| ----------------------- | ---------------------------- |
| **Turborepo**           | Monorepo build orchestration |
| **pnpm**                | Package manager (workspaces) |
| **Docker**              | Containerization             |
| **GitHub Actions**      | CI/CD                        |
| **ESLint + Prettier**   | Code quality                 |
| **Husky + lint-staged** | Pre-commit hooks             |
| **Vitest**              | Unit testing                 |
| **Playwright**          | E2E testing                  |

---

## 8. Database Schema

### Prisma Schema (`apps/api/prisma/schema.prisma`)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

// ============ USERS ============
model User {
  id            String   @id @default(cuid())
  clerkId       String   @unique
  email         String   @unique
  name          String?
  avatarUrl     String?
  plan          Plan     @default(FREE)
  stripeCustomerId String? @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  agents        UserAgent[]
  conversations Conversation[]
  documents     Document[]
  usageRecords  UsageRecord[]

  @@index([email])
  @@index([clerkId])
}

enum Plan {
  FREE
  STARTER
  PRO
  BUSINESS
}

// ============ AGENTS ============
model Agent {
  id          String    @id @default(cuid())
  type        AgentType @unique
  name        String
  description String
  systemPrompt String   @db.Text
  modelId     String   @default("claude-opus-4-7")
  tools       Json     // Array of tool definitions
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  userAgents  UserAgent[]
  conversations Conversation[]
}

enum AgentType {
  TRADING
  MUSIC
  CONTENT
  LIFE_COACH
}

// ============ USER-AGENT RELATIONSHIP ============
model UserAgent {
  id          String   @id @default(cuid())
  userId      String
  agentId     String
  customConfig Json?   // User-specific overrides
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent       Agent    @relation(fields: [agentId], references: [id])

  @@unique([userId, agentId])
  @@index([userId])
}

// ============ CONVERSATIONS ============
model Conversation {
  id         String   @id @default(cuid())
  userId     String
  agentId    String
  title      String   @default("New Conversation")
  isStarred  Boolean  @default(false)
  isArchived Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent      Agent    @relation(fields: [agentId], references: [id])
  messages   Message[]

  @@index([userId, agentId])
  @@index([updatedAt])
}

// ============ MESSAGES ============
model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String       @db.Text
  toolCalls      Json?        // Array of tool invocations
  toolResults    Json?        // Corresponding tool results
  tokensInput    Int?
  tokensOutput   Int?
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
  TOOL
}

// ============ DOCUMENTS (KNOWLEDGE BASE) ============
model Document {
  id         String      @id @default(cuid())
  userId     String
  agentType  AgentType   // Which agent's KB this belongs to
  filename   String
  mimeType   String
  fileSize   Int
  storageUrl String      // R2 URL
  status     DocStatus   @default(PROCESSING)
  metadata   Json?
  createdAt  DateTime    @default(now())

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  chunks     DocumentChunk[]

  @@index([userId, agentType])
}

enum DocStatus {
  PROCESSING
  INDEXED
  FAILED
}

// ============ VECTOR CHUNKS ============
model DocumentChunk {
  id         String                      @id @default(cuid())
  documentId String
  chunkIndex Int
  content    String                      @db.Text
  embedding  Unsupported("vector(1536)") // OpenAI embedding dimension
  metadata   Json?
  createdAt  DateTime                    @default(now())

  document   Document                    @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
}

// ============ USAGE TRACKING ============
model UsageRecord {
  id            String   @id @default(cuid())
  userId        String
  agentType     AgentType
  tokensInput   Int
  tokensOutput  Int
  costUsd       Decimal  @db.Decimal(10, 6)
  conversationId String?
  createdAt     DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

// ============ TRADING AGENT SPECIFIC ============
model TradingStrategy {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String   @db.Text
  rules       Json     // Structured strategy rules
  createdAt   DateTime @default(now())

  backtests   Backtest[]

  @@index([userId])
}

model Backtest {
  id             String   @id @default(cuid())
  strategyId     String
  symbol         String
  startDate      DateTime
  endDate        DateTime
  initialCapital Decimal  @db.Decimal(15, 2)
  finalCapital   Decimal  @db.Decimal(15, 2)
  winRate        Float
  maxDrawdown    Float
  sharpeRatio    Float?
  totalTrades    Int
  results        Json     // Full trade history
  createdAt      DateTime @default(now())

  strategy       TradingStrategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
}
```

### Required PostgreSQL Extensions

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Row-Level Security (RLS)

**CRITICAL:** Enable RLS on `Document`, `DocumentChunk`, `Message`, `Conversation`, and `TradingStrategy` tables. Users MUST only access their own data.

```sql
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_documents" ON "Document"
  USING (user_id = current_setting('app.current_user_id'));
```

---

## 9. API Specifications

### Base URL

- **Development:** `http://localhost:3001/api/v1`
- **Production:** `https://api.nexa.ai/v1`

### Authentication

All protected routes require: `Authorization: Bearer <CLERK_JWT>`

### Endpoints

#### 🔐 Auth Routes

```
POST   /auth/sync              Sync Clerk user to DB after signup
GET    /auth/me                Get current user profile
PATCH  /auth/me                Update user profile
DELETE /auth/me                Delete account + all data
```

#### 🤖 Agent Routes

```
GET    /agents                 List all available agents
GET    /agents/:type           Get specific agent config
GET    /agents/:type/status    Check if user has access to agent
```

#### 💬 Conversation Routes

```
GET    /conversations                       List user's conversations (filter by agent)
POST   /conversations                       Create new conversation
GET    /conversations/:id                   Get conversation with messages
PATCH  /conversations/:id                   Update (rename, star, archive)
DELETE /conversations/:id                   Delete conversation
POST   /conversations/:id/messages          Send message (returns SSE stream)
GET    /conversations/:id/export            Export as Markdown
```

#### 📄 Document Routes

```
GET    /documents                    List user's documents (filter by agent)
POST   /documents/upload             Upload file (multipart/form-data)
GET    /documents/:id                Get document details
DELETE /documents/:id                Delete document + chunks
POST   /documents/:id/reindex        Reprocess embeddings
```

#### 📊 Trading Agent Routes

```
GET    /trading/strategies                  List user's strategies
POST   /trading/strategies                  Create strategy
GET    /trading/strategies/:id              Get strategy
DELETE /trading/strategies/:id              Delete strategy
POST   /trading/backtests                   Run backtest (async job)
GET    /trading/backtests/:id               Get backtest results
GET    /trading/backtests/:id/status        Check backtest job status
```

#### 💳 Billing Routes

```
GET    /billing/plans                Get available plans
POST   /billing/checkout             Create Stripe checkout session
POST   /billing/portal               Create Stripe customer portal session
GET    /billing/usage                Get current month usage
POST   /billing/webhook              Stripe webhook handler
```

#### 📈 Admin Routes (require admin role)

```
GET    /admin/users                  List all users (paginated)
GET    /admin/users/:id              Get user details + usage
GET    /admin/stats                  Platform-wide stats
GET    /admin/agents/usage           Agent usage analytics
```

### Example: Send Message (SSE Stream)

**Request:**

```http
POST /api/v1/conversations/conv_abc123/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Backtest my RSI strategy on BTC for 2023",
  "attachments": []
}
```

**Response (SSE Stream):**

```
event: message_start
data: {"messageId":"msg_xyz"}

event: content_delta
data: {"delta":"I'll run the backtest for you."}

event: tool_use
data: {"tool":"run_backtest","input":{"symbol":"BTC","strategy":"RSI"}}

event: tool_result
data: {"result":{"winRate":0.62,"drawdown":0.18}}

event: content_delta
data: {"delta":" Your strategy achieved 62% win rate..."}

event: message_end
data: {"tokensInput":1234,"tokensOutput":567}
```

---

## 10. Feature Requirements

### F-001: User Authentication

**Priority:** P0 — MUST HAVE
**Dependencies:** Clerk setup
**Estimated Effort:** 2 days

**Description:** Secure user authentication via Clerk with email/password, Google, and GitHub SSO.

**Acceptance Criteria:**

- [ ] Users can sign up with email + password
- [ ] Users can sign in with Google OAuth
- [ ] Users can sign in with GitHub OAuth
- [ ] MFA support via Clerk
- [ ] Password reset flow works
- [ ] Session management with secure cookies
- [ ] User data synced to our DB on first sign-in
- [ ] Sign-out invalidates session

**Technical Directives:**

- Use `@clerk/nextjs` middleware
- Webhook endpoint for `user.created`, `user.updated`, `user.deleted`
- Never store passwords — Clerk handles all auth

---

### F-002: Admin Dashboard

**Priority:** P1 — SHOULD HAVE
**Dependencies:** F-001, F-009
**Estimated Effort:** 3 days

**Description:** Admin-only dashboard showing platform-wide metrics.

**Acceptance Criteria:**

- [ ] Admin role check via Clerk metadata
- [ ] View all users with pagination and search
- [ ] View user details: plan, usage, conversations count
- [ ] View agent usage analytics (calls per agent per day)
- [ ] View token consumption and cost per user
- [ ] View platform-wide stats (DAU, MAU, revenue)
- [ ] Export user data to CSV

---

### F-003: Per-Agent Workspace

**Priority:** P0
**Dependencies:** F-001
**Estimated Effort:** 4 days

**Description:** Each agent has a dedicated UI with isolated chat history, file library, and settings.

**Acceptance Criteria:**

- [ ] Left sidebar with 4 agent tabs (Trading, Music, Content, Life Coach)
- [ ] Selecting an agent shows only that agent's conversations
- [ ] Each agent has independent file library
- [ ] Agent-specific settings accessible
- [ ] URL routing: `/agents/trading`, `/agents/music`, etc.
- [ ] Loading states for each agent switch
- [ ] Empty state for new agents

---

### F-004: File Upload & Parsing

**Priority:** P0
**Dependencies:** Cloudflare R2 setup
**Estimated Effort:** 4 days

**Description:** Users upload files which are parsed, chunked, embedded, and indexed per agent.

**Acceptance Criteria:**

- [ ] Supported formats: PDF, DOCX, TXT, MD, CSV
- [ ] Max file size: 50 MB per file
- [ ] Max files per user: 100 (free), unlimited (paid)
- [ ] Files stored in Cloudflare R2 with tenant-scoped keys
- [ ] Background job extracts text (BullMQ)
- [ ] Text chunked at 512 tokens with 64-token overlap
- [ ] Embeddings generated via OpenAI `text-embedding-3-small`
- [ ] Chunks stored in `DocumentChunk` table with pgvector
- [ ] User sees processing status (PROCESSING → INDEXED → FAILED)
- [ ] Users can delete files (cascade deletes chunks)

**Technical Directives:**

- Use `@nestjs/bull` queue: `file-processing`
- Store R2 keys as: `users/{userId}/agents/{agentType}/{fileId}.{ext}`
- Compute embeddings in parallel with batch size 20
- Retry failed jobs 3 times with exponential backoff

---

### F-005: Streaming Chat

**Priority:** P0
**Dependencies:** F-003, Claude API
**Estimated Effort:** 6 days

**Description:** Real-time streaming chat with tool-use visualization.

**Acceptance Criteria:**

- [ ] Messages stream token-by-token via SSE
- [ ] Tool calls visualized inline (expandable cards)
- [ ] Tool results displayed cleanly
- [ ] Support for message cancellation
- [ ] First-token latency < 2 seconds
- [ ] Auto-scroll to bottom on new messages
- [ ] Markdown rendering (code blocks, lists, tables)
- [ ] Copy-to-clipboard button on messages
- [ ] Regenerate response button
- [ ] Error states for failed messages

**Technical Directives:**

- Use Vercel AI SDK `useChat()` hook on frontend
- NestJS endpoint returns `Observable<MessageEvent>` for SSE
- Implement agent loop: think → tool_use → observe → repeat
- Max 10 tool call iterations per message (prevent infinite loops)
- Log every step to Langfuse with trace ID

---

### F-006: Chat History Management

**Priority:** P0
**Dependencies:** F-005
**Estimated Effort:** 2 days

**Description:** Persistent conversation storage with search, star, archive, export.

**Acceptance Criteria:**

- [ ] All conversations auto-saved to DB
- [ ] Users can rename conversations
- [ ] Users can star conversations
- [ ] Users can archive (soft delete) conversations
- [ ] Search conversations by title or content
- [ ] Export as Markdown (single conversation)
- [ ] Export all conversations (ZIP of MDs)
- [ ] Conversation list sorted by last updated

---

### F-007: Agent-Specific Tools

**Priority:** P0
**Dependencies:** F-005
**Estimated Effort:** 8 days (2 days per agent)

**Description:** Each agent has custom tools implemented as NestJS services.

**Acceptance Criteria:**

- [ ] Trading: backtester, metrics calculator, strategy comparator
- [ ] Music: reference search (Spotify), sample search (Freesound)
- [ ] Content: brand voice RAG, content calendar generator
- [ ] Life Coach: journal RAG, theme extractor, reflection generator
- [ ] Tools follow Anthropic's JSON schema format
- [ ] Each tool has input validation via Zod
- [ ] Tools return structured JSON responses
- [ ] Errors gracefully handled and returned to Claude

**Technical Directives:**

- Create `ToolRegistry` service in NestJS
- Each tool implements `ITool` interface:
  ```typescript
  interface ITool {
    name: string;
    description: string;
    inputSchema: JSONSchema;
    execute(input: unknown, context: ToolContext): Promise<unknown>;
  }
  ```

---

### F-008: Knowledge Base Editor

**Priority:** P1
**Dependencies:** F-004
**Estimated Effort:** 2 days

**Description:** UI for users to view, edit, delete documents in their agent knowledge bases.

**Acceptance Criteria:**

- [ ] List all documents per agent
- [ ] Preview document content
- [ ] Delete individual documents
- [ ] Bulk delete selection
- [ ] Show indexing status
- [ ] Re-index failed documents
- [ ] Display total storage used

---

### F-009: Usage & Billing

**Priority:** P0
**Dependencies:** F-001, Stripe setup
**Estimated Effort:** 4 days

**Description:** Token metering, Stripe subscription billing, tier enforcement.

**Acceptance Criteria:**

- [ ] Pricing tiers defined:
  - **Free:** 100k tokens/month, 1 agent, 10 files
  - **Starter ($19/mo):** 1M tokens, 2 agents, 50 files
  - **Pro ($49/mo):** 5M tokens, all 4 agents, 500 files
  - **Business ($149/mo):** 20M tokens, all agents, unlimited files
- [ ] Stripe Checkout for subscription signup
- [ ] Stripe Customer Portal for plan management
- [ ] Usage dashboard shows current consumption
- [ ] Hard cutoff when tokens exhausted
- [ ] Email notifications at 80% and 100% usage
- [ ] Webhook handles plan upgrades/downgrades

---

## 11. User Flows

### Flow 1: First-Time User Onboarding

```
1. Visit nexa.ai
2. Click "Get Started"
3. Sign up with Google (Clerk)
4. Auto-redirect to /onboarding
5. Select primary use case (Trading/Music/Content/Coaching)
6. Dashboard loaded with recommended agent highlighted
7. User sends first message → free tier initialized
```

### Flow 2: Uploading Knowledge to Life Coach Agent

```
1. Navigate to /agents/life-coach
2. Click "Knowledge Base" tab
3. Drag & drop journal PDFs
4. Files uploaded to R2 → status: PROCESSING
5. Background job extracts text & generates embeddings
6. Status changes to INDEXED
7. User starts chat — agent now references journals via RAG
```

### Flow 3: Running a Backtest

```
1. Navigate to /agents/trading
2. Click "New Strategy" → upload CSV with rules
3. Upload historical OHLCV data (BTC 2023)
4. Type: "Backtest my strategy on this data"
5. Agent calls run_backtest tool
6. Background job executes deterministic backtest
7. Results streamed back with chart visualization
8. User asks: "How can I improve win rate?"
9. Agent analyzes results & suggests modifications
```

---

## 12. Security Requirements

### Authentication & Authorization

- All API routes (except public) require Clerk JWT
- JWTs validated on every request via NestJS guard
- Admin routes check `publicMetadata.role === 'admin'`

### Data Isolation

- PostgreSQL RLS on all user-owned tables
- R2 storage keys scoped by user ID
- pgvector queries filtered by `user_id` AND `agent_type`
- **NEVER** allow cross-user data leakage

### Input Validation

- All DTOs use `class-validator`
- File uploads: MIME type whitelist, size limits
- SQL injection prevention via Prisma parameterized queries
- XSS prevention: sanitize user content with DOMPurify

### Rate Limiting

- Global: 100 req/min per IP
- Per-user: 60 req/min
- Per-endpoint overrides for expensive operations
- Use `@nestjs/throttler`

### Secrets Management

- All secrets in `.env` (never committed)
- Production secrets in Vercel/Railway environment variables
- Rotate Claude API keys quarterly

### Compliance

- GDPR: Users can export & delete all data (F-001 DELETE /auth/me)
- Data retention: Deleted accounts purged after 30 days
- Privacy policy + ToS displayed on signup

---

## 13. Performance Requirements

| Metric                      | Target         | Measurement |
| --------------------------- | -------------- | ----------- |
| First-token latency         | < 2s           | P95         |
| API response time (non-LLM) | < 200ms        | P95         |
| Page load (LCP)             | < 2.5s         | Lighthouse  |
| Time to Interactive         | < 3.5s         | Lighthouse  |
| Uptime SLA                  | 99.9%          | Monthly     |
| Database query time         | < 100ms        | P95         |
| File upload processing      | < 30s for 10MB | Average     |
| Vector search               | < 200ms        | P95         |
| Concurrent users            | 1000+          | Load test   |

---

## 14. Project Structure

### Monorepo Layout (Turborepo)

```
nexa/
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (marketing)/          # Public pages
│   │   │   │   ├── page.tsx          # Landing page
│   │   │   │   ├── pricing/
│   │   │   │   └── about/
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/
│   │   │   │   └── sign-up/
│   │   │   ├── (dashboard)/          # Authenticated
│   │   │   │   ├── layout.tsx        # Sidebar + topbar
│   │   │   │   ├── dashboard/
│   │   │   │   ├── agents/
│   │   │   │   │   ├── trading/
│   │   │   │   │   ├── music/
│   │   │   │   │   ├── content/
│   │   │   │   │   └── life-coach/
│   │   │   │   ├── settings/
│   │   │   │   └── billing/
│   │   │   ├── admin/                # Admin routes
│   │   │   ├── api/                  # API proxies
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn components
│   │   │   ├── chat/
│   │   │   ├── agents/
│   │   │   ├── files/
│   │   │   └── shared/
│   │   ├── lib/
│   │   │   ├── api.ts                # API client
│   │   │   ├── hooks/
│   │   │   └── utils.ts
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   └── pipes/
│       │   ├── config/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   └── auth.module.ts
│       │   │   ├── users/
│       │   │   ├── agents/
│       │   │   │   ├── trading/
│       │   │   │   │   ├── trading.controller.ts
│       │   │   │   │   ├── trading.service.ts
│       │   │   │   │   ├── backtester.service.ts
│       │   │   │   │   └── tools/
│       │   │   │   ├── music/
│       │   │   │   ├── content/
│       │   │   │   └── life-coach/
│       │   │   ├── chat/
│       │   │   │   ├── chat.controller.ts
│       │   │   │   ├── chat.service.ts
│       │   │   │   ├── claude-orchestrator.service.ts
│       │   │   │   └── sse.service.ts
│       │   │   ├── documents/
│       │   │   │   ├── documents.controller.ts
│       │   │   │   ├── documents.service.ts
│       │   │   │   ├── embedding.service.ts
│       │   │   │   └── processors/
│       │   │   ├── billing/
│       │   │   └── admin/
│       │   └── shared/
│       │       ├── prisma/
│       │       ├── claude/
│       │       ├── redis/
│       │       └── storage/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── test/
│       ├── package.json
│       ├── nest-cli.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── agents.ts
│   │   │   ├── chat.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── validators/                   # Shared Zod schemas
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── config/                       # Shared configs
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   └── ui/                           # Shared UI (optional)
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-web.yml
│       └── deploy-api.yml
│
├── docker/
│   ├── postgres.Dockerfile
│   └── docker-compose.yml
│
├── docs/
│   ├── NEXA-PRD.md                   # This document
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── scripts/
│   ├── setup.sh
│   └── seed-db.ts
│
├── .env.example
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
└── README.md
```

### Environment Variables (`.env.example`)

```bash
# ============ DATABASE ============
DATABASE_URL="postgresql://user:pass@localhost:5432/nexa"
REDIS_URL="redis://localhost:6379"

# ============ AUTHENTICATION ============
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# ============ AI PROVIDERS ============
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# ============ STORAGE ============
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="nexa-files"
R2_PUBLIC_URL="https://files.nexa.ai"

# ============ BILLING ============
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ============ OBSERVABILITY ============
LANGFUSE_SECRET_KEY="..."
LANGFUSE_PUBLIC_KEY="..."
SENTRY_DSN="..."
POSTHOG_KEY="..."

# ============ EXTERNAL APIS ============
SPOTIFY_CLIENT_ID="..."
SPOTIFY_CLIENT_SECRET="..."
FREESOUND_API_KEY="..."

# ============ APP ============
NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_PORT=3001
NODE_ENV="development"
```

---

## 15. Development Roadmap

### Phase 1: Foundation (Weeks 1–2)

- [ ] Initialize Turborepo monorepo
- [ ] Scaffold Next.js 14 web app with Tailwind + shadcn
- [ ] Scaffold NestJS API with Prisma
- [ ] Set up PostgreSQL + pgvector via Docker
- [ ] Integrate Clerk authentication
- [ ] Configure CI/CD (GitHub Actions)
- [ ] Deploy skeleton to Vercel + Railway
- [ ] Set up shared packages (types, validators, config)

**Deliverable:** Working monorepo with auth, empty dashboard, deployed to staging.

---

### Phase 2: Agent Core (Weeks 3–4)

- [ ] Build Claude orchestration service (NestJS)
- [ ] Implement agent loop with Claude Agent SDK
- [ ] Build SSE streaming infrastructure
- [ ] Create tool registry and execution framework
- [ ] Build RAG pipeline (chunking, embedding, retrieval)
- [ ] Implement file upload + R2 integration
- [ ] Build reusable chat UI component

**Deliverable:** Generic chat interface with streaming + tool use working with a single mock agent.

---

### Phase 3: The Four Agents (Weeks 5–9)

**Week 5 — Trading Agent:**

- [ ] Build backtesting engine
- [ ] Implement trading tools
- [ ] Design trading dashboard UI
- [ ] Integrate Recharts for performance viz

**Week 6 — Content Agent:**

- [ ] Implement brand voice RAG
- [ ] Build content generation tools
- [ ] Design content dashboard UI
- [ ] Add content calendar component

**Week 7 — Life Coach Agent:**

- [ ] Implement journal parsing (PDF, DOCX, TXT, MD)
- [ ] Build journal RAG with theme extraction
- [ ] Design coach dashboard UI
- [ ] Add reflection history view

**Week 8 — Music Agent:**

- [ ] Integrate Spotify API
- [ ] Integrate Freesound.org API
- [ ] Build music suggestion tools
- [ ] Design music dashboard UI

**Week 9 — Integration & Polish:**

- [ ] Unified agent switcher
- [ ] Cross-agent conversation history
- [ ] Performance optimization
- [ ] Bug fixes

**Deliverable:** All four agents fully functional with dedicated UIs.

---

### Phase 4: Production Polish (Weeks 10–12)

- [ ] Build admin dashboard
- [ ] Integrate Stripe billing + webhooks
- [ ] Implement usage tracking + limits
- [ ] Add Langfuse observability
- [ ] Set up Sentry error tracking
- [ ] Security audit + penetration testing
- [ ] Performance testing (k6 load tests)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Full QA pass

**Deliverable:** Production-ready application with billing and observability.

---

### Phase 5: Launch (Weeks 13–14)

- [ ] Private beta with 10 users
- [ ] Feedback iteration cycle
- [ ] Marketing site finalization
- [ ] Documentation site (Mintlify or Nextra)
- [ ] Load testing at scale
- [ ] Public production launch

**Deliverable:** 🚀 Nexa live in production.

---

## 16. Testing Strategy

### Unit Tests (Vitest)

- **Coverage target:** 80%
- Test all services in isolation
- Mock external APIs (Claude, Stripe, R2)
- Test tool execution logic

### Integration Tests

- Test full API endpoints with test DB
- Test Prisma queries
- Test authentication flow

### E2E Tests (Playwright)

- User signup → agent interaction flow
- File upload → RAG query flow
- Billing upgrade flow

### Load Tests (k6)

- 1000 concurrent users
- 100 simultaneous streaming chats
- Measure first-token latency under load

---

## 17. Deployment & DevOps

### Environments

| Environment    | Frontend        | Backend             | Database        |
| -------------- | --------------- | ------------------- | --------------- |
| **Local**      | localhost:3000  | localhost:3001      | Docker Postgres |
| **Staging**    | staging.nexa.ai | api-staging.nexa.ai | Neon branch     |
| **Production** | nexa.ai         | api.nexa.ai         | Neon main       |

### CI/CD Pipeline

**On PR:**

1. Lint (ESLint + Prettier)
2. Type check (TypeScript)
3. Unit tests (Vitest)
4. Build check (Turborepo)

**On merge to `main`:**

1. Run full test suite
2. Deploy to staging
3. Run E2E tests against staging
4. Manual approval
5. Deploy to production

### Monitoring

- **Uptime:** Better Stack (5-min pings)
- **Errors:** Sentry
- **LLM:** Langfuse (traces, costs, latency)
- **Analytics:** PostHog
- **Logs:** Vercel logs + Railway logs

---

## 18. Risks & Mitigations

| Risk                                     | Severity  | Mitigation                                                                            |
| ---------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| Claude API costs spiral                  | 🔴 High   | Token metering per user, tier quotas, prompt caching, Haiku fallback for simple tasks |
| Privacy leakage between agents           | 🔴 High   | PostgreSQL RLS, tenant-scoped pgvector namespaces, audit logs                         |
| Long-running agent loops block responses | 🟡 Medium | BullMQ background jobs, SSE streaming, 10-iteration tool-call cap, user cancellation  |
| Trading agent hallucinates numbers       | 🔴 High   | Deterministic backtest engine; Claude interprets results only                         |
| Scope creep during build                 | 🟡 Medium | Feature freeze after Phase 2, defer additions to v2 roadmap                           |
| Vendor lock-in to Anthropic              | 🟢 Low    | Abstract LLM calls behind interface; OpenAI fallback ready                            |
| File processing OOM on large uploads     | 🟡 Medium | Stream file parsing, 50 MB limit, worker memory monitoring                            |
| Stripe webhook failures                  | 🟡 Medium | Idempotent handlers, retry queue, dead-letter queue                                   |

---

## 19. Out of Scope for v1

1. ❌ Native mobile apps (iOS/Android)
2. ❌ Live trading execution or broker integrations
3. ❌ Multi-user workspaces or team collaboration
4. ❌ Custom user-defined agents
5. ❌ Voice input/output interfaces
6. ❌ Public API or webhooks
7. ❌ Zapier/Make.com integrations
8. ❌ Agent-to-agent communication
9. ❌ On-premise or self-hosted deployment
10. ❌ White-label reseller program

These are explicit **v2+** features.

---

## 20. Open Questions

Items requiring client (product owner) input before build starts:

1. **Pricing Model:** Confirm tier structure and pricing points
2. **Domain:** Finalize domain (nexa.ai vs nexa.app vs getnexa.com)
3. **Market Data Source:** Alpha Vantage vs Polygon.io vs Yahoo Finance for Trading agent
4. **Geographic Scope:** US-only launch or global? (Affects GDPR compliance)
5. **Branding:** Final logo and visual identity direction
6. **Beta User Pool:** Identify 10 beta users for Phase 5

---

## 21. Developer Information

### Lead Developer

**Name:** Engr. Mejba Ahmed
**Website:** [https://www.mejba.me/](https://www.mejba.me/)
**Role:** Full-Stack AI Developer & Software Engineer

### Credentials

- B.Sc. in Computer Science & Engineering
- AWS Certified Cloud Practitioner
- Anthropic Certified — Claude Code in Action (March 2026)
- 10+ years of full-stack development experience
- 160+ completed client projects

### Specializations

- Full-stack web development (WordPress, Laravel, Next.js, NestJS)
- AI agent and agentic workflow development (Claude Code, Claude Agent SDK)
- SaaS/dashboard development
- AWS cloud infrastructure
- SEO content systems and AI-powered automation

### Portfolio Products

- Rendrix — Multi-tenant E-Commerce Dashboard
- Tube2Blog.ai — AI SaaS Landing Page & Dashboard
- BrandFlow AI — Social Media Automation Platform
- VendorShield AI — Third-Party Risk Management Platform
- Replix — AI-Powered Content Repurposing Platform
- RevSignal AI — Predictive Revenue Intelligence

### Contact

- **Portfolio:** [https://www.mejba.me/](https://www.mejba.me/)

---

## 📜 Document History

| Version | Date           | Author            | Changes     |
| ------- | -------------- | ----------------- | ----------- |
| 1.0     | April 24, 2026 | Engr. Mejba Ahmed | Initial PRD |

---

## 🚀 Ready to Build

This PRD is the single source of truth for Nexa development. AI coding agents should:

1. Read this document in full before writing any code
2. Follow the tech stack in Section 7 exactly
3. Implement the database schema in Section 8 before any features
4. Build features in the priority order defined in Section 10
5. Reference feature IDs (F-001, F-002, etc.) in all commits
6. Flag any ambiguity as a new "Open Question" rather than guessing

**When in doubt, paraphrase is better than a bad assumption.**

---

**End of Document**

_Nexa — One platform. Infinite intelligence._
_Built with Claude. Shipped by Engr. Mejba Ahmed._
