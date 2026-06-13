import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { 
  useListClassrooms, 
  useListStudents, 
  useListTeachers 
} from "@workspace/api-client-react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  Save, 
  Search,
  School,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axiosConfig";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";

type AttendanceStatus = "present" | "excused" | "unexcused";
type ViewState = "selection" | "calendar" | "list";

const GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

const MOCK_SCHEDULES: Record<string, Record<number, string[]>> = {
  morning: {
    1: ["math", "physics"],
    2: ["khmer", "history"],
    3: ["biology", "chemistry"],
    4: ["english", "math"],
    5: ["khmer", "geography"],
    6: ["homeEconomics", "art"],
  },
  afternoon: {
    1: ["english", "khmer"],
    2: ["math", "geography"],
    3: ["physics", "history"],
    4: ["chemistry", "biology"],
    5: ["art", "math"],
    6: ["khmer", "english"],
  }
};

export default function AttendancePage() {
  const { lang, t } = useTranslation();
  const { token, user } = useAuth();
  const { toast } = useToast();
  
  const [view, setView] = useState<ViewState>("selection");
  const [classroomId, setClassroomId] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [shift, setShift] = useState<"morning" | "afternoon">("morning");
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  
  const [attendanceData, setAttendanceData] = useState<Record<number, { status: AttendanceStatus, remarks: string }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing attendance records from backend
  useEffect(() => {
    if (view !== "list" || !classroomId || !selectedDate || !selectedSubject) return;
    
    const fetchAttendance = async () => {
      setIsLoadingAttendance(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await api.get(`/attendance?classroomId=${classroomId}&academicYear=2024-2025&date=${dateStr}&shift=${shift}&subject=${selectedSubject}`);
        const json = res.data;
        const fetchedData: Record<number, { status: AttendanceStatus, remarks: string }> = {};
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach((r: any) => {
              fetchedData[r.studentId] = {
                status: r.status as AttendanceStatus,
                remarks: r.remarks || ""
              };
            });
          }
        setAttendanceData(fetchedData);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setIsLoadingAttendance(false);
      }
    };
    
    fetchAttendance();
  }, [view, classroomId, selectedDate, selectedSubject, shift, token]);

  const { data: realScheduleRes } = useQuery({
    queryKey: ['schedules', 'class', classroomId],
    queryFn: async () => {
      const res = await api.get(`/schedules/class/${classroomId}?semester=Semester1&academicYear=2026`);
      return res.data?.rows || res.data;
    },
    enabled: !!classroomId && view === "calendar"
  });

  const scheduleMap = useMemo(() => {
    const map: Record<string, Record<number, any[]>> = {
      morning: {},
      afternoon: {}
    };
    for(let i=0; i<=6; i++) {
        map.morning[i] = [];
        map.afternoon[i] = [];
    }

    if (!realScheduleRes || !Array.isArray(realScheduleRes)) return map;

    const dayNameToIndex: Record<string, number> = {
        'ចន្ទ': 1, 'អង្គារ': 2, 'ពុធ': 3, 'ព្រហស្បតិ៍': 4, 'សុក្រ': 5, 'សៅរ៍': 6, 'អាទិត្យ': 0
    };

    realScheduleRes.forEach((row: any) => {
        const dayIdx = dayNameToIndex[row.day_name_kh] ?? 1;
        // Shift logic: periods 1-3 are morning, 4+ are afternoon
        const isAfternoon = row.period_number >= 4;
        const shiftKey = isAfternoon ? 'afternoon' : 'morning';
        
        map[shiftKey][dayIdx].push({
            subject: row.subject_name,
            teacher: row.teacher_name,
            period: row.period_number,
            room: row.room_code
        });
    });
    
    // Sort by period
    for(let i=0; i<=6; i++) {
        map.morning[i].sort((a,b) => a.period - b.period);
        map.afternoon[i].sort((a,b) => a.period - b.period);
    }
    
    return map;
  }, [realScheduleRes]);

  const isAdmin = user?.role === "admin" || !user?.role; // Default to admin for legacy sessions

  const { data: classrooms } = useListClassrooms({ 
    request: { headers: { Authorization: `Bearer ${token}` } } 
  });

  const { data: teachers } = useListTeachers({ 
    request: { headers: { Authorization: `Bearer ${token}` } } 
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useListStudents(undefined, { 
    request: { headers: { Authorization: `Bearer ${token}` } } 
  });

  const filteredClassrooms = useMemo(() => {
    if (!classrooms?.data) return [];
    if (isAdmin) return classrooms.data;
    // For teachers, only show classrooms where they are the advisor
    // Assuming user.id corresponds to teacherId in Classroom
    return classrooms.data.filter((c: any) => c.teacherId === user?.id);
  }, [classrooms, isAdmin, user]);
  const filteredStudents = useMemo(() => {
    if (!studentsData?.data || !classroomId) return [];
    let result = studentsData.data.filter((s: any) => (s.classId || s.classroomId)?.toString() === classroomId);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s: any) => 
        s.nameKh?.toLowerCase().includes(q) ||
        s.nameEn?.toLowerCase().includes(q) ||
        (s.studentId && s.studentId.toLowerCase().includes(q))
      );
    }
    return result;
  }, [studentsData, classroomId, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredStudents.length;
    let present = 0;
    let excused = 0;
    let unexcused = 0;

    filteredStudents.forEach((student: any) => {
      const status = attendanceData[student.id]?.status || "present";
      if (status === "present") present++;
      else if (status === "excused") excused++;
      else if (status === "unexcused") unexcused++;
    });

    return { total, present, excused, unexcused };
  }, [filteredStudents, attendanceData]);

  // Calendar Logic
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceData(prev => ({ 
      ...prev, 
      [studentId]: { 
        status, 
        remarks: prev[studentId]?.remarks || "" 
      } 
    }));
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setAttendanceData(prev => ({ 
      ...prev, 
      [studentId]: { 
        status: prev[studentId]?.status || "present", 
        remarks 
      } 
    }));
  };

  const handleSave = async () => {
    if (!classroomId || !selectedDate || !selectedSubject) return;
    
    setIsSaving(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Build list of records for all students in the classroom
      const records = filteredStudents.map((s: any) => {
        const record = attendanceData[s.id] || { status: "present", remarks: "" };
        return {
          studentId: s.id,
          status: record.status,
          remarks: record.remarks || ""
        };
      });
      
      await api.post('/attendance/bulk', {
        classroomId: Number(classroomId),
        academicYear: "2024-2025",
        date: dateStr,
        shift,
        subject: selectedSubject,
        records
      });
      
      setLastSaved(new Date());
      toast({
        title: lang === 'km' ? "រក្សាទុកដោយជោគជ័យ" : t("saveSuccess"),
        description: lang === 'km' ? "វត្តមានត្រូវបានរក្សាទុកក្នុង Database រួចរាល់" : t("attendanceSuccess"),
      });
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast({
        title: lang === 'km' ? "បរាជ័យ" : "Error",
        description: lang === 'km' ? "មិនអាចរក្សាទុកទិន្នន័យវត្តមានបានទេ" : "Failed to save attendance records",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAllPresent = () => {
    const newData = { ...attendanceData };
    filteredStudents.forEach((student: any) => {
      newData[student.id] = { status: "present", remarks: "" };
    });
    setAttendanceData(newData);
    toast({
      title: lang === 'km' ? "វត្តមានទាំងអស់" : "Marked All Present",
      description: lang === 'km' ? "សិស្សទាំងអស់ត្រូវបានកំណត់វត្តមាន" : "All filtered students marked as present",
    });
  };

  const selectedClass = classrooms?.data.find(c => c.id.toString() === classroomId);

  // --- Views ---

  // --- Views ---
  // Note: We avoid defining these as sub-components inside the parent to prevent remounting on every state change.




  return (
    <div className="pb-20">
      {view === "selection" && (
        <div className="w-full py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-sans font-bold text-primary">{t("attendance")}</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              {isAdmin ? t("adminPortalControl") : t("teacherAccessTerminal")}
            </p>
          </div>

          {/* Shift Toggle */}
          <div className="flex justify-center">
            <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm flex gap-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <button 
                onClick={() => setShift("morning")}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${shift === "morning" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:bg-gray-50"}`}
              >
                {t("morningShift")}
              </button>
              <button 
                onClick={() => setShift("afternoon")}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${shift === "afternoon" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:bg-gray-50"}`}
              >
                {t("afternoonShift")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isAdmin && (
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  <GraduationCap size={14} className="text-primary" /> {t("selectTeacher")}
                </label>
                <select 
                  value={teacherId} 
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-5 py-4 focus:border-primary outline-none appearance-none font-bold text-gray-700 dark:bg-gray-900/50"
                >
                  <option value="">--- {t("selectTeacher")} ---</option>
                  {teachers?.data.map((teach: any) => (
                    <option key={teach.id} value={teach.id}>{lang === 'km' ? teach.nameKh : teach.nameEn}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                <LayoutGrid size={14} className="text-primary" /> {t("selectGrade")}
              </label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-5 py-4 focus:border-primary outline-none appearance-none font-bold text-gray-700 dark:bg-gray-900/50"
              >
                <option value="">--- {t("selectGrade")} ---</option>
                {GRADES.map(g => <option key={g} value={g}>{t(g.toLowerCase().replace(" ", ""))}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                <School size={14} className="text-primary" /> {t("selectClass")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredClassrooms.filter(c => !grade || c.grade === grade).length > 0 ? (
                  filteredClassrooms
                    .filter(c => !grade || c.grade === grade)
                    .map(c => (
                      <button
                        key={c.id}
                        onClick={() => setClassroomId(c.id.toString())}
                        className={`p-4 rounded-lg border-2 transition-all font-bold text-sm ${
                          classroomId === c.id.toString() 
                          ? "border-primary bg-blue-50 text-primary" 
                          : "border-gray-100 bg-white text-gray-400 hover:border-blue-200"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))
                ) : (
                  <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-gray-400 font-bold text-sm">
                      {grade ? `${t("noClassesFoundFor")} ${grade}` : t("selectGradeToSeeClasses")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              disabled={!classroomId || (isAdmin && !teacherId)}
              onClick={() => setView("calendar")}
              className="bg-primary text-white px-12 py-4 rounded-lg font-bold shadow-xl shadow-blue-900/20 hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {t("calendarSchedule")}
            </button>
          </div>
        </div>
      )}

      {view === "calendar" && (
        <div className="w-full space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setView("selection")} className="p-2 hover:bg-gray-100 rounded-xl border transition-colors">
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-primary">{selectedClass?.name} - {t("calendarSchedule")}</h2>
                <p className="text-sm text-gray-400 font-medium">{format(currentMonth, "MMMM yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-lg border dark:bg-gray-900/50"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-lg border dark:bg-gray-900/50"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="grid grid-cols-7 bg-gray-50 border-b dark:bg-gray-900/50">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-collapse">
              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div 
                    key={idx} 
                    className={`min-h-[140px] p-2 border-r border-b group transition-colors ${
                      !isCurrentMonth ? "bg-gray-50/50" : "bg-white"
                    } ${isSelected ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday ? "bg-primary text-white" : "text-gray-500"
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {(scheduleMap[shift][day.getDay()] || []).map((sch: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedSubject(sch.subject);
                            setView("list");
                          }}
                          className="w-full text-left p-1.5 rounded-lg bg-blue-50 hover:bg-primary hover:text-white transition-colors text-[10px] font-bold text-primary flex items-center gap-1 group/btn"
                        >
                          <BookOpen size={10} />
                          <span className="truncate">{sch.subject} ({sch.teacher})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm">{t("selectDateToStart")}</p>
        </div>
      )}

      {view === "list" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          {/* Header Info & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex items-center gap-4">
              <button onClick={() => setView("calendar")} className="p-3 bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-colors dark:bg-gray-900/50">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-primary">{selectedSubject} - {t("attendance")}</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  {selectedDate && format(selectedDate, "EEEE, dd MMMM yyyy")} • {selectedClass?.name}
                </p>
              </div>
            </div>

            <div className="relative min-w-[300px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                type="text" 
                placeholder={t("searchStudents")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-12 pr-5 py-3 focus:border-primary outline-none text-sm font-medium dark:bg-gray-900/50"
              />
            </div>
          </div>

          {/* Mini Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("totalStudents"), value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: t("present"), value: stats.present, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: t("excused"), value: stats.excused, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: t("unexcused"), value: stats.unexcused, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="p-4 border-b bg-gray-50/30 flex items-center justify-between dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleMarkAllPresent}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-primary hover:text-primary px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <CheckCircle2 size={14} /> {lang === 'km' ? "កំណត់វត្តមានទាំងអស់" : "Mark All Present"}
                </button>
                <button 
                  onClick={() => setAttendanceData({})}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:text-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <RotateCcw size={14} /> {lang === 'km' ? "កំណត់ឡើងវិញ" : "Reset All"}
                </button>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {lang === 'km' ? "បញ្ជីរាយនាមសិស្ស" : "Student List View"}
              </div>
            </div>
            {(isLoadingStudents || isLoadingAttendance) ? (
              <div className="h-[400px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("loading")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b dark:bg-gray-900/50">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest w-16 text-center">#</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t("student")}</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">{t("gender")}</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">{t("attendanceStatus")}</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t("remarks")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map((student: any, idx: number) => {
                    const record = attendanceData[student.id] || { status: "present", remarks: "" };
                    const status = record.status;
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-all border-b border-gray-50 last:border-0 group">
                        <td className="px-8 py-4 text-center text-sm font-bold text-gray-300 group-hover:text-blue-400 transition-colors">{idx + 1}</td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center border-2 border-white ring-1 ring-gray-100 transition-transform group-hover:scale-105 duration-500 relative ${
                              ["bg-blue-50 text-blue-500", "bg-purple-50 text-purple-500", "bg-emerald-50 text-emerald-500", "bg-pink-50 text-pink-500"][student.id % 4]
                            }`}>
                              <span className="font-black text-sm absolute inset-0 flex items-center justify-center">
                                {student.nameEn?.[0] || student.nameKh?.[0] || "?"}
                              </span>
                              {student.photoUrl && (
                                <img 
                                  src={student.photoUrl} 
                                  alt="" 
                                  className="w-full h-full object-cover relative z-10" 
                                  onError={(e) => (e.currentTarget.style.opacity = "0")}
                                />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-primary text-sm group-hover:translate-x-1 transition-transform duration-300">
                                  {lang === 'km' ? student.nameKh : student.nameEn}
                                </p>
                                {/* Chronic Absence Alert (Mock: Every 4th student for demo) */}
                                {(student.id % 4 === 0) && (
                                  <div className="group/alert relative">
                                    <AlertCircle size={14} className="text-red-500 animate-pulse cursor-help" />
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/alert:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl z-50">
                                      {lang === 'km' ? "អវត្តមានច្រើនជាង ៣ ដងក្នុងខែនេះ!" : "More than 3 unexcused absences this month!"}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                                <span className="text-[10px] font-black text-blue-400/70 uppercase tracking-tighter">
                                  {student.studentId}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            student.gender === "Male" 
                            ? "bg-blue-100/50 text-blue-600 border border-blue-200/50" 
                            : "bg-pink-100/50 text-pink-600 border border-pink-200/50"
                          }`}>
                            {student.gender === "Male" ? t("male") : t("female")}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => handleStatusChange(student.id, "present")} 
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${status === "present" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500"}`}
                              title={t("present")}
                            >
                              <CheckCircle2 size={16} /> <span className="hidden lg:inline">{t("present")}</span>
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.id, "excused")} 
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${status === "excused" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-500"}`}
                              title={t("excused")}
                            >
                              <Clock size={16} /> <span className="hidden lg:inline">{t("excused")}</span>
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.id, "unexcused")} 
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${status === "unexcused" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"}`}
                              title={t("unexcused")}
                            >
                              <XCircle size={16} /> <span className="hidden lg:inline">{t("unexcused")}</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-6 min-w-[200px]">
                          <div className="relative group">
                            <input 
                              type="text"
                              value={record.remarks}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              disabled={status !== "excused"}
                              placeholder={status === "excused" ? t("enterReason") : t("remarks")}
                              className={`w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-blue-500 outline-none transition-all ${
                                status === "excused" ? "opacity-100 bg-white border-blue-100 shadow-sm" : "opacity-30 cursor-not-allowed"
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Users size={48} className="mb-4 opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest">{t("noStudentsFound")}</p>
                            <p className="text-xs mt-2">{t("checkClassSelection")}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
            {lastSaved && (
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg border shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-widest animate-in fade-in zoom-in dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                {lang === 'km' ? "រក្សាទុកចុងក្រោយ៖" : "Last Saved:"} {format(lastSaved, "HH:mm:ss")}
              </div>
            )}
            <button 
              disabled={isSaving} 
              onClick={handleSave} 
              className="flex items-center gap-3 bg-primary hover:opacity-90 disabled:bg-gray-400 text-white px-10 py-5 rounded-3xl font-bold shadow-2xl transition-all active:scale-95 hover:translate-y-[-2px]"
            >
              {isSaving ? (
                <RotateCcw className="animate-spin" size={24} />
              ) : (
                <Save size={24} />
              )} 
              {isSaving ? (lang === 'km' ? "កំពុងរក្សាទុក..." : "Saving...") : t("saveRecord")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
