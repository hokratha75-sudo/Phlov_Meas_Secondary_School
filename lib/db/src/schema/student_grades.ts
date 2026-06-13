import { pgTable, serial, integer, varchar, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { students } from "./students";
import { classrooms } from "./classrooms";

export const studentGrades = pgTable("student_grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  classroomId: integer("classroom_id").references(() => classrooms.id).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(), // e.g., "2024-2025"
  examPeriod: varchar("exam_period", { length: 50 }).notNull(), // e.g., "October", "Semester 1"
  scores: jsonb("scores").$type<Record<string, number>>().notNull(), // { "math": 95, "khmer": 88 }
  totalScore: real("total_score"),
  average: real("average"),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import { relations } from "drizzle-orm";
export const studentGradesRelations = relations(studentGrades, ({ one }) => ({
  student: one(students, {
    fields: [studentGrades.studentId],
    references: [students.id],
  }),
  classroom: one(classrooms, {
    fields: [studentGrades.classroomId],
    references: [classrooms.id],
  }),
}));
