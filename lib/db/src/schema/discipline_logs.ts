import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { students } from "./students";

export const disciplineLogs = pgTable("discipline_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  faultDate: timestamp("fault_date").notNull(),
  faultDescription: text("fault_description").notNull(),
  penaltyType: text("penalty_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const disciplineLogsRelations = relations(disciplineLogs, ({ one }) => ({
  student: one(students, {
    fields: [disciplineLogs.studentId],
    references: [students.id],
  }),
}));
