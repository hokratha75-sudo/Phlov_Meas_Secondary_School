import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { students } from "./students";
import { classrooms } from "./classrooms";

export const studentAttendance = pgTable("student_attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  classroomId: integer("classroom_id")
    .references(() => classrooms.id, { onDelete: "cascade" })
    .notNull(),
  academicYear: text("academic_year").notNull(), // e.g., "2024-2025"
  date: text("date").notNull(), // ISO format date string "YYYY-MM-DD"
  shift: text("shift").notNull(), // "morning" | "afternoon"
  subject: text("subject").notNull(), // e.g., "math", "physics"
  status: text("status").notNull().default("present"), // "present" | "excused" | "unexcused"
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure we don't have multiple attendance entries for the same student on the same date/shift/subject
  unq: unique().on(table.studentId, table.date, table.shift, table.subject),
}));

export const studentAttendanceRelations = relations(studentAttendance, ({ one }) => ({
  student: one(students, {
    fields: [studentAttendance.studentId],
    references: [students.id],
  }),
  classroom: one(classrooms, {
    fields: [studentAttendance.classroomId],
    references: [classrooms.id],
  }),
}));
