import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useListClassrooms } from "@workspace/api-client-react";
import { 
  ArrowLeft, 
  Download, 
  Calculator, 
  Award, 
  Calendar,
  School,
  CheckCircle2,
  RefreshCw,
  Settings,
  ChevronRight,
  Users,
  ChevronDown,
  FileSpreadsheet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToMoEYSExcel, ReportType } from "@/lib/export";
import api from "@/lib/axiosConfig";

const SPECIAL_FIELDS: any[] = [];

const MONTHS = [
  { id: "November", km: "វិច្ឆិកា" },
  { id: "December", km: "ធ្នូ" },
  { id: "January", km: "មករា" },
  { id: "February", km: "កុម្ភៈ" },
  { id: "March", km: "មីនា" },
  { id: "May", km: "ឧសភា" },
  { id: "June", km: "មិថុនា" },
  { id: "July", km: "កក្កដា" },
  { id: "August", km: "សីហា" },
  { id: "September", km: "កញ្ញា" },
  { id: "Semester 1", km: "ឆមាសទី ១" },
  { id: "Semester 2", km: "ឆមាសទី ២" },
  { id: "Diagnostic Test", km: "តេស្តដើមឆ្នាំ" },
  { id: "Diagnostic Test End", km: "តេស្តចុងឆ្នាំ" },
];

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

const getGrade = (avg: number) => {
  const safeAvg = isNaN(avg) ? 0 : avg;
  if (safeAvg >= 45) return { label: "A", color: "text-green-600 bg-green-50" };
  if (safeAvg >= 40) return { label: "B", color: "text-blue-600 bg-blue-50" };
  if (safeAvg >= 35) return { label: "C", color: "text-yellow-600 bg-yellow-50" };
  if (safeAvg >= 30) return { label: "D", color: "text-orange-600 bg-orange-50" };
  if (safeAvg >= 25) return { label: "E", color: "text-pink-600 bg-pink-50" };
  return { label: "F", color: "text-red-600 bg-red-50" };
};

function DashboardView({ 
  onStart,
  classroomId,
  setClassroomId,
  academicYear,
  setAcademicYear
}: { 
  onStart: (period: string) => void,
  classroomId: string,
  setClassroomId: (id: string) => void,
  academicYear: string,
  setAcademicYear: (year: string) => void
}) {
  const { lang, t } = useTranslation();
  const { token } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("");

  const { data: classrooms } = useListClassrooms({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  return (
    <div className="w-full py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 font-sans">
      <div className="mb-16 border-b border-gray-100 pb-10">
        <h1 className="text-3xl md:text-4xl text-primary mb-4" style={{ fontFamily: "'Moul', serif" }}>
          {t("gradingSystem")}
        </h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-gray-400 font-medium">រៀបចំ និងគ្រប់គ្រងទិន្នន័យពិន្ទុសិស្សានុសិស្សតាមឆមាស និងតាមខែ</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black text-primary uppercase tracking-widest">Academic Year: {academicYear}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            <Users size={14} className="text-primary" /> ១. ជ្រើសរើសថ្នាក់រៀន
          </label>
          <div className="relative group">
            <select 
              value={classroomId} 
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-6 py-4.5 focus:border-primary focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none font-bold text-gray-700 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="">--- ជ្រើសរើសថ្នាក់ ---</option>
              {classrooms?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-primary transition-colors rotate-90" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            <Calendar size={14} className="text-indigo-600" /> ២. ឆ្នាំសិក្សា
          </label>
          <div className="relative group">
            <select 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-6 py-4.5 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none font-bold text-gray-700 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="2024-2025">២០២៤-២០២៥</option>
              <option value="2023-2024">២០២៣-២០២៤</option>
            </select>
            <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-indigo-600 transition-colors rotate-90" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            <Settings size={14} className="text-emerald-600" /> ៣. ខែ ឬ ឆមាស
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group flex-1">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-6 py-4.5 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 outline-none transition-all appearance-none font-bold text-gray-700 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="">--- ខែ/ឆមាស ---</option>
                <optgroup label="តេស្តរោគវិនិច្ឆ័យ (Diagnostic)">
                  <option value="Diagnostic Test">📊 តេស្តដើមឆ្នាំ (Diagnostic Test)</option>
                  <option value="Diagnostic Test End">📊 តេស្តចុងឆ្នាំ (Diagnostic Test End)</option>
                </optgroup>
                <optgroup label="ឆមាសទី ១">
                  {MONTHS.slice(0, 5).map(m => <option key={m.id} value={m.id}>{m.km}</option>)}
                  <option value="Semester 1">📝 ប្រឡងឆមាសទី ១</option>
                </optgroup>
                <optgroup label="ឆមាសទី ២">
                  {MONTHS.slice(5, 10).map(m => <option key={m.id} value={m.id}>{m.km}</option>)}
                  <option value="Semester 2">📝 ប្រឡងឆមាសទី ២</option>
                </optgroup>
              </select>
              <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-emerald-600 transition-colors rotate-90" />
            </div>
            
            <button 
              disabled={!classroomId || !selectedMonth}
              onClick={() => onStart(selectedMonth)}
              className="bg-primary hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg px-8 py-4 font-bold transition-all hover:shadow-lg hover:shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              ចាប់ផ្តើម <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataEntryView({ 
  period: initialPeriod, 
  classroomId,
  setClassroomId,
  academicYear,
  setAcademicYear,
  onBack 
}: { 
  period: string; 
  classroomId: string;
  setClassroomId: (id: string) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  onBack: () => void 
}) {
  const { lang, t } = useTranslation();
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [period, setPeriod] = useState<string>(initialPeriod);
  const [scoresDraft, setScoresDraft] = useState<Record<number, Record<string, number>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [absencesData, setAbsencesData] = useState<Record<number, { excused: number, unexcused: number }>>({});

  useEffect(() => {
    if (!classroomId || !period) return;
    const fetchAbsences = async () => {
      try {
        const res = await api.get(`/attendance/absences?classroomId=${classroomId}&academicYear=${academicYear}&month=${period}`);
        setAbsencesData(res.data.data || {});
      } catch (error) {
        console.error("Failed to fetch absences summary:", error);
      }
    };
    fetchAbsences();
  }, [classroomId, academicYear, period, token]);

  const { data: classroomsData } = useListClassrooms({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });
  const classrooms = Array.isArray(classroomsData?.data) ? classroomsData.data : [];

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", "classId", classroomId],
    queryFn: async () => {
      const res = await api.get(`/students?classId=${classroomId}&limit=100`);
      return res.data?.data || [];
    },
    enabled: !!classroomId,
  });

  const { data: gradesData, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["grades", classroomId, academicYear, period],
    queryFn: async () => {
      const res = await api.get(`/grades?classroomId=${classroomId}&academicYear=${academicYear}&examPeriod=${period}`);
      return res.data?.data || [];
    },
    enabled: !!classroomId,
  });

  const { data: configsData } = useQuery({
    queryKey: ["subject-configs", classroomId],
    queryFn: async () => {
      const cls = classrooms.find(c => c.id.toString() === classroomId);
      if (!cls) return [];
      const gradeLevelStr = cls.grade || "";
      const grade = parseInt(gradeLevelStr.replace(/[^0-9]/g, "")) || 0;
      const isScience = (cls.name || "").toUpperCase().includes("A");
      const res = await api.get(`/subject-configs?gradeLevel=${grade}&isScienceTrack=${isScience}`);
      return res.data?.data || [];
    },
    enabled: !!classroomId && classrooms.length > 0
  });

  useEffect(() => {
    if (gradesData) {
      const initial: Record<number, Record<string, number>> = {};
      gradesData.forEach((g: any) => {
        initial[g.studentId] = g.scores || {};
      });
      setScoresDraft(initial);
    }
  }, [gradesData]);

  const activeSubjects = useMemo(() => {
    if (!configsData || configsData.length === 0) return [];
    
    // Check if the database has absolutely zero custom configs for this grade/track
    const hasAnyCustomConfig = configsData.some((c: any) => c.maxScore !== null && c.maxScore !== undefined);
    
    if (!hasAnyCustomConfig) {
      // Fallback: If no custom configs are saved, make ALL subjects active with default max score and coefficient matching their Excel
      return configsData.map((c: any) => {
        const def = DEFAULT_MOEYS_CONFIGS[c.code] || { max: 50.00, coeff: 1.0 };
        return {
          id: c.id.toString(),
          km: c.nameKh,
          en: c.nameEn,
          code: c.code,
          max: def.max,
          coeff: def.coeff
        };
      });
    }
    
    // Otherwise, respect the saved configuration: filter out disabled subjects (maxScore = 0 or null)
    return configsData
      .filter((c: any) => c.maxScore && parseFloat(c.maxScore) > 0)
      .map((c: any) => ({
        id: c.id.toString(),
        km: c.nameKh,
        en: c.nameEn,
        code: c.code,
        max: parseFloat(c.maxScore),
        coeff: parseFloat(c.coefficient || "1.0")
      }));
  }, [configsData]);

  const rankedStudents = useMemo(() => {
    if (!studentsData) return [];
    
    const withStats = studentsData.map((s: any) => {
      const sScores = scoresDraft[s.id] || {};
      let totalActual = 0;
      let totalCoeff = 0;
      
      activeSubjects.forEach((sub: any) => {
        const val = sScores[sub.id];
        const score = (typeof val === 'number' && !isNaN(val)) ? val : 0;
        totalActual += score;
        totalCoeff += sub.coeff;
      });

      const avg = totalCoeff > 0 ? (totalActual / totalCoeff) : 0;
      return { ...s, total: totalActual, avg, scores: sScores };
    });

    const sortedForRank = [...withStats].sort((a, b) => b.avg - a.avg);
    const withRank = withStats.map((s: any) => ({
      ...s,
      rank: s.avg > 0 ? sortedForRank.findIndex(x => x.id.toString() === s.id.toString()) + 1 : "-"
    }));

    if (sortConfig) {
      withRank.sort((a: any, b: any) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];
        if (aValue === "-" || aValue === undefined) return 1;
        if (bValue === "-" || bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return withRank;
  }, [studentsData, scoresDraft, sortConfig, activeSubjects]);

  const saveScore = async (studentId: number, subject: string, value: any) => {
    const uniqueKey = `${studentId}-${subject}`;
    if (value === "" || value === undefined) return;

    setSavingId(uniqueKey);
    setLastSavedId(null);
    
    try {
      const payload = {
        studentId,
        classId: Number(classroomId),
        academicYear,
        month: period,
        subject,
        score: parseFloat(value) || 0
      };

      await api.post('/grades/save', payload);
      setLastSavedId(uniqueKey);
      
    } catch (error) {
      toast({ 
        title: "បរាជ័យ", 
        description: "មិនអាចរក្សាទុកទិន្នន័យបានទេ ។", 
        variant: "destructive" 
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleScoreChange = (studentId: number, subject: string, value: string) => {
    setScoresDraft(prev => {
      const next = { ...prev };
      if (!next[studentId]) next[studentId] = {};
      const parsed = parseFloat(value);
      next[studentId] = {
        ...next[studentId],
        [subject]: value === "" ? 0 : (isNaN(parsed) ? 0 : parsed)
      };
      return next;
    });
  };

  const isLoading = isLoadingStudents || isLoadingGrades;

  return (
    <div className="space-y-6 max-w-full font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-0 z-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 hover:bg-gray-50 rounded-lg bg-white border border-gray-100 shadow-sm transition-all active:scale-95 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl text-primary font-bold flex items-center gap-3">
              <Calculator className="text-primary" /> 
              {lang === 'km' ? 'បញ្ចូលពិន្ទុ និងអវត្តមាន' : 'Data Entry: Scores & Attendance'}
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 ml-1">
              {MONTHS.find(m => m.id === period)?.km || period} • {academicYear}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100 dark:bg-gray-900/50">
            <div className="flex items-center gap-2 px-3">
               <School size={16} className="text-primary" />
               <select 
                value={classroomId} 
                onChange={(e) => setClassroomId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 outline-none min-w-[100px]"
              >
                <option value="">-- {lang === 'km' ? 'ជ្រើសរើសថ្នាក់' : 'Select Class'} --</option>
                {classrooms?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2 px-3">
               <Calendar size={16} className="text-primary" />
               <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 outline-none min-w-[100px]"
              >
                {MONTHS.map((m) => (
                  <option key={m.id} value={m.id}>{m.km}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-6 py-3.5 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95"
            >
              <Download size={18} /> {lang === 'km' ? 'ទាញយកឯកសារ' : 'Export Reports'} <ChevronDown size={16} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <div className="px-4 py-2 mb-2 border-b border-gray-50">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ជ្រើសរើសប្រភេទបញ្ជី</span>
                </div>
                {[
                  { id: 'all_subjects_recording', km: 'បញ្ជីសម្រង់ពិន្ទុសិស្សគ្រប់មុខវិជ្ជា (គំរូ)', icon: <FileSpreadsheet size={16} /> },
                  { id: 'monthly_summary', km: 'បញ្ជីស្រង់ពិន្ទុប្រចាំខែ', icon: <FileSpreadsheet size={16} /> },
                  { id: 'monthly_rank', km: 'បញ្ជីចំណាត់ថ្នាក់ប្រចាំខែ', icon: <Award size={16} /> },
                  { id: 'semester_summary', km: 'បញ្ជីស្រង់ពិន្ទុឆមាស', icon: <FileSpreadsheet size={16} /> },
                  { id: 'semester_rank', km: 'បញ្ជីចំណាត់ថ្នាក់ឆមាស', icon: <Award size={16} /> },
                  { id: 'semester_exam', km: 'បញ្ជីពិន្ទុប្រឡងឆមាស', icon: <FileSpreadsheet size={16} /> },
                  { id: 'annual_summary', km: 'បញ្ជីស្រង់ពិន្ទុប្រចាំឆ្នាំ', icon: <FileSpreadsheet size={16} /> },
                  { id: 'annual_rank', km: 'បញ្ជីចំណាត់ថ្នាក់ប្រចាំឆ្នាំ', icon: <Award size={16} /> },
                  { id: 'diagnostic_test', km: 'លទ្ធផលតេស្តដើមឆ្នាំ', icon: <Award size={16} /> },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      exportToMoEYSExcel({
                        month: MONTHS.find(m => m.id === period)?.km || period,
                        className: classrooms.find(c => c.id.toString() === classroomId)?.name || "",
                        year: academicYear,
                        students: rankedStudents,
                        subjectConfigs: activeSubjects,
                        reportType: opt.id as ReportType
                      });
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 text-xs font-bold transition-colors flex items-center gap-3 border-l-4 border-transparent hover:border-primary"
                  >
                    <span className="text-blue-600 bg-blue-50 p-1.5 rounded-lg">{opt.icon}</span>
                    {opt.km}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {classroomId ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden relative dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto spreadsheet-container custom-scrollbar">
            {isLoading ? (
              <div className="p-24 text-center flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-primary mb-4" size={48} />
                <p className="text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse">{t("loading")}</p>
              </div>
            ) : rankedStudents && rankedStudents.length > 0 ? (
              <table className="w-full text-left text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-5 font-bold uppercase tracking-wider text-[11px] sticky left-0 top-0 bg-primary z-50 text-center border-b border-white/5 border-r border-white/10 w-16">#</th>
                    <th 
                      className="p-5 font-bold uppercase tracking-wider text-[11px] sticky left-16 top-0 bg-primary z-50 min-w-[100px] border-b border-white/5 border-r border-white/10 cursor-pointer hover:opacity-90"
                      onClick={() => setSortConfig({ key: 'studentId', direction: sortConfig?.key === 'studentId' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    >
                      {lang === 'km' ? 'អត្តលេខ' : 'ID'}
                    </th>
                    <th className="p-5 font-bold uppercase tracking-wider text-[11px] sticky left-[116px] top-0 bg-primary z-50 min-w-[200px] border-b border-white/5 border-r border-white/10 shadow-[4px_0_15px_rgba(0,0,0,0.15)]">{lang === 'km' ? 'ឈ្មោះសិស្ស' : 'Name'}</th>
                    
                    {activeSubjects.map((sub: any) => (
                      <th key={sub.id} className="p-4 font-black uppercase tracking-widest text-xs text-center sticky top-0 bg-primary z-30 min-w-[110px] border-b border-white/10 border-r border-white/20">
                        {lang === 'km' ? sub.km : sub.en}
                      </th>
                    ))}

                    <th className="p-4 font-black uppercase tracking-widest text-xs text-center sticky top-0 bg-primary z-30 min-w-[100px] border-b border-white/10 border-r border-white/20">{lang === 'km' ? 'សរុប' : 'Total'}</th>
                    <th 
                      className="p-4 font-black uppercase tracking-widest text-xs text-center sticky top-0 bg-primary z-30 min-w-[110px] border-b border-white/10 border-r border-white/20 cursor-pointer hover:bg-blue-800"
                      onClick={() => setSortConfig({ key: 'avg', direction: sortConfig?.key === 'avg' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                    >
                      {lang === 'km' ? 'មធ្យមភាគ' : 'Average'}
                    </th>
                    <th 
                      className="p-4 font-black uppercase tracking-widest text-xs text-center sticky top-0 bg-primary z-30 min-w-[100px] border-b border-white/10 border-r border-white/20 cursor-pointer hover:bg-blue-800"
                      onClick={() => setSortConfig({ key: 'rank', direction: sortConfig?.key === 'rank' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    >
                      {lang === 'km' ? 'ចំណាត់ថ្នាក់' : 'Rank'}
                    </th>
                    <th className="p-4 font-black uppercase tracking-widest text-xs text-center sticky top-0 right-0 bg-[#0f172a] z-40 min-w-[80px] border-b border-white/10">{lang === 'km' ? 'និទ្ទេស' : 'Grade'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rankedStudents.map((student: any, index: number) => {
                    const gradeInfo = getGrade(student.avg);
                    const sScores = scoresDraft[student.id] || {};

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="p-3 text-center font-bold text-gray-400 sticky left-0 bg-white group-hover:bg-blue-50/50 z-20 border-r border-gray-100 border-b dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">{index + 1}</td>
                        <td className="p-3 font-mono text-xs text-blue-600 sticky left-12 bg-white group-hover:bg-blue-50/50 z-20 border-r border-gray-100 border-b uppercase dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">{student.studentId}</td>
                        <td className="p-3 font-black text-primary sticky left-[112px] bg-white group-hover:bg-blue-50/50 z-20 border-r border-gray-100 border-b shadow-[4px_0_10px_rgba(0,0,0,0.03)] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                          {student.nameKh}
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{student.nameEn}</div>
                        </td>
                        
                        {activeSubjects.map((sub: any) => {
                          const isConduct = sub.code === "CND" || sub.km?.includes("សីលធម៌") || sub.en?.toLowerCase().includes("conduct");
                          const studentAbsences = absencesData[student.id] || { excused: 0, unexcused: 0 };
                          const unexcused = studentAbsences.unexcused || 0;
                          const recommendedConduct = Math.max(0, sub.max - unexcused * 2);

                          return (
                            <td key={sub.id} className="p-0 text-center border-r border-gray-100 border-b relative">
                              <input
                                type="number"
                                min="0"
                                max="200"
                                step="any"
                                value={sScores[sub.id] === undefined ? "" : sScores[sub.id]}
                                onChange={(e) => handleScoreChange(student.id, sub.id, e.target.value)}
                                onBlur={(e) => saveScore(student.id, sub.id, e.target.value)}
                                className={`w-full h-14 bg-transparent text-center font-bold text-sm outline-none focus:bg-blue-100/50 focus:ring-2 focus:ring-inset focus:ring-primary transition-all text-gray-700 ${isConduct && unexcused > 0 ? 'pb-3' : ''}`}
                              />
                              {isConduct && unexcused > 0 && (
                                <div 
                                  className="absolute bottom-0.5 left-0 right-0 text-[8px] text-red-500 font-bold pointer-events-none leading-none select-none"
                                  title={`អវត្តមានអត់ច្បាប់៖ ${unexcused}ដង (ពិន្ទុណែនាំ៖ ${recommendedConduct})`}
                                >
                                  អត់ច្បាប់: {unexcused}ដង (ណែនាំ: {recommendedConduct})
                                </div>
                              )}
                              {savingId === `${student.id}-${sub.id}` && (
                                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center pointer-events-none">
                                  <RefreshCw size={14} className="text-blue-600 animate-spin" />
                                </div>
                              )}
                              {lastSavedId === `${student.id}-${sub.id}` && (
                                <div className="absolute top-1 right-1 pointer-events-none">
                                  <CheckCircle2 size={12} className="text-green-500 animate-bounce" />
                                </div>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-3 font-bold text-gray-600 text-center bg-gray-50/30 border-b border-r border-gray-100 dark:bg-gray-900/50">
                          {student.total > 0 ? student.total.toFixed(1) : "-"}
                        </td>
                        <td className="p-3 font-black text-blue-800 text-center bg-blue-50/50 border-b border-r border-gray-100">
                          <span className={`${student.avg < 25 ? 'text-red-600' : 'text-blue-800'}`}>
                            {student.avg > 0 ? student.avg.toFixed(2) : "-"}
                          </span>
                        </td>
                        <td className="p-3 font-black text-amber-700 text-center bg-amber-50/20 border-b border-r border-gray-100">
                          {student.avg > 0 ? (
                            <div className="inline-flex items-center gap-1">
                               <Award size={14} className={student.rank === 1 ? "text-yellow-500" : "text-gray-300"} />
                               {student.rank}
                            </div>
                          ) : "-"}
                        </td>
                        <td className={`p-3 font-black text-center sticky right-0 z-20 border-b shadow-[-4px_0_10px_rgba(0,0,0,0.03)] ${gradeInfo.color}`}>
                          {student.avg > 0 ? gradeInfo.label : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-24 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6 dark:bg-gray-900/50">
                  <Users className="text-gray-300" size={40} />
                </div>
                <h3 className="text-xl text-primary mb-2">{lang === 'km' ? 'គ្មានទិន្នន័យសិស្ស' : 'No Students Found'}</h3>
                <p className="text-gray-500 font-medium">{lang === 'km' ? 'មិនមានសិស្សនៅក្នុងថ្នាក់រៀននេះទេ។ សូមជ្រើសរើសថ្នាក់ផ្សេង។' : 'This classroom is empty. Please select another class.'}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-[500px] flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-xl bg-white shadow-sm group dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="p-8 bg-blue-50 rounded-full mb-8 group-hover:scale-110 transition-transform duration-700 ease-out">
            <School className="text-blue-300" size={80} />
          </div>
          <h3 className="text-2xl text-primary mb-2">{lang === 'km' ? 'រង់ចាំការជ្រើសរើស' : 'Awaiting Selection'}</h3>
          <p className="text-gray-400 text-center max-w-sm font-bold uppercase tracking-widest text-xs">
            {lang === 'km' ? 'សូមជ្រើសរើសថ្នាក់រៀននៅផ្នែកខាងលើ ដើម្បីចាប់ផ្តើម' : 'Please select a classroom to load student data'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function GradesPage() {
  const [period, setPeriod] = useState<string | null>(null);
  const [classroomId, setClassroomId] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("2024-2025");

  return (
    <div className="space-y-6">
      {!period ? (
        <DashboardView 
          onStart={setPeriod} 
          classroomId={classroomId}
          setClassroomId={setClassroomId}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
        />
      ) : (
        <DataEntryView 
          period={period} 
          classroomId={classroomId}
          setClassroomId={setClassroomId}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          onBack={() => setPeriod(null)} 
        />
      )}
    </div>
  );
}
