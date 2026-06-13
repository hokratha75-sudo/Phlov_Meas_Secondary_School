
import { db, students, teachers, classrooms, subjects, news, activities } from "../../lib/db/src/index.ts";
import { count } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: "../../.env" });

async function checkCounts() {
  try {
    const [
      [studentCount],
      [teacherCount],
      [classCount],
      [subjectCount],
      [newsCount],
      [activityCount]
    ] = await Promise.all([
      db.select({ count: count() }).from(students),
      db.select({ count: count() }).from(teachers),
      db.select({ count: count() }).from(classrooms),
      db.select({ count: count() }).from(subjects),
      db.select({ count: count() }).from(news),
      db.select({ count: count() }).from(activities)
    ]);

    console.log("Database Status:");
    console.log("----------------");
    console.log(`Students: ${studentCount.count}`);
    console.log(`Teachers: ${teacherCount.count}`);
    console.log(`Classrooms: ${classCount.count}`);
    console.log(`Subjects: ${subjectCount.count}`);
    console.log(`News: ${newsCount.count}`);
    console.log(`Activities: ${activityCount.count}`);
  } catch (error) {
    console.error("Error checking counts:", error);
  } finally {
    process.exit(0);
  }
}

checkCounts();
