import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axiosConfig";
import {
  FileText, Send, Clock, AlertTriangle, CheckCircle,
  MapPin, Paperclip, CalendarDays, ArrowLeft, Landmark, User, BookOpen, Info
} from "lucide-react";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "ច្បាប់ឈប់ប្រចាំឆ្នាំ (១៥ ថ្ងៃ/ឆ្នាំ)", limit: "ច្បាប់សម្រាកប្រចាំឆ្នាំ - ១៥ ថ្ងៃ" },
  { value: "SHORT_TERM", label: "ច្បាប់ឈប់រយៈពេលខ្លី", limit: "តាមការចាំបាច់" },
  { value: "SICK_LEAVE", label: "ច្បាប់សម្រាកព្យាបាលជំងឺ", limit: "ត្រូវការលិខិតបញ្ជាក់ពេទ្យ" },
  { value: "PERSONAL", label: "ច្បាប់សម្រាកដោយមានកិច្ចការផ្ទាល់ខ្លួន", limit: "តាមការចាំបាច់" },
  { value: "MATERNITY", label: "ច្បាប់សម្រាកលំហែមាតុភាព (៩០ ថ្ងៃ)", limit: "មាតុភាព - ៩០ ថ្ងៃ" },
];

function calculateDaysExcludingSundays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    if (cur.getDay() !== 0) { // 0 is Sunday
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function TeacherLeaveRequestPage() {
  const { token, user } = useAuth();
  const [, navigate] = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    leaveType: "ANNUAL",
    startDate: "",
    endDate: "",
    totalDays: "0",
    reason: "",
    addressDuringLeave: "",
    attachmentUrl: "",
    signatureUrl: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "attachmentUrl" | "signatureUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData);
      if (res.data && res.data.url) {
        setForm((f) => ({ ...f, [field]: res.data.url }));
      } else {
        throw new Error(res.data.message || "បរាជ័យក្នុងការបង្ហោះឯកសារ");
      }
    } catch (err: any) {
      const uploadError = err.response?.data?.error || err.response?.data?.message || err.message || "Upload error";
      alert("❌ " + uploadError);
    }
  };

  // Fetch teacher profile details & leave balance
  useEffect(() => {
    if (!token || !user) return;

    const loadData = async () => {
      setLoadingProfile(true);
      try {
        // Fetch detailed profile from /api/teachers list matching user.id
        const list = await api.get("/teachers").then(res => res.data);
        const matched = list.data?.find((t: any) => t.id === user.id);
        if (matched) {
          setProfile(matched);
        }

        // Fetch remaining leave days
        const bal = await api.get(`/leave-balances?teacherId=${user.id}`).then(res => res.data);
        setBalance(bal);

        // Fetch past leave requests to auto-fill the signature
        const leavesData = await api.get("/leave-requests").then(res => res.data);
        const pastLeaves = leavesData.data || [];
        const lastWithSignature = pastLeaves.find((l: any) => l.signatureUrl);
        if (lastWithSignature) {
          setForm(f => ({ ...f, signatureUrl: lastWithSignature.signatureUrl }));
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadData();
  }, [token, user]);

  // Recalculate total days excluding Sundays
  useEffect(() => {
    const days = calculateDaysExcludingSundays(form.startDate, form.endDate);
    setForm(f => ({ ...f, totalDays: String(days) }));
  }, [form.startDate, form.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.totalDays) <= 0) {
      alert("❌ ចំនួនថ្ងៃឈប់សម្រាកត្រូវតែធំជាង ០ ថ្ងៃ (មិនគិតថ្ងៃអាទិត្យ)។");
      return;
    }

    setSubmitting(true);
    setSuccess(null);
    try {
      const created = await api.post("/leave-requests", form).then(res => res.data);
      setSuccess(`✅ ពាក្យសុំច្បាប់លេខ #REF-${String(created.id).padStart(4, "0")} ត្រូវបានដាក់ស្នើដោយជោគជ័យ!`);
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate(`/leave-requests/${created.id}`);
      }, 2000);
    } catch (err: any) {
      const apiError = err.response?.data?.error || err.response?.data?.details || err.message;
      alert("❌ " + apiError);
      setSubmitting(false);
    }
  };

  const isExceedingBalance =
    form.leaveType === "ANNUAL" &&
    balance &&
    Number(form.totalDays) > balance.remainingDays;

  if (loadingProfile) {
    return (
      <div className="py-20 text-center text-gray-500 font-['Khmer_OS_Battambang']">
        កំពុងទាញយកព័ត៌មានលោកគ្រូ-អ្នកគ្រូ...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-['Khmer_OS_Battambang',_sans-serif] text-sm">
      
      {/* ── Breadcrumb/Back button ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/leave-requests")}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={14} />
          ត្រឡប់ទៅបញ្ជីច្បាប់ឈប់សម្រាក
        </button>
      </div>

      {/* ── Main Form Card ── */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        
        {/* Card Header */}
        <div className="bg-primary px-6 py-4 text-white flex items-center gap-3">
          <Landmark size={22} className="text-yellow-400" />
          <div>
            <h2 className="text-base font-bold">ពាក្យសុំច្បាប់ឈប់សម្រាក (អនុក្រឹត្យ ២១៧)</h2>
            <p className="text-[11px] text-blue-200">បំពេញព័ត៌មានឱ្យបានត្រឹមត្រូវដើម្បីដាក់ស្នើទៅកាន់នាយកសាលា</p>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="bg-green-50 border-b border-green-200 text-green-800 px-6 py-4 flex items-center gap-3">
            <CheckCircle className="text-green-600 shrink-0" size={20} />
            <div>
              <p className="font-bold">{success}</p>
              <p className="text-xs text-green-600 mt-0.5">កំពុងបញ្ជូនទៅកាន់ទំព័រវិក្កយបត្រ...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* ── Section 1: Auto-populated Teacher Info ── */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3 dark:bg-gray-900/50">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <User size={13} /> ព័ត៌មានសាមីខ្លួន (កំណត់ដោយស្វ័យប្រវត្តិ)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-gray-400">ឈ្មោះគ្រូបង្រៀន</p>
                <p className="font-bold text-gray-800 mt-0.5">{profile?.nameKh || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">ភេទ</p>
                <p className="font-bold text-gray-800 mt-0.5">
                  {profile?.gender === "female" ? "ស្រី" : profile?.gender === "male" ? "ប្រុស" : "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">មុខតំណែង និងឯកទេស</p>
                <p className="font-bold text-gray-800 mt-0.5">{profile?.subjectKh || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">លេខទូរស័ព្ទ</p>
                <p className="font-bold text-gray-800 mt-0.5">{profile?.phone || "—"}</p>
              </div>
            </div>
          </div>

          {/* ── Section 2: Balance Banner if ANNUAL ── */}
          {form.leaveType === "ANNUAL" && balance && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <Info className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-blue-900">តុល្យភាពច្បាប់ឈប់សម្រាកប្រចាំឆ្នាំដែលនៅសល់</h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">ឆ្នាំសិក្សា៖ {balance.academicYear} | អនុញ្ញាត៖ {balance.allowedDays} ថ្ងៃ</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-500">ថ្ងៃនៅសល់</p>
                <p className="text-lg font-black text-blue-700">{balance.remainingDays} ថ្ងៃ</p>
              </div>
            </div>
          )}

          {/* ── Live Balance Warning ── */}
          {isExceedingBalance && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-red-900">⚠️ ចំនួនថ្ងៃស្នើសុំលើសពីតុល្យភាពដែលនៅសល់</h4>
                <p className="text-[11px] text-red-700 mt-1">
                  លោកគ្រូ-អ្នកគ្រូស្នើសុំចំនួន <strong>{form.totalDays} ថ្ងៃ</strong> ប៉ុន្តែច្បាប់ឈប់ប្រចាំឆ្នាំដែលនៅសល់គឺមានត្រឹមតែ <strong>{balance.remainingDays} ថ្ងៃ</strong> ប៉ុណ្ណោះ។ សូមជ្រើសរើសកាលបរិច្ឆេទឡើងវិញ។
                </p>
              </div>
            </div>
          )}

          {/* ── Section 3: Leave details ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dropdown Leave Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">ប្រភេទច្បាប់ឈប់សម្រាក</label>
              <select
                required
                value={form.leaveType}
                onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                {LEAVE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Address during leave */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <MapPin size={12} /> អាសយដ្ឋានអំឡុងពេលឈប់សម្រាក
              </label>
              <input
                type="text"
                required
                value={form.addressDuringLeave}
                onChange={e => setForm(f => ({ ...f, addressDuringLeave: e.target.value }))}
                placeholder="ឧ. ផ្ទះលេខ ១២ ផ្លូវ ២ ភូមិ..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <CalendarDays size={12} /> ចាប់ផ្ដើមឈប់ថ្ងៃទី
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <CalendarDays size={12} /> ដល់ថ្ងៃទី
              </label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Calculated Days */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">ចំនួនថ្ងៃសរុប (មិនគិតថ្ងៃអាទិត្យ)</label>
              <input
                type="number"
                readOnly
                value={form.totalDays}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500 font-bold text-center dark:bg-gray-900/50"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <BookOpen size={12} /> មូលហេតុពិតប្រាកដនៃការសុំច្បាប់
            </label>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="សូមសរសេរពន្យល់រៀបរាប់ពីមូលហេតុច្បាស់លាស់..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Attachment & Signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Paperclip size={12} /> តំណភ្ជាប់លិខិតបញ្ជាក់ ឬឯកសារយោង (ប្រសិនបើមាន)
              </label>
              <input
                type="url"
                value={form.attachmentUrl}
                onChange={e => setForm(f => ({ ...f, attachmentUrl: e.target.value }))}
                placeholder="https://example.com/certificate.pdf"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              <p className="text-[10px] text-gray-400 mt-1">ឧ. លិខិតបញ្ជាក់ពីគ្រូពេទ្យសម្រាប់ច្បាប់សម្រាកជំងឺ ឬឯកសារពាក់ព័ន្ធផ្សេងៗ</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <FileText size={12} /> បញ្ចូលរូបភាពហត្ថលេខា (ប្រសិនបើមាន)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "signatureUrl")}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none bg-white file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              {form.signatureUrl && (
                <div className="mt-2 p-2 border border-gray-200 rounded-md inline-block bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <img src={form.signatureUrl} alt="Signature Preview" className="h-12 object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/leave-requests")}
              className="px-5 py-2 rounded-md border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors dark:bg-gray-900/50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={submitting || isExceedingBalance}
              className="px-5 py-2 rounded-md bg-primary hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full" /> កំពុងដាក់ស្នើ...</>
              ) : (
                <><Send size={13} /> ដាក់ស្នើពាក្យសុំ</>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
