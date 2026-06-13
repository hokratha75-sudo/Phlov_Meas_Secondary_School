ALTER TABLE "teachers" ADD COLUMN "framework" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "additional_subjects" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "additional_teaching_hours" integer;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "designated_teaching_hours" integer;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "remarks" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "family_status" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "degree_info" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "pedagogy_info" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "training_info" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "work_experience" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "teaching_skills" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "tech_skills" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "languages" text;--> statement-breakpoint
ALTER TABLE "library_logs" ADD COLUMN "due_date" timestamp;