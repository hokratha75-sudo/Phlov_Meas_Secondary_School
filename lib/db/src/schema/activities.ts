import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleKh: text("title_kh").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionKh: text("description_kh").notNull(),
  category: text("category").notNull().default("general"),
  imageUrl: text("image_url"),
  eventDate: text("event_date").notNull(),
  likes: integer("likes").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
