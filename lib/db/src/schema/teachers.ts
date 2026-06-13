import { pgTable, serial, text, timestamp, integer, bigint, varchar } from "drizzle-orm/pg-core";

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameKh: text("name_kh").notNull(),
  subjectEn: text("subject_en").notNull(),
  subjectKh: text("subject_kh").notNull(),
  photoUrl: text("photo_url"),
  bioEn: text("bio_en"),
  bioKh: text("bio_kh"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  gender: text("gender"), // "male" | "female"
  dob: text("dob"), // Date of birth
  pob: text("pob"), // Place of birth
  officerId: text("officer_id"), // Civil servant ID
  position: text("position"), // Position
  educationLevel: text("education_level"), // Education level
  employmentDate: text("employment_date"), // Employment date
  framework: text("framework"), // ក្របខ័ណ្ឌ (Framework)
  additionalSubjects: text("additional_subjects"), // មុខវិជ្ជាបង្រៀនបន្ថែម
  additionalTeachingHours: integer("additional_teaching_hours"), // ម៉ោងបង្រៀនបន្ថែមក្នុង១សប្ដាហ៍
  designatedTeachingHours: integer("designated_teaching_hours"), // ម៉ោងកំណត់ក្នុង១សប្ដាហ៍
  remarks: text("remarks"), // ផ្សេងៗ
  
  // New Profile Fields
  familyStatus: text("family_status"), // ស្ថានភាពគ្រួសារ
  degreeInfo: text("degree_info"), // បរិញ្ញាបត្រ/អនុបណ្ឌិត/បណ្ឌិត៖ ជំនាញ សាកលវិទ្យាល័យ ឆ្នាំបញ្ចប់
  pedagogyInfo: text("pedagogy_info"), // សញ្ញាបត្រគរុកោសល្យ
  trainingInfo: text("training_info"), // វគ្គបណ្តុះបណ្តាលបន្ថែម
  workExperience: text("work_experience"), // បទពិសោធន៍ការងារ
  teachingSkills: text("teaching_skills"), // ជំនាញបង្រៀន
  techSkills: text("tech_skills"), // ជំនាញបច្ចេកវិទ្យា
  languages: text("languages"), // ភាសាបរទេស
  // Telegram Linking Fields
  telegramChatId: bigint("telegram_chat_id", { mode: 'number' }).unique(),
  telegramLinkCode: varchar("telegram_link_code", { length: 20 }),
  telegramLinkedAt: timestamp("telegram_linked_at"),
  // Login credentials (optional — only set when Admin creates a login account)
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
