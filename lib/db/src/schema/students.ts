import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { disciplineLogs } from "./discipline_logs";
import { libraryLogs } from "./library_logs";
import { studentCleaningSchedules } from "./cleaning_schedules";
import { classrooms } from "./classrooms";
import { parents } from "./parents";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameKh: text("name_kh").notNull(),
  grade: text("grade").notNull(),
  classId: integer("class_id").references(() => classrooms.id), // Link to classroom
  gender: text("gender").notNull(),
  enrollmentYear: integer("enrollment_year").notNull(),
  phone: text("phone"),
  parentPhone: text("parent_phone"),
  address: text("address"),
  
  // Student status: active, dropped, transferred
  status: text("status").notNull().default("active"),

  // Telegram Linking for Students
  telegramChatId: integer("telegram_chat_id"),
  telegramLinkCode: text("telegram_link_code"),
  telegramLinkedAt: timestamp("telegram_linked_at"),

  // ព័ត៌មានបន្ថែមសម្រាប់សៀវភៅសិក្ខាគារិក (Administrative Fields)
  photoUrl: text("photo_url"),
  biography: text("biography"),
  familyStatus: text("family_status"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studentsRelations = relations(students, ({ one, many }) => ({
  disciplineLogs: many(disciplineLogs),
  libraryLogs: many(libraryLogs),
  cleaningSchedules: many(studentCleaningSchedules),
  parents: many(parents),
  classroom: one(classrooms, {
    fields: [students.classId],
    references: [classrooms.id],
  }),
}));

