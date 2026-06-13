import { pgTable, serial, integer, varchar, timestamp, numeric, unique } from "drizzle-orm/pg-core";
import { students } from "./students";
import { classrooms } from "./classrooms";
import { relations } from "drizzle-orm";

export const studentMonthlyScores = pgTable("student_monthly_scores", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  classId: integer("class_id").references(() => classrooms.id).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  month: varchar("month", { length: 50 }).notNull(), // e.g., "November"
  subject: varchar("subject", { length: 50 }).notNull(), // e.g., "math"
  score: numeric("score", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Composite unique constraint for efficient upsert logic
  unq: unique().on(table.studentId, table.academicYear, table.month, table.subject),
}));

export const studentMonthlyScoresRelations = relations(studentMonthlyScores, ({ one }) => ({
  student: one(students, {
    fields: [studentMonthlyScores.studentId],
    references: [students.id],
  }),
  classroom: one(classrooms, {
    fields: [studentMonthlyScores.classId],
    references: [classrooms.id],
  }),
}));
