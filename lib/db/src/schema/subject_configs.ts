import { pgTable, serial, integer, numeric, boolean, unique } from "drizzle-orm/pg-core";
import { subjects } from "./subjects";
import { relations } from "drizzle-orm";

export const subjectConfigs = pgTable("subject_configs", {
  id: serial("id").primaryKey(),
  gradeLevel: integer("grade_level").notNull(), // 7, 8, 9, 10, 11, 12
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  maxScore: numeric("max_score", { precision: 5, scale: 2 }).notNull().default("50.00"),
  coefficient: numeric("coefficient", { precision: 4, scale: 2 }).notNull().default("1.00"),
  isScienceTrack: boolean("is_science_track").default(false).notNull(),
}, (table) => ({
  // Ensure we don't have duplicate configs for the same subject/grade/track combo
  unq: unique().on(table.gradeLevel, table.subjectId, table.isScienceTrack),
}));

export const subjectConfigsRelations = relations(subjectConfigs, ({ one }) => ({
  subject: one(subjects, {
    fields: [subjectConfigs.subjectId],
    references: [subjects.id],
  }),
}));
