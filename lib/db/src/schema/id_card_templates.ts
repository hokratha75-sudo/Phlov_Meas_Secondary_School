import { pgTable, text, timestamp, jsonb, serial } from "drizzle-orm/pg-core";

export const idCardTemplates = pgTable("id_card_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  baseStyle: text("baseStyle").notNull().default("classic"),
  config: jsonb("config").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
