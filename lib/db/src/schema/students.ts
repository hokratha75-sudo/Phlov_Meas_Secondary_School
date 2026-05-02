import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameKh: text("name_kh").notNull(),
  grade: text("grade").notNull(),
  gender: text("gender").notNull(),
  enrollmentYear: integer("enrollment_year").notNull(),
  phone: text("phone"),
  parentPhone: text("parent_phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
