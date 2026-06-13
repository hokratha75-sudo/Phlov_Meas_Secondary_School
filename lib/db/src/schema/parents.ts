import { pgTable, serial, integer, text, timestamp, unique, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { students } from "./students";

export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  parentName: text("parent_name").notNull(),
  phone: text("phone").notNull(),
  
  // Telegram Linking Fields
  telegramChatId: bigint("telegram_chat_id", { mode: 'number' }).unique(),
  telegramLinkCode: text("telegram_link_code"),
  telegramLinkedAt: timestamp("telegram_linked_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueStudentPhone: unique("unique_student_phone").on(table.studentId, table.phone),
}));

export const parentsRelations = relations(parents, ({ one }) => ({
  student: one(students, {
    fields: [parents.studentId],
    references: [students.id],
  }),
}));
