CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" text NOT NULL,
	"title_kh" text NOT NULL,
	"content_en" text NOT NULL,
	"content_kh" text NOT NULL,
	"image_url" text,
	"category" text DEFAULT 'general' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" text NOT NULL,
	"title_kh" text NOT NULL,
	"description_en" text NOT NULL,
	"description_kh" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"image_url" text,
	"event_date" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_kh" text NOT NULL,
	"subject_en" text NOT NULL,
	"subject_kh" text NOT NULL,
	"photo_url" text,
	"bio_en" text,
	"bio_kh" text,
	"phone" text,
	"email" text,
	"address" text,
	"gender" text,
	"dob" text,
	"pob" text,
	"officer_id" text,
	"position" text,
	"education_level" text,
	"employment_date" text,
	"username" text,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teachers_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"name_en" text NOT NULL,
	"name_kh" text NOT NULL,
	"grade" text NOT NULL,
	"class_id" integer,
	"gender" text NOT NULL,
	"enrollment_year" integer NOT NULL,
	"phone" text,
	"parent_phone" text,
	"address" text,
	"status" text DEFAULT 'active' NOT NULL,
	"photo_url" text,
	"biography" text,
	"family_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"email" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discipline_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"fault_date" timestamp NOT NULL,
	"fault_description" text NOT NULL,
	"penalty_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"book_title" text NOT NULL,
	"book_code" text,
	"borrow_date" timestamp DEFAULT now() NOT NULL,
	"return_date" timestamp,
	"book_status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleaning_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" text NOT NULL,
	"location" text NOT NULL,
	"shift" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_cleaning_schedules" (
	"student_id" integer NOT NULL,
	"schedule_id" integer NOT NULL,
	CONSTRAINT "student_cleaning_schedules_student_id_schedule_id_pk" PRIMARY KEY("student_id","schedule_id")
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"grade" text NOT NULL,
	"teacher_id" integer,
	"room_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"classroom_id" integer NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"exam_period" varchar(50) NOT NULL,
	"scores" jsonb NOT NULL,
	"total_score" real,
	"average" real,
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_kh" text NOT NULL,
	"code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_monthly_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"month" varchar(50) NOT NULL,
	"subject" varchar(50) NOT NULL,
	"score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_monthly_scores_student_id_academic_year_month_subject_unique" UNIQUE("student_id","academic_year","month","subject")
);
--> statement-breakpoint
CREATE TABLE "subject_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"grade_level" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"max_score" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"coefficient" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"is_science_track" boolean DEFAULT false NOT NULL,
	CONSTRAINT "subject_configs_grade_level_subject_id_is_science_track_unique" UNIQUE("grade_level","subject_id","is_science_track")
);
--> statement-breakpoint
CREATE TABLE "communes" (
	"code" varchar(6) PRIMARY KEY NOT NULL,
	"district_code" varchar(4) NOT NULL,
	"province_code" varchar(2) NOT NULL,
	"name_kh" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"code" varchar(4) PRIMARY KEY NOT NULL,
	"province_code" varchar(2) NOT NULL,
	"name_kh" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"code" varchar(2) PRIMARY KEY NOT NULL,
	"name_kh" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "villages" (
	"code" varchar(8) PRIMARY KEY NOT NULL,
	"commune_code" varchar(6) NOT NULL,
	"district_code" varchar(4) NOT NULL,
	"province_code" varchar(2) NOT NULL,
	"name_kh" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_leaves" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"leave_type" text NOT NULL,
	"total_days" integer NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"reason" text NOT NULL,
	"address_during_leave" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"attachment_url" text,
	"signature_url" text,
	"admin_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_leave_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"allowed_days" integer DEFAULT 15 NOT NULL,
	"used_days" integer DEFAULT 0 NOT NULL,
	"remaining_days" integer DEFAULT 15 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"classroom_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"date" text NOT NULL,
	"shift" text NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'present' NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_attendance_student_id_date_shift_subject_unique" UNIQUE("student_id","date","shift","subject")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"uploaded_by_id" integer NOT NULL,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_kh" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "id_card_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"baseStyle" text DEFAULT 'classic' NOT NULL,
	"config" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classrooms_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline_logs" ADD CONSTRAINT "discipline_logs_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_logs" ADD CONSTRAINT "library_logs_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_cleaning_schedules" ADD CONSTRAINT "student_cleaning_schedules_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_cleaning_schedules" ADD CONSTRAINT "student_cleaning_schedules_schedule_id_cleaning_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."cleaning_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_monthly_scores" ADD CONSTRAINT "student_monthly_scores_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_monthly_scores" ADD CONSTRAINT "student_monthly_scores_class_id_classrooms_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_configs" ADD CONSTRAINT "subject_configs_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communes" ADD CONSTRAINT "communes_district_code_districts_code_fk" FOREIGN KEY ("district_code") REFERENCES "public"."districts"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_code_provinces_code_fk" FOREIGN KEY ("province_code") REFERENCES "public"."provinces"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "villages" ADD CONSTRAINT "villages_commune_code_communes_code_fk" FOREIGN KEY ("commune_code") REFERENCES "public"."communes"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_leaves" ADD CONSTRAINT "teacher_leaves_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_leave_balances" ADD CONSTRAINT "teacher_leave_balances_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_document_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."document_categories"("id") ON DELETE set null ON UPDATE no action;