import { Router } from "express";
import { db, students, classrooms } from "@workspace/db";
import { eq, count, desc, and, inArray } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/students", requireAuth, async (req: any, res) => {
  const limit = Number(req.query["limit"]) || 50;
  const offset = Number(req.query["offset"]) || 0;
  const grade = req.query["grade"] as string | undefined;
  const classId = req.query["classId"] ? Number(req.query["classId"]) : undefined;
  
  const role = req.adminUser?.role;
  const userId = req.adminUser?.id;

  const conditions = [];
  if (grade) conditions.push(eq(students.grade, grade));

  if (role === "teacher") {
    // 1. Identify Teacher's Classes
    const teacherClasses = await db.query.classrooms.findMany({
      where: eq(classrooms.teacherId, userId),
    });
    const assignedClassIds = teacherClasses.map(c => c.id);

    // 2. Strict Data Isolation: If the teacher is not assigned to any classrooms, return empty results immediately
    if (assignedClassIds.length === 0) {
      res.json({ data: [], total: 0 });
      return;
    }

    // 3. Filter Students Query: WHERE student.class_id IN (assignedClassIds)
    if (classId) {
      // If a specific class is requested, ensure it belongs to the teacher's assigned classes
      if (assignedClassIds.includes(classId)) {
        conditions.push(eq(students.classId, classId));
      } else {
        // Teacher is trying to access a class they don't teach! Restrict access completely
        res.json({ data: [], total: 0 });
        return;
      }
    } else {
      // Filter by all classes assigned to this teacher
      conditions.push(inArray(students.classId, assignedClassIds));
    }
  } else {
    // Admin role has unrestricted access to all classes
    if (classId) conditions.push(eq(students.classId, classId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [total]] = await Promise.all([
    db.query.students.findMany({
      where: whereClause,
      orderBy: [desc(students.createdAt)],
      limit,
      offset,
      with: {
        disciplineLogs: true,
      }
    }),
    db.select({ count: count() })
      .from(students)
      .where(whereClause),
  ]);
  
  res.json({ 
    data: items.map(s => ({ 
      ...s, 
      createdAt: s.createdAt.toISOString(), 
      updatedAt: s.updatedAt.toISOString() 
    })), 
    total: total?.count ?? 0 
  });
});

router.post("/students", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const [item] = await db.insert(students).values({
      studentId: body.studentId, nameEn: body.nameEn, nameKh: body.nameKh,
      grade: body.grade, gender: body.gender,
      enrollmentYear: Number(body.enrollmentYear) || new Date().getFullYear(),
      classId: body.classId ? Number(body.classId) : null,
      phone: body.phone ?? null, parentPhone: body.parentPhone ?? null,
      address: body.address ?? null,
      photoUrl: body.photoUrl ?? null, biography: body.biography ?? null,
      familyStatus: body.familyStatus ?? null,
    }).returning();
    res.status(201).json({ ...item!, createdAt: item!.createdAt.toISOString(), updatedAt: item!.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("Error creating student:", err);
    res.status(err.code === "23505" ? 409 : 400).json({ 
      error: err.code === "23505" ? "Student ID already exists" : "Failed to create student",
      details: err.message 
    });
  }
});

router.put("/students/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const body = req.body;
    const [item] = await db.update(students).set({
      studentId: body.studentId, nameEn: body.nameEn, nameKh: body.nameKh,
      grade: body.grade, gender: body.gender,
      enrollmentYear: Number(body.enrollmentYear) || new Date().getFullYear(),
      classId: body.classId ? Number(body.classId) : null,
      phone: body.phone ?? null, parentPhone: body.parentPhone ?? null,
      address: body.address ?? null, 
      photoUrl: body.photoUrl ?? null, biography: body.biography ?? null,
      familyStatus: body.familyStatus ?? null,
      updatedAt: new Date(),
    }).where(eq(students.id, id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
  } catch (err: any) {
    console.error("Error updating student:", err);
    res.status(400).json({ error: "Failed to update student", details: err.message });
  }
});

router.delete("/students/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(students).where(eq(students.id, id));
  res.json({ message: "Deleted" });
});

router.get("/students/:studentIdStr/full-record", requireAuth, async (req, res) => {
  try {
    const studentIdStr = req.params["studentIdStr"];
    
    // 1. Fetch Student Profile
    const studentInfo = await db.query.students.findFirst({
      where: eq(students.studentId, studentIdStr),
      with: { classroom: true }
    });

    if (!studentInfo) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    // 2. Map Profile for GradeBook
    const profile = {
      nameKh: studentInfo.nameKh || "",
      nameEn: studentInfo.nameEn || "",
      dob: studentInfo.enrollmentYear ? `01 មករា ${studentInfo.enrollmentYear - 12}` : "១៥ មករា ២០១០",
      pob: studentInfo.address || "ភូមិពោធិ៍ ឃុំពោធិ៍ ស្រុកពោធិ៍ ខេត្តតាកែវ",
      address: studentInfo.address || "ភូមិពោធិ៍ ឃុំពោធិ៍ ស្រុកពោធិ៍ ខេត្តតាកែវ",
      fatherName: "មិនបញ្ជាក់", fatherJob: "កសិករ",
      motherName: "មិនបញ្ជាក់", motherJob: "មេផ្ទះ",
      schoolName: "វិទ្យាល័យ ផ្លូវមាស"
    };

    // 3. Fetch all scores for this student across all years/classes
    const { studentMonthlyScores, subjectConfigs } = await import("@workspace/db");
    
    const allScores = await db.select().from(studentMonthlyScores)
      .where(eq(studentMonthlyScores.studentId, studentInfo.id));

    // We need subject configs to apply correct coefficients for the yearly formulas
    const allConfigs = await db.select().from(subjectConfigs);

    // 4. Transform scores into YearlyRecords
    // We'll structure it like records in StudentGradeBook.tsx
    const records: Record<number, any> = {};
    const GRADES = [7, 8, 9, 10, 11, 12];
    
    GRADES.forEach(g => {
      records[g] = {
        academicYear: g === parseInt(studentInfo.grade.replace(/[^0-9]/g, "") || "7") ? "២០២៤-២០២៥" : "",
        classroomName: g === parseInt(studentInfo.grade.replace(/[^0-9]/g, "") || "7") ? studentInfo.classroom?.name || `${g}ក` : `${g}ក`,
        studentCount: "៣៥",
        scores: {},
        attendance: { s1: { withLeave: 0, withoutLeave: 0 }, s2: { withLeave: 0, withoutLeave: 0 } },
        coreValuations: { study: {s1:"",s2:"",yr:""}, morals: {s1:"",s2:"",yr:""}, labor: {s1:"",s2:"",yr:""}, health: {s1:"",s2:"",yr:""} },
        commendations: { bann: {s1:"",s2:"",yr:""}, likhet: {s1:"",s2:"",yr:""}, sakkey: {s1:"",s2:"",yr:""} },
        finalExamCenter: "", finalExamProvince: "", finalExamRoom: "", finalExamTable: ""
      };
      
      const SUBJECTS = [
        "khmer", "civics", "history", "geography", "math", "physics", 
        "chemistry", "biology", "earth", "english", "tech", "home_ec", "art", "pe"
      ];
      SUBJECTS.forEach(sub => {
        records[g].scores[sub] = { sem1Avg: null, sem1Rank: null, sem2Avg: null, sem2Rank: null, yearlyAvg: null, yearlyRank: null, teacherRemarks: "" };
      });
    });

    // Populate actual calculated averages if data matches the grade
    const currentGradeNum = parseInt(studentInfo.grade.replace(/[^0-9]/g, "") || "7");
    
    // Group raw scores
    const s1Months = ["November", "December", "January", "February", "March"];
    const s2Months = ["May", "June", "July", "August", "September"];
    
    const subjectMap: Record<string, { s1Sum: number, s1Exam: number, s2Sum: number, s2Exam: number }> = {};
    
    allScores.forEach(row => {
      if (!subjectMap[row.subject]) {
        subjectMap[row.subject] = { s1Sum: 0, s1Exam: 0, s2Sum: 0, s2Exam: 0 };
      }
      const val = parseFloat(row.score as string);
      if (isNaN(val)) return;

      if (s1Months.includes(row.month)) subjectMap[row.subject].s1Sum += val;
      if (row.month === "Semester 1") subjectMap[row.subject].s1Exam = val;
      
      if (s2Months.includes(row.month)) subjectMap[row.subject].s2Sum += val;
      if (row.month === "Semester 2") subjectMap[row.subject].s2Exam = val;
    });

    // Calculate Semester 1 & 2 per MoEYS formula
    const targetScores = records[currentGradeNum].scores;
    Object.keys(subjectMap).forEach(subCode => {
      const data = subjectMap[subCode];
      
      let s1Avg: number | null = null;
      let s2Avg: number | null = null;
      let yAvg: number | null = null;

      if (data.s1Sum > 0 || data.s1Exam > 0) {
        s1Avg = ((data.s1Sum / 5) * 2 + data.s1Exam) / 3;
      }
      if (data.s2Sum > 0 || data.s2Exam > 0) {
        s2Avg = ((data.s2Sum / 5) * 2 + data.s2Exam) / 3;
      }
      if (s1Avg !== null && s2Avg !== null) {
        yAvg = (s1Avg + s2Avg * 2) / 3;
      } else if (s1Avg !== null) {
        yAvg = s1Avg;
      } else if (s2Avg !== null) {
        yAvg = s2Avg;
      }

      // Map back to internal ID
      // Mapping logic depends on if subject was recorded as UUID or shortcode (e.g., KHM, MAT)
      // Usually the DB stores KHM. Our UI uses khmer.
      const subMapInv: Record<string, string> = {
        "KHM": "khmer", "MOR": "civics", "HIS": "history", "GEO": "geography", 
        "MAT": "math", "PHY": "physics", "CHE": "chemistry", "BIO": "biology", 
        "EAS": "earth", "ENG": "english", "ICT": "tech", "HEC": "home_ec", "ART": "art", "PE": "pe"
      };
      
      const mappedId = subMapInv[subCode] || subCode.toLowerCase();
      if (targetScores[mappedId]) {
        targetScores[mappedId].sem1Avg = s1Avg !== null ? parseFloat(s1Avg.toFixed(2)) : null;
        targetScores[mappedId].sem2Avg = s2Avg !== null ? parseFloat(s2Avg.toFixed(2)) : null;
        targetScores[mappedId].yearlyAvg = yAvg !== null ? parseFloat(yAvg.toFixed(2)) : null;
      }
    });

    res.json({ profile, records });
  } catch (error) {
    console.error("Full Record error:", error);
    res.status(500).json({ error: "Failed to fetch full record" });
  }
});

export default router;
