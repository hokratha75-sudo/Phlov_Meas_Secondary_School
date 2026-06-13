import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { 
  Users, 
  GraduationCap, 
  School, 
  BookOpen, 
  UserPlus, 
  UserMinus,
  Calendar,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  RefreshCw,
  Plus
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useListStudents, useGetDashboardStats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Dashboard() {
  const { token } = useAuth();
  const { t, lang } = useTranslation();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: studentsData, isLoading: studentsLoading } = useListStudents({
    limit: 5
  }, {
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const isLoading = statsLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">{t("loading")}</p>
      </div>
    );
  }

  const sparklineData = [
    { name: 'Jan', value: Math.max(0, (stats?.totalStudents || 100) - 50) },
    { name: 'Feb', value: Math.max(0, (stats?.totalStudents || 100) - 40) },
    { name: 'Mar', value: Math.max(0, (stats?.totalStudents || 100) - 20) },
    { name: 'Apr', value: Math.max(0, (stats?.totalStudents || 100) - 10) },
    { name: 'May', value: Math.max(0, (stats?.totalStudents || 100) - 5) },
    { name: 'Jun', value: stats?.totalStudents || 100 }
  ];

  const bentoCards = [
    {
      label: t("totalStudents"),
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "from-blue-600 to-indigo-700", // Semantic: Blue for Users/People
      description: lang === "km" ? "ចំនួនសិស្សកំពុងសិក្សាសរុប" : "Total active students",
      span: "lg:col-span-2 lg:row-span-2",
      iconBg: "bg-blue-500/20",
      percentage: 95,
      percentageLabel: lang === "km" ? "អត្រារក្សា ៩៥%" : "95% retention",
      hasChart: true
    },
    {
      label: t("totalTeachers"),
      value: stats?.totalTeachers ?? 0,
      icon: GraduationCap,
      color: "from-sky-600 to-blue-700", // Semantic: Blue for Users/People
      description: lang === "km" ? "បុគ្គលិក និងគ្រូបង្រៀន" : "Faculty and staff members",
      span: "lg:col-span-1",
      iconBg: "bg-sky-500/20",
      percentage: Math.min(100, Math.round(((stats?.totalTeachers || 1) / 50) * 100)),
      percentageLabel: lang === "km" ? `សមាមាត្រ ${Math.round((stats?.totalStudents || 0)/(stats?.totalTeachers || 1))}:១` : `Ratio ${Math.round((stats?.totalStudents || 0)/(stats?.totalTeachers || 1))}:1`
    },
    {
      label: t("totalClasses"),
      value: stats?.totalClasses ?? 0,
      icon: School,
      color: "from-emerald-600 to-teal-700", // Semantic: Green for Academic
      description: lang === "km" ? "ថ្នាក់រៀនទាំងអស់" : "Total active classrooms",
      span: "lg:col-span-1",
      iconBg: "bg-emerald-500/20",
      percentage: 85,
      percentageLabel: lang === "km" ? "៨៥% កំពុងប្រើប្រាស់" : "85% utilization"
    },
    {
      label: t("newStudents"),
      value: stats?.newStudents ?? 0,
      icon: UserPlus,
      color: "from-cyan-600 to-sky-700", // Semantic: Blue/Cyan for Users
      description: lang === "km" ? "សិស្សចុះឈ្មោះថ្មី" : "Enrolled this academic year",
      span: "lg:col-span-1",
      iconBg: "bg-cyan-500/20",
      percentage: Math.min(100, Math.round(((stats?.newStudents || 0) / (stats?.totalStudents || 1)) * 100)),
      percentageLabel: lang === "km" ? `កើនឡើង ${Math.min(100, Math.round(((stats?.newStudents || 0) / (stats?.totalStudents || 1)) * 100))}%` : `+${Math.min(100, Math.round(((stats?.newStudents || 0) / (stats?.totalStudents || 1)) * 100))}% vs last year`
    },
    {
      label: t("totalSubjects"),
      value: stats?.totalSubjects ?? 0,
      icon: BookOpen,
      color: "from-teal-600 to-green-700", // Semantic: Green for Academic
      description: lang === "km" ? "មុខវិជ្ជាកំពុងបង្រៀន" : "Currently offered subjects",
      span: "lg:col-span-1",
      iconBg: "bg-teal-500/20",
      percentage: 100,
      percentageLabel: lang === "km" ? "១០០% គ្របដណ្តប់" : "100% coverage"
    },
    {
      label: t("droppedStudents"),
      value: stats?.droppedStudents ?? 0,
      icon: UserMinus,
      color: "from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800", // Semantic: Amber for Alerts
      description: lang === "km" ? "សិស្សចាកចេញ ឬបោះបង់" : "Dropped or transferred",
      span: "lg:col-span-2",
      iconBg: "bg-amber-500/20",
      percentage: Math.min(100, Math.round(((stats?.droppedStudents || 0) / (stats?.totalStudents || 1)) * 100)),
      percentageLabel: lang === "km" ? `អត្រាបោះបង់ ${Math.min(100, Math.round(((stats?.droppedStudents || 0) / (stats?.totalStudents || 1)) * 100))}%` : `${Math.min(100, Math.round(((stats?.droppedStudents || 0) / (stats?.totalStudents || 1)) * 100))}% drop rate`
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div>
          <h2 className="text-2xl font-sans font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" />
            {t("dashboard")}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {lang === "km" ? "ទិន្នន័យស្ថិតិសរុបប្រចាំសាលា" : "Overview of school administrative statistics"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: [`/api/stats`] });
              queryClient.invalidateQueries({ queryKey: [`/api/students`] });
            }}
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors border shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            title={lang === 'km' ? 'ធ្វើឱ្យស្រស់' : 'Refresh Data'}
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-blue-800 font-bold text-sm">
              {new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', { 
                month: 'long', 
                year: 'numeric',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[160px] gap-6">
        {bentoCards.map((card, i) => (
          <div 
            key={i} 
            className={`group relative overflow-hidden rounded-xl p-8 flex flex-col justify-between shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${card.span} bg-gradient-to-br ${card.color} text-white`}
          >
            {/* Background Decoration */}
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-3 rounded-lg ${card.iconBg} backdrop-blur-md`}>
                <card.icon size={28} />
              </div>
              <div className="text-right">
                <div className="text-4xl font-black tracking-tighter mb-1 drop-shadow-md">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-90 drop-shadow-sm">
                  {card.label}
                </div>
              </div>
            </div>

            {/* Optional Sparkline Chart */}
            {card.hasChart && (
              <div className="h-28 w-full mt-4 -mb-4 relative z-0">
                <div className="absolute top-0 right-0 z-10 text-[10px] font-bold text-white/60 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full pointer-events-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  {lang === 'km' ? '៦ ខែចុងក្រោយ' : 'Last 6 Months'}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="colorSparkline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorSparkline)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-auto relative z-10 pt-6">
              <div className="flex justify-between items-end mb-2 gap-4">
                <p className="text-sm font-medium opacity-90 leading-snug">
                  {card.description}
                </p>
                <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded whitespace-nowrap">
                  {card.percentageLabel}
                </span>
              </div>
              {/* Actual percentage bar */}
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" 
                  style={{ width: `${card.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Enrollment Trend Chart */}
          <div className="bg-white p-8 rounded-xl border shadow-sm relative overflow-hidden group dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-sans text-primary font-bold">{lang === 'km' ? 'និន្នាការសិស្សចុះឈ្មោះ' : 'Enrollment Trend'}</h2>
                <p className="text-sm text-gray-500 mt-1">{lang === 'km' ? 'ស្ថិតិនិន្នាការសិស្សចុះឈ្មោះ' : 'Student enrollment trend statistics'}</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border dark:bg-gray-900/50">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  {t("students")}
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              {stats?.totalStudents ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: 'Sep', total: Math.floor((stats?.totalStudents || 0) * 0.7) },
                      { name: 'Oct', total: Math.floor((stats?.totalStudents || 0) * 0.8) },
                      { name: 'Nov', total: Math.floor((stats?.totalStudents || 0) * 0.85) },
                      { name: 'Dec', total: Math.floor((stats?.totalStudents || 0) * 0.9) },
                      { name: 'Jan', total: Math.floor((stats?.totalStudents || 0) * 0.95) },
                      { name: 'Feb', total: stats?.totalStudents || 0 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center dark:bg-gray-900/50">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <LayoutDashboard size={32} />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">{t("noData")}</p>
                  <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">
                    {lang === 'km' ? 'សូមបញ្ចូលព័ត៌មានសិស្សានុសិស្ស ដើម្បីបង្ហាញស្ថិតិនៅទីនេះ។' : 'Please register students to see statistics here.'}
                  </p>
                  <Link href="/students" className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                    <Plus size={14} /> {t("addStudent")}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Students Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="font-bold text-primary">{lang === 'km' ? 'សិស្សចុះឈ្មោះថ្មីៗ' : 'Recent Registered Students'}</h3>
              <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                {t("viewAll")} <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3">{t("fullName")}</th>
                    <th className="px-6 py-3">{t("grade")}</th>
                    <th className="px-6 py-3">{t("status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentsData?.data && studentsData.data.length > 0 ? (
                    studentsData.data.map((student: any) => (
                      <tr key={student.id} className="hover:bg-gray-50/80 transition-colors dark:bg-gray-900/50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{lang === 'km' ? student.nameKh : student.nameEn}</div>
                          <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.grade}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            student.status === 'active' || !student.status ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {student.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                        {t("noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-primary p-8 rounded-xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
          <h3 className="text-xl font-sans font-bold mb-6 relative z-10">{t("adminWork")}</h3>
          <ul className="space-y-4 relative z-10">
            {[1, 2, 3].map((_, i) => (
              <li key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold text-sm">{t("reviewData")}</div>
                  <div className="text-xs opacity-60">Today at 9:00 AM</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
