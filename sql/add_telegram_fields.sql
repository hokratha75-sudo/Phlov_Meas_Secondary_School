-- ============================================================================
-- Pro-Max Telegram Integration — Database Migration
-- Run this on your PostgreSQL database to add Telegram linking support
-- ============================================================================

-- 1. Add Telegram linking fields to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT UNIQUE;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS telegram_link_code VARCHAR(20);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS telegram_linked_at TIMESTAMP;

-- 2. Create telegram message log table for delivery tracking
CREATE TABLE IF NOT EXISTS telegram_message_log (
  id SERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'broadcast',
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Create index on message log for efficient querying
CREATE INDEX IF NOT EXISTS idx_telegram_message_log_sent_at ON telegram_message_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_message_log_status ON telegram_message_log(status);
CREATE INDEX IF NOT EXISTS idx_teachers_telegram_chat_id ON teachers(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
