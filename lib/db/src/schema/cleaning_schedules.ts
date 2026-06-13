import { pgTable, serial, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { students } from "./students";

export const cleaningSchedules = pgTable("cleaning_schedules", {
  id: serial("id").primaryKey(),
  dayOfWeek: text("day_of_week").notNull(),
  location: text("location").notNull(),
  shift: text("shift"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cleaningSchedulesRelations = relations(cleaningSchedules, ({ many }) => ({
  students: many(studentCleaningSchedules),
}));

export const studentCleaningSchedules = pgTable("student_cleaning_schedules", {
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  scheduleId: integer("schedule_id").notNull().references(() => cleaningSchedules.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.studentId, t.scheduleId] }),
}));

export const studentCleaningSchedulesRelations = relations(studentCleaningSchedules, ({ one }) => ({
  student: one(students, {
    fields: [studentCleaningSchedules.studentId],
    references: [students.id],
  }),
  schedule: one(cleaningSchedules, {
    fields: [studentCleaningSchedules.scheduleId],
    references: [cleaningSchedules.id],
  }),
}));
