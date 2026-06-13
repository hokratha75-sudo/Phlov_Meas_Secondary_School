import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teachers } from "./teachers";
import { students } from "./students";

export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "10 A" or "10B"
  grade: text("grade").notNull(), // e.g., "Grade 10"
  teacherId: integer("teacher_id").references(() => teachers.id), // Homeroom Teacher (គ្រូបន្ទុកថ្នាក់)
  roomNumber: text("room_number"), // e.g., "Room 01"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [classrooms.teacherId],
    references: [teachers.id],
  }),
  students: many(students),
}));
