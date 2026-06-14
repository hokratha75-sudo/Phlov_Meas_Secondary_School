import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { 
  Search, 
  ArrowRight,
  FileText,
  Calendar,
  GraduationCap,
  LayoutGrid,
  CheckCircle2,
  ArrowLeft,
  Download
} from "lucide-react";
import YearEndSummary from "@/components/YearEndSummary";
import { useAuth } from "@/lib/auth";
import { useListStudents, useListClassrooms } from "@workspace/api-client-react";
import { exportAttendanceMonthly, exportAttendanceSummary, exportToMoEYSExcel } from "@/lib/export";
import api from "@/lib/axiosConfig";

interface ReportItem {
  id: string;
  code: string;
  titleEn: string;
  titleKh: string;
  category: "attendance" | "grades";
}

const REPORTS_LIST: ReportItem[] = [
  // Attendance Group
  { id: "att-weekly", code: "1", titleEn: "Weekly Attendance Summary", titleKh: "របាយការណ៍វត្តមានប្រចាំសប្តាហ៍", category: "attendance" },
  { id: "att-monthly", code: "2", titleEn: "Monthly Attendance Summary", titleKh: "របាយការណ៍វត្តមានប្រចាំខែ", category: "attendance" },
  { id: "att-semester", code: "3", titleEn: "Semester Attendance Summary", titleKh: "របាយការណ៍វត្តមានសរុបប្រចាំឆមាស", category: "attendance" },
  { id: "att-annual", code: "4", titleEn: "Annual Attendance Summary", titleKh: "របាយការណ៍វត្តមានសរុបប្រចាំឆ្នាំ", category: "attendance" },
  
  // Grades Group
  { id: "gr-monthly-summary", code: "5S", titleEn: "Monthly Grade Sheet", titleKh: "របាយការណ៍ពិន្ទុប្រចាំខែ", category: "grades" },
  { id: "gr-monthly-rank", code: "5R", titleEn: "Monthly Ranking", titleKh: "របាយការណ៍ចំណាត់ថ្នាក់ប្រចាំខែ", category: "grades" },
  
  { id: "gr-sem1-summary", code: "6S", titleEn: "Semester 1 Grade Sheet", titleKh: "របាយការណ៍ពិន្ទុប្រចាំឆមាសទី ១", category: "grades" },
  { id: "gr-sem1-rank", code: "6R", titleEn: "Semester 1 Ranking", titleKh: "របាយការណ៍លទ្ធផលឆមាសទី ១ (ចំណាត់ថ្នាក់)", category: "grades" },
  { id: "gr-sem1-exam", code: "6E", titleEn: "Semester 1 Exam Grades", titleKh: "របាយការណ៍ពិន្ទុប្រឡងឆមាសទី ១", category: "grades" },
  
  { id: "gr-sem2-summary", code: "7S", titleEn: "Semester 2 Grade Sheet", titleKh: "របាយការណ៍ពិន្ទុប្រចាំឆមាសទី ២", category: "grades" },
  { id: "gr-sem2-rank", code: "7R", titleEn: "Semester 2 Ranking", titleKh: "របាយការណ៍លទ្ធផលឆមាសទី ២ (ចំណាត់ថ្នាក់)", category: "grades" },
  { id: "gr-sem2-exam", code: "7E", titleEn: "Semester 2 Exam Grades", titleKh: "របាយការណ៍ពិន្ទុប្រឡងឆមាសទី ២", category: "grades" },
  
  { id: "gr-annual-summary", code: "8S", titleEn: "Annual Grade Sheet", titleKh: "របាយការណ៍ពិន្ទុប្រចាំឆ្នាំ", category: "grades" },
  { id: "gr-annual-rank", code: "8R", titleEn: "Annual Ranking", titleKh: "របាយការណ៍លទ្ធផលប្រចាំឆ្នាំ (ចំណាត់ថ្នាក់)", category: "grades" },
  
  { id: "gr-diagnostic", code: "9D", titleEn: "Diagnostic Test (Beginning of Year)", titleKh: "របាយការណ៍តេស្តដើមឆ្នាំ", category: "grades" },
  { id: "gr-recording", code: "10R", titleEn: "All Subjects Grade Recording Sheet", titleKh: "បញ្ជីសម្រង់ពិន្ទុសិស្សគ្រប់មុខវិជ្ជា", category: "grades" },
];


const MONTH_KH: Record<string, string> = {
  November: 'វិច្ឆិកា', December: 'ធ្នូ', January: 'មករា',
  February: 'កុម្ភៈ', March: 'មីនា', April: 'មេសា',
  May: 'ឧសភា', June: 'មិថុនា', July: 'កក្កដា',
};

const DEFAULT_MOEYS_CONFIGS: Record<string, { max: number; coeff: number }> = {
  MAT: { max: 150, coeff: 3.0 },
  KHM: { max: 150, coeff: 3.0 }, // តែងសេចក្ដី (100) + សរសេរតាមអាន (50) = 150
  ENG: { max: 100, coeff: 2.0 },
  PHY: { max: 50, coeff: 1.0 },
  CHE: { max: 37, coeff: 0.74 },
  BIO: { max: 38, coeff: 0.76 },
  HIS: { max: 37, coeff: 0.74 },
  GEO: { max: 38, coeff: 0.76 },
  MOR: { max: 50, coeff: 1.0 },
  ICT: { max: 37, coeff: 0.74 },
  CND: { max: 50, coeff: 1.0 },
};

export default function ReportsPage() {
  const { t, lang } = useTranslation();
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [filters, setFilters] = useState({
    classroomId: "",
    academicYear: "2024-2025",
    month: "November",
    semester: "Semester 1",
    week: "1"
  });

  const { data: classroomsData } = useListClassrooms({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: studentsData } = useListStudents(undefined, {
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const filteredReports = useMemo(() => {
    if (!searchQuery) return REPORTS_LIST;
    const q = searchQuery.toLowerCase();
    return REPORTS_LIST.filter(r => 
      r.code.includes(q) || 
      r.titleEn.toLowerCase().includes(q) || 
      r.titleKh.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const groupedReports = useMemo(() => {
    return {
      attendance: filteredReports.filter(r => r.category === "attendance"),
      grades: filteredReports.filter(r => r.category === "grades"),
    };
  }, [filteredReports]);

  const generateReport = async () => {
    if (!selectedReport) return;
    setIsGenerating(true);
    try {
      // ── Attendance Excel Export ──
      if (selectedReport.category === 'attendance') {
        const classroom = classroomsData?.data?.find((c: any) => c.id.toString() === filters.classroomId);
        const classStudents = (studentsData?.data || []).filter(
          (s: any) => (s.classId || s.classroomId)?.toString() === filters.classroomId
        );
        
        let monthName = filters.month;
        let baseMonthKh = MONTH_KH[filters.month] || filters.month;
        let monthKh = `ប្រចាំខែ ${baseMonthKh}`;

        let schoolDays: number[] = [];

        if (selectedReport.id === 'att-weekly') {
          const w = parseInt(filters.week || "1");
          const start = (w - 1) * 6 + 1;
          const end = w === 5 ? 31 : w * 6;
          schoolDays = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          monthKh = `ប្រចាំសប្តាហ៍ទី ${w} (${baseMonthKh})`;
        } else if (selectedReport.id === 'att-semester') {
          schoolDays = [];
          monthKh = `ប្រចាំឆមាស`;
        } else if (selectedReport.id === 'att-annual') {
          schoolDays = [];
          monthKh = `ប្រចាំឆ្នាំ`;
        } else {
          schoolDays = Array.from({ length: 30 }, (_, i) => i + 1);
        }
        
        const isSummary = selectedReport.id === 'att-semester' || selectedReport.id === 'att-annual';

        if (isSummary) {
          const periodValue = selectedReport.id === 'att-semester' 
            ? (filters.semester === 'Semester 1' ? 'Semester 1' : 'Semester 2')
            : 'Annual';

          const periodKhValue = selectedReport.id === 'att-semester'
            ? (filters.semester === 'Semester 1' ? 'ឆមាសទី ១' : 'ឆមាសទី ២')
            : 'ប្រចាំឆ្នាំ';

          await exportAttendanceSummary({
            className: classroom?.name || filters.classroomId,
            grade: classroom?.grade || '',
            period: periodValue as any,
            periodKh: periodKhValue,
            year: filters.academicYear,
            students: classStudents.map((s: any) => ({
              id: s.id,
              studentId: s.studentId || '',
              nameKh: s.nameKh || s.nameEn || '',
              nameEn: s.nameEn || '',
              gender: s.gender || '',
            }))
          });
          return;
        }

        let attendanceMap: Record<number, Record<number, { present: number; excused: number; unexcused: number }>> = {};
        if (!isSummary) {
          try {
            const res = await api.get(`/attendance/absences?classroomId=${filters.classroomId}&academicYear=${filters.academicYear}&month=${filters.month}`);
            const rawRecords = res.data.records || [];
            rawRecords.forEach((r: any) => {
              const dateParts = r.date.split('-');
              if (dateParts.length === 3) {
                const dayNum = parseInt(dateParts[2], 10);
                if (!attendanceMap[r.studentId]) attendanceMap[r.studentId] = {};
                if (!attendanceMap[r.studentId][dayNum]) {
                  attendanceMap[r.studentId][dayNum] = { present: 0, excused: 0, unexcused: 0 };
                }
                
                if (r.status === 'unexcused') {
                  attendanceMap[r.studentId][dayNum].unexcused += 1;
                } else if (r.status === 'excused') {
                  attendanceMap[r.studentId][dayNum].excused += 1;
                } else if (r.status === 'present') {
                  attendanceMap[r.studentId][dayNum].present += 1;
                }
              }
            });
          } catch (e) {
            console.error("Failed to fetch attendance for export", e);
          }
        }

        await exportAttendanceMonthly({
          className: classroom?.name || filters.classroomId,
          grade: classroom?.grade || '',
          month: monthName,
          monthKh: monthKh,
          year: filters.academicYear,
          students: classStudents.map((s: any) => ({
            id: s.id,
            studentId: s.studentId || '',
            nameKh: s.nameKh || s.nameEn || '',
            nameEn: s.nameEn || '',
            gender: s.gender || '',
          })),
          attendance: attendanceMap,
          schoolDays,
        });
        return;
      }

      // ── Grades Excel Export ──
      if (selectedReport.category === 'grades') {
        const classroom = classroomsData?.data?.find((c: any) => c.id.toString() === filters.classroomId);
        const gradeLevel = parseInt((classroom?.grade || "").replace(/[^0-9]/g, "")) || 0;
        const isScience = (classroom?.name || "").toUpperCase().includes("A");
        
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
        
        // 1. Fetch Subject Configs
        const configsRes = await api.get(`/subject-configs?gradeLevel=${gradeLevel}&isScienceTrack=${isScience}`);
        const configsData = configsRes.data.data || [];
        const hasAnyCustomConfig = configsData.some((c: any) => c.maxScore !== null && c.maxScore !== undefined);
        const activeSubjects = !hasAnyCustomConfig
          ? configsData.map((c: any) => {
              const def = DEFAULT_MOEYS_CONFIGS[c.code] || { max: 50.00, coeff: 1.0 };
              return {
                id: c.id.toString(),
                km: c.nameKh,
                en: c.nameEn,
                code: c.code,
                max: def.max,
                coeff: def.coeff
              };
            })
          : configsData.filter((c: any) => c.maxScore && parseFloat(c.maxScore) > 0).map((c: any) => ({
              id: c.id.toString(),
              km: c.nameKh,
              en: c.nameEn,
              code: c.code,
              max: parseFloat(c.maxScore),
              coeff: parseFloat(c.coefficient || "1.0")
            }));

        // 2. Determine Period & Report Type
        let examPeriod = filters.month;
        let reportType = 'monthly_summary';

        if (selectedReport.id === 'gr-monthly-summary') {
          examPeriod = filters.month;
          reportType = 'monthly_summary';
        } else if (selectedReport.id === 'gr-monthly-rank') {
          examPeriod = filters.month;
          reportType = 'monthly_rank';
        } else if (selectedReport.id === 'gr-sem1-summary') {
          examPeriod = 'Semester 1';
          reportType = 'semester_summary';
        } else if (selectedReport.id === 'gr-sem1-rank') {
          examPeriod = 'Semester 1';
          reportType = 'semester_rank';
        } else if (selectedReport.id === 'gr-sem1-exam') {
          examPeriod = 'Semester 1';
          reportType = 'semester_exam';
        } else if (selectedReport.id === 'gr-sem2-summary') {
          examPeriod = 'Semester 2';
          reportType = 'semester_summary';
        } else if (selectedReport.id === 'gr-sem2-rank') {
          examPeriod = 'Semester 2';
          reportType = 'semester_rank';
        } else if (selectedReport.id === 'gr-sem2-exam') {
          examPeriod = 'Semester 2';
          reportType = 'semester_exam';
        } else if (selectedReport.id === 'gr-annual-summary') {
          examPeriod = 'Annual';
          reportType = 'annual_summary';
        } else if (selectedReport.id === 'gr-annual-rank') {
          examPeriod = 'Annual';
          reportType = 'annual_rank';
        } else if (selectedReport.id === 'gr-diagnostic') {
          examPeriod = 'Diagnostic Test';
          reportType = 'diagnostic_test';
        } else if (selectedReport.id === 'gr-recording') {
          examPeriod = filters.month;
          reportType = 'all_subjects_recording';
        }

        // 3. Fetch Grades and perform MoEYS calculations
        const classStudents = (studentsData?.data || []).filter(
          (s: any) => (s.classId || s.classroomId)?.toString() === filters.classroomId
        );

        let rankedStudents: any[] = [];

        if (selectedReport.id === 'gr-sem1-summary' || selectedReport.id === 'gr-sem1-rank') {
          // --- Semester 1 MoEYS Weighted Calculation ---
          const s1Months = ["November", "December", "January", "February", "March", "Semester 1"];
          const s1Results = await Promise.all(
            s1Months.map(p =>
              api.get(`/grades?classroomId=${filters.classroomId}&academicYear=${filters.academicYear}&examPeriod=${p}`).then(res => res.data)
            )
          );

          // Build scores maps for each period: period -> studentId -> subjectId -> score
          const periodScores: Record<string, Record<number, Record<string, number>>> = {};
          s1Months.forEach((p, idx) => {
            periodScores[p] = {};
            const grades = s1Results[idx].data || [];
            grades.forEach((g: any) => {
              periodScores[p][g.studentId] = g.scores || {};
            });
          });

          rankedStudents = classStudents.map((s: any) => {
            const studentScores: Record<string, number> = {};
            let totalActual = 0;
            let totalCoeff = 0;

            activeSubjects.forEach((sub: any) => {
              // Calculate S1 Monthly Average (Nov, Dec, Jan, Feb, Mar)
              let monthlySum = 0;
              ["November", "December", "January", "February", "March"].forEach(p => {
                const val = periodScores[p][s.id]?.[sub.id];
                if (typeof val === 'number' && !isNaN(val)) {
                  monthlySum += val;
                }
              });
              // MoEYS Standard S1 is strictly 5 months
              const monthlyAvg = monthlySum / 5;

              // S1 Exam score
              const examScore = periodScores["Semester 1"][s.id]?.[sub.id] || 0;

              // MoEYS Formula: (Monthly_Avg * 2 + Exam) / 3
              const semesterSubScore = (monthlyAvg * 2 + examScore) / 3;

              studentScores[sub.id] = semesterSubScore;
              totalActual += semesterSubScore;
              totalCoeff += sub.coeff;
            });

            const avg = totalCoeff > 0 ? (totalActual / totalCoeff) : 0;
            return { ...s, total: totalActual, avg, scores: studentScores };
          });

        } else if (selectedReport.id === 'gr-sem2-summary' || selectedReport.id === 'gr-sem2-rank') {
          // --- Semester 2 MoEYS Weighted Calculation ---
          const s2Months = ["May", "June", "July", "August", "September", "Semester 2"];
          const s2Results = await Promise.all(
            s2Months.map(p =>
              api.get(`/grades?classroomId=${filters.classroomId}&academicYear=${filters.academicYear}&examPeriod=${p}`).then(res => res.data)
            )
          );

          const periodScores: Record<string, Record<number, Record<string, number>>> = {};
          s2Months.forEach((p, idx) => {
            periodScores[p] = {};
            const grades = s2Results[idx].data || [];
            grades.forEach((g: any) => {
              periodScores[p][g.studentId] = g.scores || {};
            });
          });

          rankedStudents = classStudents.map((s: any) => {
            const studentScores: Record<string, number> = {};
            let totalActual = 0;
            let totalCoeff = 0;

            activeSubjects.forEach((sub: any) => {
              // Calculate S2 Monthly Average (May, Jun, Jul, Aug, Sep)
              let monthlySum = 0;
              ["May", "June", "July", "August", "September"].forEach(p => {
                const val = periodScores[p][s.id]?.[sub.id];
                if (typeof val === 'number' && !isNaN(val)) {
                  monthlySum += val;
                }
              });
              // MoEYS Standard S2 is strictly 5 months
              const monthlyAvg = monthlySum / 5;

              // S2 Exam score
              const examScore = periodScores["Semester 2"][s.id]?.[sub.id] || 0;

              // MoEYS Formula: (Monthly_Avg * 2 + Exam) / 3
              const semesterSubScore = (monthlyAvg * 2 + examScore) / 3;

              studentScores[sub.id] = semesterSubScore;
              totalActual += semesterSubScore;
              totalCoeff += sub.coeff;
            });

            const avg = totalCoeff > 0 ? (totalActual / totalCoeff) : 0;
            return { ...s, total: totalActual, avg, scores: studentScores };
          });

        } else if (selectedReport.id === 'gr-annual-summary' || selectedReport.id === 'gr-annual-rank') {
          // --- Annual MoEYS Weighted Calculation: (Semester 1 + Semester 2 * 2) / 3 ---
          const allPeriods = [
            "November", "December", "January", "February", "March", "Semester 1",
            "May", "June", "July", "August", "September", "Semester 2"
          ];
          const allResults = await Promise.all(
            allPeriods.map(p =>
              api.get(`/grades?classroomId=${filters.classroomId}&academicYear=${filters.academicYear}&examPeriod=${p}`).then(res => res.data)
            )
          );

          const periodScores: Record<string, Record<number, Record<string, number>>> = {};
          allPeriods.forEach((p, idx) => {
            periodScores[p] = {};
            const grades = allResults[idx].data || [];
            grades.forEach((g: any) => {
              periodScores[p][g.studentId] = g.scores || {};
            });
          });

          rankedStudents = classStudents.map((s: any) => {
            const studentScores: Record<string, number> = {};
            let totalActual = 0;
            let totalCoeff = 0;

            activeSubjects.forEach((sub: any) => {
              // Calculate S1 Monthly Average
              let monthlySum1 = 0;
              ["November", "December", "January", "February", "March"].forEach(p => {
                const val = periodScores[p][s.id]?.[sub.id];
                if (typeof val === 'number' && !isNaN(val)) {
                  monthlySum1 += val;
                }
              });
              const monthlyAvg1 = monthlySum1 / 5;
              const examScore1 = periodScores["Semester 1"][s.id]?.[sub.id] || 0;
              const semester1SubScore = (monthlyAvg1 * 2 + examScore1) / 3;

              // Calculate S2 Monthly Average
              let monthlySum2 = 0;
              ["May", "June", "July", "August", "September"].forEach(p => {
                const val = periodScores[p][s.id]?.[sub.id];
                if (typeof val === 'number' && !isNaN(val)) {
                  monthlySum2 += val;
                }
              });
              const monthlyAvg2 = monthlySum2 / 5;
              const examScore2 = periodScores["Semester 2"][s.id]?.[sub.id] || 0;
              const semester2SubScore = (monthlyAvg2 * 2 + examScore2) / 3;

              // Annual Subject Score: (S1 + S2 * 2) / 3
              const annualSubScore = (semester1SubScore + semester2SubScore * 2) / 3;

              studentScores[sub.id] = annualSubScore;
              totalActual += annualSubScore;
              totalCoeff += sub.coeff;
            });

            const avg = totalCoeff > 0 ? (totalActual / totalCoeff) : 0;
            return { ...s, total: totalActual, avg, scores: studentScores };
          });

        } else {
          // --- Standard Monthly Grades ---
          const gradesRes = await api.get(`/grades?classroomId=${filters.classroomId}&academicYear=${filters.academicYear}&examPeriod=${examPeriod}`);
          const gradesData = gradesRes.data.data || [];
          const scoresMap: Record<number, Record<string, number>> = {};
          gradesData.forEach((g: any) => { scoresMap[g.studentId] = g.scores || {}; });

          rankedStudents = classStudents.map((s: any) => {
            const sScores = scoresMap[s.id] || {};
            let totalActual = 0;
            let totalCoeff = 0;
            activeSubjects.forEach((sub: any) => {
              const score = sScores[sub.id] || 0;
              totalActual += score;
              totalCoeff += sub.coeff;
            });
            const avg = totalCoeff > 0 ? (totalActual / totalCoeff) : 0;
            return { ...s, total: totalActual, avg, scores: sScores };
          });
        }

        // Sort and rank students
        rankedStudents.sort((a, b) => b.avg - a.avg);
        rankedStudents.forEach((s, idx) => {
          s.rank = s.avg > 0 ? idx + 1 : "-";
        });

        // 5. Export to Excel
        await exportToMoEYSExcel({
          month: MONTH_KH[examPeriod] || examPeriod,
          className: classroom?.name || "",
          year: filters.academicYear,
          students: rankedStudents,
          subjectConfigs: activeSubjects,
          reportType: reportType as any
        });
        
        return;
      }

      // Fallback for anything else (should not reach here as all are handled)
      setStep(3);
    } catch (error) {
      console.error("Report Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Step 1 View ---
  if (step === 1) {
    return (
      <div className="w-full px-2 md:px-6 mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between px-2 pt-2">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {lang === 'km' ? "ជំហានទី ១៖ ជ្រើសរើសប្រភេទរបាយការណ៍" : "Step 1: Choose your report type"}
          </h2>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">1</div>
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 flex items-center justify-center font-bold">2</div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder={lang === 'km' ? "ស្វែងរករបាយការណ៍នៅទីនេះ..." : "Search report type here..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-md py-4 pl-12 pr-6 outline-none focus:border-primary shadow-sm font-medium text-gray-700 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-md shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="p-4 bg-gray-50/50 border-b-2 border-gray-100 dark:bg-gray-900/50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid size={14} /> {lang === 'km' ? "របាយការណ៍" : "Report Categories"}
            </h3>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {groupedReports.attendance.length > 0 && (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-900/30 rounded flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-bold text-primary">{lang === 'km' ? "វត្តមាន (Attendance)" : "Attendance"}</span>
                </div>
                <div className="space-y-1">
                  {groupedReports.attendance.map(report => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left px-6 py-3 rounded-md transition-all flex items-center justify-between group ${
                        selectedReport?.id === report.id ? "bg-primary text-white shadow-md" : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black w-8 h-8 flex items-center justify-center rounded border ${
                          selectedReport?.id === report.id ? "border-white/30" : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}>
                          {report.code}
                        </span>
                        <span className="font-bold text-sm">
                          {report.code} - {report.titleEn} / {report.titleKh}
                        </span>
                      </div>
                      {selectedReport?.id === report.id && <CheckCircle2 size={18} className="text-blue-300 animate-in zoom-in" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {groupedReports.grades.length > 0 && (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/30 rounded flex items-center gap-2">
                  <GraduationCap size={16} className="text-emerald-700" />
                  <span className="text-sm font-bold text-emerald-700">{lang === 'km' ? "ផ្នែកពិន្ទុ (Grades)" : "Grades"}</span>
                </div>
                <div className="space-y-1">
                  {groupedReports.grades.map(report => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left px-6 py-3 rounded-md transition-all flex items-center justify-between group ${
                        selectedReport?.id === report.id ? "bg-primary text-white shadow-md" : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black w-8 h-8 flex items-center justify-center rounded border ${
                          selectedReport?.id === report.id ? "border-white/30" : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}>
                          {report.code}
                        </span>
                        <span className="font-bold text-sm">
                          {report.code} - {report.titleEn} / {report.titleKh}
                        </span>
                      </div>
                      {selectedReport?.id === report.id && <CheckCircle2 size={18} className="text-blue-300 animate-in zoom-in" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-6 flex items-center justify-end mt-2 pointer-events-none z-20">
          <button
            disabled={!selectedReport}
            onClick={() => setStep(2)}
            className="pointer-events-auto bg-primary hover:opacity-90 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-bold shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center gap-3 transition-all active:scale-95"
          >
            {lang === 'km' ? "បន្ទាប់" : "Next"}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // --- Step 2 View (Configuration) ---
  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-white border-2 border-primary p-8 rounded-md shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm transition-colors"
            >
              <ArrowLeft size={18} /> {lang === 'km' ? "ត្រឡប់ក្រោយ" : "Back"}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold">1</div>
              <div className="w-12 h-1 bg-primary rounded-full"></div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg">2</div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-sans font-bold text-primary">
                {selectedReport?.code} - {selectedReport?.titleEn} / {selectedReport?.titleKh}
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                {lang === 'km' ? "កំណត់រចនាសម្ព័ន្ធរបាយការណ៍" : "Report Configuration"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t("class")}</label>
                <select 
                  value={filters.classroomId}
                  onChange={(e) => setFilters(prev => ({ ...prev, classroomId: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-md px-4 py-4 outline-none focus:border-primary font-bold text-gray-700 appearance-none shadow-inner dark:bg-gray-900/50"
                >
                  <option value="">--- ជ្រើសថ្នាក់ ---</option>
                  {(classroomsData?.data || []).map((c: any) => (
                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t("academicYear")}</label>
                <select 
                  value={filters.academicYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-md px-4 py-4 outline-none focus:border-primary font-bold text-gray-700 appearance-none shadow-inner dark:bg-gray-900/50"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                </select>
              </div>

              {(selectedReport?.id.includes("monthly") || selectedReport?.id.includes("weekly") || selectedReport?.id === "gr-recording") && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t("month")}</label>
                  <select 
                    value={filters.month}
                    onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-md px-4 py-4 outline-none focus:border-primary font-bold text-gray-700 appearance-none shadow-inner dark:bg-gray-900/50"
                  >
                    {["November", "December", "January", "February", "March", "April", "May", "June", "July"].map(m => (
                      <option key={m} value={m}>{lang === 'km' ? (MONTH_KH[m] || m) : m}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedReport?.id === "att-semester" && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t("semester")}</label>
                  <select 
                    value={filters.semester}
                    onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-md px-4 py-4 outline-none focus:border-primary font-bold text-gray-700 appearance-none shadow-inner dark:bg-gray-900/50"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              )}

              {selectedReport?.id === "att-weekly" && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{lang === 'km' ? "សប្តាហ៍ទី" : "Week"}</label>
                  <select 
                    value={filters.week}
                    onChange={(e) => setFilters(prev => ({ ...prev, week: e.target.value }))}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-md px-4 py-4 outline-none focus:border-primary font-bold text-gray-700 appearance-none shadow-inner dark:bg-gray-900/50"
                  >
                    <option value="1">{lang === 'km' ? "សប្តាហ៍ទី១ (ថ្ងៃ ១-៦)" : "Week 1 (Days 1-6)"}</option>
                    <option value="2">{lang === 'km' ? "សប្តាហ៍ទី២ (ថ្ងៃ ៧-១២)" : "Week 2 (Days 7-12)"}</option>
                    <option value="3">{lang === 'km' ? "សប្តាហ៍ទី៣ (ថ្ងៃ ១៣-១៨)" : "Week 3 (Days 13-18)"}</option>
                    <option value="4">{lang === 'km' ? "សប្តាហ៍ទី៤ (ថ្ងៃ ១៩-២៤)" : "Week 4 (Days 19-24)"}</option>
                    <option value="5">{lang === 'km' ? "សប្តាហ៍ទី៥ (ថ្ងៃ ២៥-៣១)" : "Week 5 (Days 25-31)"}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-10 border-t">
              <button 
                onClick={generateReport}
                disabled={isGenerating || !filters.classroomId}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-md font-bold shadow-lg flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 min-w-[240px] justify-center"
              >
                {isGenerating ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                {lang === 'km' ? "ទាញយករបាយការណ៍ (.xlsx)" : "Download Report (.xlsx)"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 3 View (Report Preview) ---
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between no-print">
        <button 
          onClick={() => setStep(2)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm transition-colors bg-white px-4 py-2 rounded-md border shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <ArrowLeft size={18} /> {lang === 'km' ? "កែតម្រូវការកំណត់" : "Adjust Settings"}
        </button>
      </div>

      <YearEndSummary 
        data={reportData} 
        onPrint={() => window.print()}
      />
    </div>
  );
}