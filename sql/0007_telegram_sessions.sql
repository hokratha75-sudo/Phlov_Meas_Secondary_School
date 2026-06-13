-- បង្កើតតារាងសម្រាប់រក្សាទុក session state (បើមិនទាន់មាន)
CREATE TABLE IF NOT EXISTS telegram_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chat_id BIGINT NOT NULL,
    command VARCHAR(50),
    step VARCHAR(50),
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telegram_sessions_user ON telegram_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat ON telegram_sessions(chat_id);
