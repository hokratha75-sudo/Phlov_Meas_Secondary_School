import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleKh: text("title_kh").notNull(),
  contentEn: text("content_en").notNull(),
  contentKh: text("content_kh").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("general"),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
