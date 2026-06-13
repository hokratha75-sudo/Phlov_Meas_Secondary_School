import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const provinces = pgTable("provinces", {
  code: varchar("code", { length: 2 }).primaryKey(),
  nameKh: text("name_kh").notNull(),
  nameEn: text("name_en").notNull(),
});

export const districts = pgTable("districts", {
  code: varchar("code", { length: 4 }).primaryKey(),
  provinceCode: varchar("province_code", { length: 2 })
    .notNull()
    .references(() => provinces.code, { onDelete: "cascade" }),
  nameKh: text("name_kh").notNull(),
  nameEn: text("name_en").notNull(),
});

export const communes = pgTable("communes", {
  code: varchar("code", { length: 6 }).primaryKey(),
  districtCode: varchar("district_code", { length: 4 })
    .notNull()
    .references(() => districts.code, { onDelete: "cascade" }),
  provinceCode: varchar("province_code", { length: 2 }).notNull(),
  nameKh: text("name_kh").notNull(),
  nameEn: text("name_en").notNull(),
});

export const villages = pgTable("villages", {
  code: varchar("code", { length: 8 }).primaryKey(),
  communeCode: varchar("commune_code", { length: 6 })
    .notNull()
    .references(() => communes.code, { onDelete: "cascade" }),
  districtCode: varchar("district_code", { length: 4 }).notNull(),
  provinceCode: varchar("province_code", { length: 2 }).notNull(),
  nameKh: text("name_kh").notNull(),
  nameEn: text("name_en").notNull(),
});
