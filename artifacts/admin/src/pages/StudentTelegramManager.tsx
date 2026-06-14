import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import api, { resolveUrl } from "@/lib/axiosConfig";
import { useListStudents, useListClassrooms } from "@workspace/api-client-react";
import {
  Link2, Unlink, RefreshCw, CheckCircle, XCircle, Search, Copy, Loader2, Users, Filter, Info, ExternalLink
} from "lucide-react";

interface LinkCodeInfo {
  code: string;
  studentName: string;
  instructions: string;
}

export default function StudentTelegramManager() {
  const { token } = useAuth();
  const { lang, t } = useTranslation();
  const headers = { Authorization: `Bearer ${token}` };

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [linkCode, setLinkCode] = useState<LinkCodeInfo | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // studentId of loading action

  // Load students & classrooms
  const { data: studentsData, refetch: refetchStudents, isLoading: isLoadingStudents, isError } = useListStudents(undefined, { request: { headers } });
  const { data: classroomsData } = useListClassrooms({ request: { headers } });

  const students = studentsData?.data || [];
  const classrooms = classroomsData?.data || [];

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        (s.nameKh && s.nameKh.includes(q)) ||
        (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
        (s.studentId && s.studentId.toLowerCase().includes(q))
      );
    }

    // Classroom filter
    if (classFilter !== "all") {
      result = result.filter(s => s.classId === Number(classFilter));
    }

    // Link Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "linked") {
        result = result.filter(s => s.telegramChatId !== null);
      } else if (statusFilter === "unlinked") {
        result = result.filter(s => s.telegramChatId === null);
      } else if (statusFilter === "has_code") {
        result = result.filter(s => s.telegramChatId === null && s.telegramLinkCode !== null);
      }
    }

    // Sort by name or linked status
    return result;
  }, [students, search, classFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const linked = students.filter(s => s.telegramChatId !== null).length;
    const unlinked = total - linked;
    const rate = total > 0 ? Math.round((linked / total) * 100) : 0;
    return { total, linked, unlinked, rate };
  }, [students]);

  const handleGenerateCode = async (studentId: number) => {
    setActionLoading(studentId);
    try {
      const res = await api.post(`/telegram/generate-link-code/student/${studentId}`, {}, { headers });
      setLinkCode(res.data);
      refetchStudents();
    } catch (err: any) {
      console.error("Generate link code failed:", err);
      alert(err.response?.data?.error || "Failed to generate code");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlink = async (studentId: number, studentName: string) => {
    if (!window.confirm(lang === "km" 
      ? `តើអ្នកពិតជាចង់ផ្ដាច់គណនី Telegram របស់សិស្ស ${studentName} មែនទេ?` 
      : `Are you sure you want to unlink student ${studentName}?`
    )) return;

    setActionLoading(studentId);
    try {
      await api.post(`/telegram/unlink/student/${studentId}`, {}, { headers });
      refetchStudents();
    } catch (err: any) {
      console.error("Unlink failed:", err);
      alert(err.response?.data?.error || "Failed to unlink student");
    } finally {
      setActionLoading(null);
    }
  };

  const copyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(`/link ${linkCode.code}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRefresh = () => {
    refetchStudents();
  };

  if (isLoadingStudents) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-bold text-lg">Failed to load student data</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary dark:text-blue-400 flex items-center gap-2">
            <Link2 size={24} />
            {lang === "km" ? "ការភ្ជាប់ Telegram របស់សិស្ស" : "Student Telegram Accounts"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {lang === "km" 
              ? "គ្រប់គ្រងលេខកូដភ្ជាប់គណនី និងស្ថានភាពការភ្ជាប់ Telegram របស់សិស្សានុសិស្ស។" 
              : "Manage linking codes and Telegram connection status for students."}
          </p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300 transition-colors self-start sm:self-auto dark:bg-gray-900/50"
        >
          <RefreshCw size={16} />
          {lang === "km" ? "ធ្វើឱ្យថ្មី" : "Refresh"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: lang === "km" ? "សិស្សសរុប" : "Total Students", value: stats.total, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: lang === "km" ? "បានភ្ជាប់ Telegram" : "Linked", value: stats.linked, icon: CheckCircle, color: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" },
          { label: lang === "km" ? "មិនទាន់ភ្ជាប់" : "Unlinked", value: stats.unlinked, icon: XCircle, color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" },
          { label: lang === "km" ? "អត្រាភ្ជាប់" : "Linking Rate", value: `${stats.rate}%`, icon: Link2, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={lang === "km" ? "ស្វែងរកឈ្មោះ ឬអត្តសញ្ញាណប័ណ្ណសិស្ស..." : "Search name or student ID..."}
            className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Class Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-48"
          >
            <option value="all">{lang === "km" ? "ថ្នាក់រៀនទាំងអស់" : "All Classes"}</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
            ))}
          </select>
        </div>

        {/* Link Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-48"
          >
            <option value="all">{lang === "km" ? "ស្ថានភាពទាំងអស់" : "All Status"}</option>
            <option value="linked">{lang === "km" ? "បានភ្ជាប់ Telegram" : "Linked Only"}</option>
            <option value="unlinked">{lang === "km" ? "មិនទាន់ភ្ជាប់" : "Unlinked Only"}</option>
            <option value="has_code">{lang === "km" ? "មានលេខកូដរួចហើយ" : "Has Code Generated"}</option>
          </select>
        </div>
      </div>

      {/* Main Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold">
              <tr>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "សិស្ស" : "Student"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "អត្តសញ្ញាណ" : "Student ID"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "ថ្នាក់រៀន" : "Class"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "ស្ថានភាព" : "Status"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "លេខកូដភ្ជាប់" : "Link Code"}</th>
                <th className="px-6 py-3.5 text-right">{lang === "km" ? "សកម្មភាព" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isLinked = student.telegramChatId !== null;
                  const hasCode = student.telegramLinkCode !== null;
                  const isLoading = actionLoading === student.id;
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors dark:bg-gray-900/50">
                      {/* Name & Photo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-400 text-xs font-bold overflow-hidden">
                            {student.photoUrl ? (
                              <img src={resolveUrl(student.photoUrl)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              student.nameKh ? student.nameKh[0] : student.nameEn[0]
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{student.nameKh}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.nameEn}</p>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                        {student.studentId}
                      </td>

                      {/* Classroom */}
                      <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                        {student.classroom ? `${student.classroom.name} (${student.classroom.grade})` : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isLinked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {lang === "km" ? "បានភ្ជាប់" : "Linked"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            {lang === "km" ? "មិនទាន់ភ្ជាប់" : "Not Linked"}
                          </span>
                        )}
                      </td>

                      {/* Link Code */}
                      <td className="px-6 py-4">
                        {isLinked ? (
                          <span className="text-gray-400 text-xs">Linked</span>
                        ) : hasCode ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded">
                              {student.telegramLinkCode}
                            </span>
                            <button
                              title="Copy Code Command"
                              onClick={() => {
                                navigator.clipboard.writeText(`/link ${student.telegramLinkCode}`);
                                alert(lang === "km" ? "ចម្លងពាក្យបញ្ជាជោគជ័យ!" : "Command copied to clipboard!");
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isLinked ? (
                          <button
                            onClick={() => handleUnlink(student.id, student.nameKh)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors border border-transparent disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />}
                            {lang === "km" ? "ផ្ដាច់" : "Unlink"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateCode(student.id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-primary hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-100 dark:border-blue-800/50 disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                            {hasCode ? (lang === "km" ? "បង្កើតឡើងវិញ" : "Regenerate") : (lang === "km" ? "បង្កើតលេខកូដ" : "Generate Code")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Info size={40} className="mx-auto mb-3 opacity-50 text-gray-400" />
                    <p className="font-semibold">{lang === "km" ? "រកមិនឃើញទិន្នន័យសិស្សទេ" : "No students found"}</p>
                    <p className="text-xs mt-1">{lang === "km" ? "សាកល្បងផ្លាស់ប្ដូរពាក្យស្វែងរក ឬតម្រងថ្នាក់រៀន" : "Try changing the search queries or filters"}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Link Code Display Modal */}
      {linkCode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLinkCode(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-150 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Link2 size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {lang === "km" ? "លេខកូដភ្ជាប់គណនីសិស្ស" : "Link Code Generated!"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {lang === "km" ? `សម្រាប់សិស្ស៖ ${linkCode.studentName}` : `For student: ${linkCode.studentName}`}
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-4 mb-4 font-mono">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{lang === "km" ? "សារដែលត្រូវផ្ញើទៅ Telegram Bot" : "Command to send to Telegram Bot"}</p>
                <p className="text-2xl font-bold text-primary dark:text-blue-400 tracking-wider">
                  /link {linkCode.code}
                </p>
              </div>
              
              <p className="text-xs text-left text-gray-500 dark:text-gray-400 mb-5 leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100/50 dark:border-blue-900/20">
                <span className="font-bold block mb-1">📢 {lang === "km" ? "របៀបភ្ជាប់៖" : "How to link:"}</span>
                {linkCode.instructions}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={copyCode} 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-colors text-sm font-semibold shadow-md shadow-blue-900/10"
                >
                  {copiedCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copiedCode ? (lang === "km" ? "បានចម្លង!" : "Copied!") : (lang === "km" ? "ចម្លងពាក្យបញ្ជា" : "Copy Command")}
                </button>
                <button 
                  onClick={() => setLinkCode(null)} 
                  className="px-4 py-2.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm dark:text-gray-300 font-semibold transition-colors dark:bg-gray-900/50"
                >
                  {lang === "km" ? "បិទ" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
