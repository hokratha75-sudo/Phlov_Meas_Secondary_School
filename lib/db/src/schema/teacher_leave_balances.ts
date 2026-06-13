import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teachers } from "./teachers";

export const teacherLeaveBalances = pgTable("teacher_leave_balances", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  academicYear: text("academic_year").notNull(), // e.g. "2025-2026"
  allowedDays: integer("allowed_days").notNull().default(15),
  usedDays: integer("used_days").notNull().default(0),
  remainingDays: integer("remaining_days").notNull().default(15),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teacherLeaveBalancesRelations = relations(teacherLeaveBalances, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherLeaveBalances.teacherId],
    references: [teachers.id],
  }),
}));
