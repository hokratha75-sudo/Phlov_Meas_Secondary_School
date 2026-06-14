import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axiosConfig";
import {
  FileText, Send, Clock, CheckCircle, XCircle, CalendarDays,
  Trash2, Eye, Printer, X, Shield, Plus, Info, Landmark, MapPin, Paperclip, Download
} from "lucide-react";
import { exportLeaveRequestToWord } from "@/utils/exportToWord";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "ច្បាប់ឈប់ប្រចាំឆ្នាំ (១៥ ថ្ងៃ/ឆ្នាំ)", limit: "អតិបរមា ១៥ ថ្ងៃ" },
  { value: "SHORT_TERM", label: "ច្បាប់ឈប់រយៈពេលខ្លី", limit: "តាមការចាំបាច់" },
  { value: "SICK_LEAVE", label: "ច្បាប់សម្រាកព្យាបាលជំងឺ", limit: "មានលិខិតបញ្ជាក់ពេទ្យ" },
  { value: "PERSONAL", label: "ច្បាប់សម្រាកកិច្ចការផ្ទាល់ខ្លួន", limit: "តាមការចាំបាច់" },
  { value: "MATERNITY", label: "ច្បាប់សម្រាកលំហែមាតុភាព (៩០ ថ្ងៃ)", limit: "អតិបរមា ៩០ ថ្ងៃ" },
];

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "ច្បាប់ឈប់ប្រចាំឆ្នាំ",
  SHORT_TERM: "ច្បាប់ឈប់រយៈពេលខ្លី",
  SICK_LEAVE: "ច្បាប់សម្រាកព្យាបាលជំងឺ",
  PERSONAL: "ច្បាប់សម្រាកកិច្ចការផ្ទាល់ខ្លួន",
  MATERNITY: "ច្បាប់សម្រាកលំហែមាតុភាព",
};

const STATUS_CONFIG = {
  PENDING:  { label: "កំពុងរង់ចាំ",  color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  APPROVED: { label: "បានអនុម័ត",    color: "bg-green-50 text-green-700 border-green-200",   icon: CheckCircle },
  REJECTED: { label: "បានបដិសេធ",   color: "bg-red-50 text-red-700 border-red-200",          icon: XCircle },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeaveRequestsPage() {
  const { token, user } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = user?.role === "admin" || !user?.role;

  const [requests, setRequests] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [printItem, setPrintItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${baseUrl}/api/leave-requests/export/excel`, {
        headers,
        credentials: "include"
      });
      if (!res.ok) {
        let errData: any = {};
        try { errData = await res.json(); } catch(e) {}
        throw new Error(`HTTP ${res.status}: ${errData.error || errData.details || res.statusText || 'Unknown Error'}`);
      }
      const blob = await res.blob();
      const today = new Date().toISOString().split("T")[0];
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      if (isAdmin) {
        a.download = `Leave_Report_${today}.xlsx`;
      } else {
        const teacherName = user?.nameKh || user?.username || "Teacher";
        a.download = `ប្រវត្តិការសុំច្បាប់_${teacherName.replace(/\s+/g, "_")}_${today}.xlsx`;
      }
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("❌ បញ្ហាក្នុងការទាញយក ៖ " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const fetchRequestsAndBalance = async () => {
    setLoading(true);
    try {
      const data = await api.get("/leave-requests").then(res => res.data);
      setRequests(data.data || []);

      // If they are a teacher, also load their annual leave balance
      if (user?.role === "teacher") {
        const balData = await api.get(`/leave-balances?teacherId=${user.id}`).then(res => res.data);
        setBalance(balData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsAndBalance();
  }, [token]);



  const handleStatus = async (id: number, status: "APPROVED" | "REJECTED", adminNote?: string) => {
    setActionLoading(id);
    try {
      await api.put(`/leave-requests/${id}`, { status, adminNote });
      await fetchRequestsAndBalance();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបពាក្យសុំនេះមែនទេ?")) return;
    try {
      await api.delete(`/leave-requests/${id}`).then(res => res.data);
      await fetchRequestsAndBalance();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  const uniqueSubjects = Array.from(new Set(requests.map(r => r.teacher?.subjectKh).filter(Boolean))) as string[];

  const filteredRequests = requests.filter(req => {
    const matchesSearch = !searchQuery || 
      req.teacher?.nameKh?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || req.teacher?.subjectKh === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold">
            <Landmark className="text-blue-600 dark:text-blue-400" size={28} />
            ប្រព័ន្ធគ្រប់គ្រងការសុំច្បាប់គ្រូ (អនុក្រឹត្យ ២១៧)
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? `ពាក្យសុំសរុប ${requests.length} | កំពុងរង់ចាំ ${pendingCount}`
              : "ស្នើសុំច្បាប់ឈប់សម្រាកផ្លូវការស្របតាម អនុក្រឹត្យលេខ ២១៧ អនក្រ.បក"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <button
              onClick={() => navigate("/teacher/leave-request")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95"
            >
              <Plus size={16} />
              ស្នើសុំច្បាប់ថ្មី (Sub-decree 217)
            </button>
          )}
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            <FileText size={16} />
            <span>
              {exporting
                ? "កំពុងទាញយក..."
                : isAdmin
                ? "ទាញយករបាយការណ៍សង្ខេប (Excel)"
                : "ទាញយកប្រវត្តិច្បាប់ (Excel)"}
            </span>
          </button>
        </div>
      </div>

      {/* Teacher Balance Info Banner */}
      {!isAdmin && balance && (
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-700 text-blue-900 dark:text-blue-100 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield size={20} className="text-yellow-500" />
              ស្ថានភាពច្បាប់ឈប់ប្រចាំឆ្នាំរបស់អ្នក
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
              យោងតាម អនុក្រឹត្យ ២១៧ គ្រូបង្រៀនទទួលបានច្បាប់ឈប់ប្រចាំឆ្នាំចំនួន ១៥ ថ្ងៃ។
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-medium">ឆ្នាំសិក្សា៖ {balance.academicYear}</p>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-600 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-300">ច្បាប់អនុញ្ញាតសរុប</p>
            <p className="text-2xl font-semibold mt-1 text-gray-800 dark:text-gray-100">{balance.allowedDays} ថ្ងៃ</p>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-600 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-300">ប្រើប្រាស់រួច</p>
            <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">{balance.usedDays} ថ្ងៃ</p>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-600 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-300">ថ្ងៃនៅសល់</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">{balance.remainingDays} ថ្ងៃ</p>
          </div>
        </div>
      )}



      {/* Filters (Admin Only) */}
      {isAdmin && requests.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <input
            type="text"
            placeholder="ស្វែងរកឈ្មោះគ្រូ ឬមូលហេតុ..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- គ្រប់មុខវិជ្ជាទាំងអស់ --</option>
            {uniqueSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">កំពុងទាញយក...</div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center text-gray-400 bg-white rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <FileText size={48} className="mx-auto mb-3 text-gray-200" />
          <p>មិនទាន់មានពាក្យសុំច្បាប់ណាមួយ</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-20 text-center text-gray-400 bg-white rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <FileText size={48} className="mx-auto mb-3 text-gray-200" />
          <p>មិនមានទិន្នន័យស្របតាមការស្វែងរករបស់អ្នកទេ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => {
            const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
            const Icon = cfg.icon;
            return (
              <div key={req.id} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Teacher info (admin view) */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {req.teacher?.nameKh?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-primary text-sm">{req.teacher?.nameKh}</p>
                          <p className="text-xs text-gray-400">{req.teacher?.subjectKh}</p>
                        </div>
                      </div>
                    )}

                    {/* Status + Dates */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium ${cfg.color}`}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                      
                      {/* Leave Type Tag */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border">
                        {LEAVE_TYPE_LABELS[req.leaveType] || req.leaveType}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                        <CalendarDays size={11} />
                        {new Date(req.startDate).toLocaleDateString("km-KH")} → {new Date(req.endDate).toLocaleDateString("km-KH")}
                        &nbsp;({req.totalDays} ថ្ងៃ)
                      </span>
                      <span className="text-xs text-gray-300">#REF-{String(req.id).padStart(4,"0")}</span>
                    </div>

                    {/* Address & Reason */}
                    <div className="space-y-1.5">
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 dark:bg-gray-900/50">
                        <span className="text-gray-400 text-xs font-semibold">មូលហេតុ ៖ </span>{req.reason}
                      </p>
                      
                      <p className="text-xs text-gray-500 flex items-center gap-1 pl-3">
                        <MapPin size={10} />
                        <span>អាសយដ្ឋានអំឡុងពេលច្បាប់ ៖ {req.addressDuringLeave}</span>
                      </p>
                    </div>

                    {/* Attachment Link */}
                    {req.attachmentUrl && (
                      <div className="pl-3">
                        <a
                          href={req.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Paperclip size={10} /> មើលឯកសារភ្ជាប់
                        </a>
                      </div>
                    )}

                    {/* Admin note */}
                    {req.adminNote && (
                      <p className="text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-purple-400">ចំណាំរបស់នាយក ៖ </span>{req.adminNote}
                      </p>
                    )}

                    <p className="text-xs text-gray-400">
                      ដាក់ស្នើ ៖ {new Date(req.createdAt).toLocaleString("km-KH")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {/* View Receipt (navigate to receipt page) */}
                    <button
                      onClick={() => navigate(`/leave-requests/${req.id}`)}
                      className="flex items-center gap-2 px-3 py-2 text-xs border rounded-lg hover:bg-gray-50 text-gray-600 transition-all font-semibold dark:bg-gray-900/50"
                    >
                      <Eye size={13} /> មើល / បោះពុម្ព
                    </button>

                    {/* Quick download word from list */}
                    <button
                      onClick={() => {
                        exportLeaveRequestToWord({
                          nameKh: req.teacher?.nameKh || user?.nameKh || '',
                          gender: req.teacher?.gender || 'male',
                          officerId: req.teacher?.officerId || req.teacher?.id?.toString() || '',
                          position: req.teacher?.position || 'គ្រូបង្រៀន',
                          leaveType: req.leaveType,
                          startDate: req.startDate,
                          endDate: req.endDate,
                          totalDays: req.totalDays,
                          reason: req.reason,
                          addressDuringLeave: req.addressDuringLeave,
                        }, `Leave_Request_REF${String(req.id).padStart(4,"0")}.doc`);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold"
                    >
                      <Download size={13} /> ទាញយកជា Word
                    </button>

                    {/* Admin approve/reject */}
                    {isAdmin && req.status === "PENDING" && (
                      <>
                        <button
                          disabled={actionLoading === req.id}
                          onClick={() => {
                            const note = prompt("ចំណាំ (optional):");
                            handleStatus(req.id, "APPROVED", note || undefined);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 font-bold"
                        >
                          <CheckCircle size={13} /> អនុម័ត
                        </button>
                        <button
                          disabled={actionLoading === req.id}
                          onClick={() => {
                            const note = prompt("មូលហេតុបដិសេធ:");
                            if (note !== null) handleStatus(req.id, "REJECTED", note || undefined);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 font-bold"
                        >
                          <XCircle size={13} /> បដិសេធ
                        </button>
                      </>
                    )}

                    {/* Delete */}
                    {(isAdmin || req.status === "PENDING") && (
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="flex items-center gap-2 px-3 py-2 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={13} /> លុប
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
