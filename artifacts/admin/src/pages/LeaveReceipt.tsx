import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axiosConfig";
import { KH_MONTHS } from "@/components/LeaveRequestDocument";
import { exportLeaveRequestToWord } from "@/utils/exportToWord";
import {
  ArrowLeft, Clock, CheckCircle, XCircle,
  AlertTriangle, FileText, RefreshCw, Download
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING:  { label: "កំពុងរង់ចាំ", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  APPROVED: { label: "បានអនុម័ត",  color: "bg-green-50 text-green-700 border-green-200",  icon: CheckCircle },
  REJECTED: { label: "បានបដិសេធ", color: "bg-red-50 text-red-700 border-red-200",         icon: XCircle },
};

interface Props {
  /** The leave request ID extracted from the URL param */
  id: string;
}

export default function LeaveReceiptPage({ id }: Props) {
  const { token, user } = useAuth();
  const [, navigate] = useLocation();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/leave-requests/${id}`).then(res => res.data);
      // Security: teacher can only view their own request
      if (user?.role === "teacher" && data.teacherId !== user.id) {
        setError("403");
        return;
      }
      setRequest(data);
    } catch (err: any) {
      if (err.message?.includes("403") || err.message?.includes("Unauthorized")) {
        setError("403");
      } else if (err.message?.includes("404") || err.message?.includes("Not found")) {
        setError("404");
      } else {
        setError(err.message || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRequest();
  }, [id, token]);

  const handleDownloadWord = () => {
    if (!request) return;
    exportLeaveRequestToWord({
      nameKh: request.teacher?.nameKh || user?.nameKh || '',
      gender: request.teacher?.gender || 'male',
      officerId: request.teacher?.officerId || request.teacher?.id?.toString() || '',
      position: request.teacher?.position || 'គ្រូបង្រៀន',
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      totalDays: request.totalDays,
      reason: request.reason,
      addressDuringLeave: request.addressDuringLeave,
    }, `Leave_Request_REF${String(request.id).padStart(4,"0")}.doc`);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-gray-500">កំពុងទាញយកព័ត៌មាន...</p>
      </div>
    );
  }

  // ── Error States ─────────────────────────────────────────────────────────────
  if (error === "403") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ</h2>
        <p className="text-gray-500 max-w-sm">
          អ្នកមិនមានការអនុញ្ញាតឱ្យចូលមើលពាក្យសុំច្បាប់នេះ។ 
          តែអ្នកអាចចូលមើលបានតែពាក្យសុំរបស់ខ្លួនឯងប៉ុណ្ណោះ។
        </p>
        <button
          onClick={() => navigate("/leave-requests")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90"
        >
          <ArrowLeft size={16} /> ត្រឡប់ក្រោយ
        </button>
      </div>
    );
  }

  if (error === "404") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="text-gray-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">រកមិនឃើញ</h2>
        <p className="text-gray-500">ពាក្យសុំច្បាប់លេខ #{id} មិនមានក្នុងប្រព័ន្ធ</p>
        <button
          onClick={() => navigate("/leave-requests")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90"
        >
          <ArrowLeft size={16} /> ត្រឡប់ក្រោយ
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertTriangle className="text-orange-500" size={40} />
        <p className="text-gray-700">{error}</p>
        <button onClick={fetchRequest} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 dark:bg-gray-900/50">
          <RefreshCw size={14} /> ព្យាយាមម្ដងទៀត
        </button>
      </div>
    );
  }

  if (!request) return null;

  const cfg = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const submittedDate = new Date(request.createdAt);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Top Action Bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/leave-requests")}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all dark:bg-gray-900/50"
        >
          <ArrowLeft size={16} />
          ត្រឡប់ក្រោយ
        </button>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border font-medium ${cfg.color}`}>
            <StatusIcon size={12} /> {cfg.label}
          </span>
          <button
            onClick={handleDownloadWord}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Download size={16} />
            ទាញយកជា Word (លិខិតសុំច្បាប់)
          </button>
        </div>
      </div>

      {/* ── Info Card ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border shadow-sm p-5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-primary">ពាក្យសុំច្បាប់ #REF-{String(request.id).padStart(4, "0")}</h3>
            <p className="text-xs text-gray-400">
              ដាក់ស្នើ ៖ ថ្ងៃទី {submittedDate.getDate()} ខែ{KH_MONTHS[submittedDate.getMonth()]} ឆ្នាំ {submittedDate.getFullYear()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-900/50">
            <p className="text-xs text-gray-400 mb-1">ចាប់ពីថ្ងៃ</p>
            <p className="font-semibold text-gray-800">{new Date(request.startDate).toLocaleDateString('km-KH')}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-900/50">
            <p className="text-xs text-gray-400 mb-1">ដល់ថ្ងៃ</p>
            <p className="font-semibold text-gray-800">{new Date(request.endDate).toLocaleDateString('km-KH')}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-1">ចំនួនថ្ងៃ</p>
            <p className="font-bold text-blue-700 text-lg">{request.totalDays} ថ្ងៃ</p>
          </div>
          <div className={`rounded-lg p-3 ${cfg.color.replace("border-", "border ").split(" ")[0]} bg-opacity-50`}>
            <p className="text-xs mb-1 opacity-70">ស្ថានភាព</p>
            <p className="font-semibold">{cfg.label}</p>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-gray-500 mb-1">មូលហេតុ៖</p>
          <p className="text-gray-800 bg-gray-50 p-3 rounded-lg dark:bg-gray-900/50">{request.reason}</p>
        </div>

        {request.adminNote && (
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
            <p className="text-xs text-purple-500 mb-1">ចំណាំពីនាយកសាលា</p>
            <p className="text-sm text-purple-800">{request.adminNote}</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
