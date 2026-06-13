-- Telegram messages table for storing conversations
CREATE TABLE telegram_messages (
    id SERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    chat_id BIGINT NOT NULL,
    user_id BIGINT,
    username VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    message_text TEXT,
    is_from_bot BOOLEAN DEFAULT false,
    is_reply_to_admin BOOLEAN DEFAULT false,
    replied_by INTEGER REFERENCES admin_users(id),
    replied_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_telegram_messages_chat ON telegram_messages(chat_id);
CREATE INDEX idx_telegram_messages_status ON telegram_messages(status);
CREATE INDEX idx_telegram_messages_created ON telegram_messages(created_at);
