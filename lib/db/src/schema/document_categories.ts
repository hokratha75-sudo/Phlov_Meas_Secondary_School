import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const documentCategories = pgTable("document_categories", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameKh: text("name_kh").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
