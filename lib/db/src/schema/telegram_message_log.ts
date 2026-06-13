import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const telegramMessageLog = pgTable("telegram_message_log", {
  id: serial("id").primaryKey(),
  channelId: text("channel_id").notNull(),
  messageText: text("message_text").notNull(),
  messageType: text("message_type").notNull().default("broadcast"), // broadcast | dm | announcement | notification
  status: text("status").notNull().default("sent"), // sent | failed | pending
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});
