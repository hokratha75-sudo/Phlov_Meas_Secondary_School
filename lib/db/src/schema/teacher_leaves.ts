import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teachers } from "./teachers";

export const teacherLeaves = pgTable("teacher_leaves", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  // 'ANNUAL' | 'SHORT_TERM' | 'SICK_LEAVE' | 'PERSONAL' | 'MATERNITY'
  leaveType: text("leave_type").notNull(),
  totalDays: integer("total_days").notNull(),
  startDate: text("start_date").notNull(), // ISO date string "YYYY-MM-DD"
  endDate: text("end_date").notNull(),     // ISO date string "YYYY-MM-DD"
  reason: text("reason").notNull(),
  addressDuringLeave: text("address_during_leave").notNull(),
  // PENDING | APPROVED | REJECTED
  status: text("status").notNull().default("PENDING"),
  attachmentUrl: text("attachment_url"), // Optional attachment
  signatureUrl: text("signature_url"),   // Signature image
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teacherLeavesRelations = relations(teacherLeaves, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherLeaves.teacherId],
    references: [teachers.id],
  }),
}));
