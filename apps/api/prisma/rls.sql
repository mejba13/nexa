-- Nexa — Row-Level Security policies (PRD §12)
-- Apply after `prisma migrate dev` creates tables. Either:
--   (a) run this file with `psql $DATABASE_URL -f prisma/rls.sql`, or
--   (b) copy it into an empty migration created via `prisma migrate dev --create-only`.
--
-- The API binds the current user per request via `PrismaService.runAsUser(userId, fn)`,
-- which runs `SELECT set_config('app.current_user_id', $1, true)` inside a transaction.

-- Helper: read current user id, falling back to empty string (denies everything).
CREATE OR REPLACE FUNCTION current_nexa_user_id() RETURNS text
  LANGUAGE sql STABLE AS $$
    SELECT COALESCE(current_setting('app.current_user_id', true), '')
  $$;

-- ============ DOCUMENT ============
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_documents ON "Document";
CREATE POLICY users_own_documents ON "Document"
  USING ("userId" = current_nexa_user_id())
  WITH CHECK ("userId" = current_nexa_user_id());

-- ============ DOCUMENT CHUNK ============
ALTER TABLE "DocumentChunk" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_chunks ON "DocumentChunk";
CREATE POLICY users_own_chunks ON "DocumentChunk"
  USING (
    EXISTS (
      SELECT 1 FROM "Document" d
      WHERE d.id = "DocumentChunk"."documentId"
        AND d."userId" = current_nexa_user_id()
    )
  );

-- ============ CONVERSATION ============
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_conversations ON "Conversation";
CREATE POLICY users_own_conversations ON "Conversation"
  USING ("userId" = current_nexa_user_id())
  WITH CHECK ("userId" = current_nexa_user_id());

-- ============ MESSAGE ============
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_messages ON "Message";
CREATE POLICY users_own_messages ON "Message"
  USING (
    EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "Message"."conversationId"
        AND c."userId" = current_nexa_user_id()
    )
  );

-- ============ TRADING STRATEGY ============
ALTER TABLE "TradingStrategy" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_strategies ON "TradingStrategy";
CREATE POLICY users_own_strategies ON "TradingStrategy"
  USING ("userId" = current_nexa_user_id())
  WITH CHECK ("userId" = current_nexa_user_id());

-- ============ BACKTEST ============
ALTER TABLE "Backtest" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_backtests ON "Backtest";
CREATE POLICY users_own_backtests ON "Backtest"
  USING (
    EXISTS (
      SELECT 1 FROM "TradingStrategy" s
      WHERE s.id = "Backtest"."strategyId"
        AND s."userId" = current_nexa_user_id()
    )
  );

-- ============ USAGE RECORD ============
ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_usage ON "UsageRecord";
CREATE POLICY users_own_usage ON "UsageRecord"
  USING ("userId" = current_nexa_user_id())
  WITH CHECK ("userId" = current_nexa_user_id());
