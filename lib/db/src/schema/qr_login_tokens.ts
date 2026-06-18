import { pgTable, serial, integer, varchar, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { teachers } from "./teachers";
import { adminUsers } from "./admin";

export const qrLoginTokens = pgTable(
  "qr_login_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    isUsed: boolean("is_used").default(false),
    createdBy: integer("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    tokenIdx: index("idx_qr_login_tokens_token").on(table.token),
    userIdx: index("idx_qr_login_tokens_user").on(table.userId),
    expiresIdx: index("idx_qr_login_tokens_expires").on(table.expiresAt),
  })
);
