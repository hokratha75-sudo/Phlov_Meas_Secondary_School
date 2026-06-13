import { pgTable, serial, text, timestamp, boolean, integer, bigint, varchar } from "drizzle-orm/pg-core";
import { adminUsers } from "./admin";

export const telegramMessages = pgTable("telegram_messages", {
  id: serial("id").primaryKey(),
  messageId: bigint("message_id", { mode: 'number' }).notNull(),
  chatId: bigint("chat_id", { mode: 'number' }).notNull(),
  userId: bigint("user_id", { mode: 'number' }),
  username: varchar("username", { length: 100 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  messageText: text("message_text"),
  isFromBot: boolean("is_from_bot").default(false),
  isReplyToAdmin: boolean("is_reply_to_admin").default(false),
  repliedBy: integer("replied_by").references(() => adminUsers.id),
  repliedAt: timestamp("replied_at"),
  status: varchar("status", { length: 20 }).default("received"),
  createdAt: timestamp("created_at").defaultNow(),
});
