import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameKh: text("name_kh").notNull(),
  subjectEn: text("subject_en").notNull(),
  subjectKh: text("subject_kh").notNull(),
  photoUrl: text("photo_url"),
  bioEn: text("bio_en"),
  bioKh: text("bio_kh"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
