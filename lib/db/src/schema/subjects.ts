import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameKh: text("name_kh").notNull(),
  code: text("code"), // e.g., "MATH", "KHM"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
