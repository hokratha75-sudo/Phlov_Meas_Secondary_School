import { pgTable, serial, timestamp, varchar, integer, jsonb, bigint } from "drizzle-orm/pg-core";

export const telegramSessions = pgTable("telegram_sessions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: 'number' }).notNull(),
  chatId: bigint("chat_id", { mode: 'number' }).notNull(),
  command: varchar("command", { length: 50 }),
  step: varchar("step", { length: 50 }),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
