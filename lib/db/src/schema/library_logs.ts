import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { students } from "./students";

export const libraryLogs = pgTable("library_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  bookTitle: text("book_title").notNull(),
  bookCode: text("book_code"),
  borrowDate: timestamp("borrow_date").defaultNow().notNull(),
  returnDate: timestamp("return_date"),
  dueDate: timestamp("due_date"),
  bookStatus: text("book_status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const libraryLogsRelations = relations(libraryLogs, ({ one }) => ({
  student: one(students, {
    fields: [libraryLogs.studentId],
    references: [students.id],
  }),
}));
