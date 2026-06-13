import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { documentCategories } from "./document_categories";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  fileType: text("file_type").notNull(), // "pdf" | "excel" | "word"
  uploadedById: integer("uploaded_by_id").notNull(),
  categoryId: integer("category_id").references(() => documentCategories.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
