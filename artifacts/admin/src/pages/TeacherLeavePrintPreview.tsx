import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axiosConfig";
import {
  ArrowLeft, Printer, Clock, CheckCircle, XCircle,
  AlertTriangle, FileText, RefreshCw
} from "lucide-react";

export const KH_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];

export function toKhmerDigits(num: number | string): string {
  const khmerNums = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return String(num)
    .split("")
    .map(char => {
      const parsed = parseInt(char, 10);
      return isNaN(parsed) ? char : khmerNums[parsed];
    })
    .join("");
}

export function formatKhmerDateFull(dateStr: string) {
  if (!dateStr) return "...........";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = toKhmerDigits(d.getDate());
  const year = toKhmerDigits(d.getFullYear());
  const month = KH_MONTHS[d.getMonth()];
  return `ថ្ងៃទី ${day} ខែ${month} ឆ្នាំ ${year}`;
}

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "ច្បាប់ឈប់សម្រាកប្រចាំឆ្នាំ (Annual Leave)",
  SHORT_TERM: "ច្បាប់ឈប់សម្រាករយៈពេលខ្លី (Short-term Leave)",
  SICK_LEAVE: "ច្បាប់សម្រាកព្យាបាលជំងឺ (Sick Leave)",
  PERSONAL: "ច្បាប់សម្រាកកិច្ចការផ្ទាល់ខ្លួន (Personal Leave)",
  MATERNITY: "ច្បាប់សម្រាកលំហែមាតុភាព (Maternity Leave)",
};

interface Props {
  id: string;
}

export default function TeacherLeavePrintPreviewPage({ id }: Props) {
  const { token, user } = useAuth();
  const [, navigate] = useLocation();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${baseUrl}/api/leave-requests/${id}/export/excel`, {
        headers,
        credentials: "include"
      });
      if (!res.ok) {
        let errData: any = {};
        try { errData = await res.json(); } catch(e) {}
        const msg = (errData.error || "") + (errData.details ? " - " + errData.details : "");
        throw new Error(`HTTP ${res.status}: ${msg || res.statusText || 'Unknown Error'}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Leave_Request_${id}.xlsx`;
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

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/leave-requests/${id}`).then(res => res.data);
      
      // Security Check: Teachers can only view their own leave requests
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
    if (id && token) {
      fetchRequest();
    }
  }, [id, token]);

  const handlePrintAction = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-gray-500 font-sans">កំពុងទាញយកព័ត៌មានលិខិត...</p>
      </div>
    );
  }

  if (error === "403") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 font-sans">ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ</h2>
        <p className="text-gray-500 max-w-sm font-sans">
          អ្នកមិនមានការអនុញ្ញាតឱ្យចូលមើលពាក្យសុំច្បាប់នេះឡើយ។
        </p>
        <button
          onClick={() => navigate("/leave-requests")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-all font-sans"
        >
          <ArrowLeft size={16} /> ត្រឡប់ក្រោយ
        </button>
      </div>
    );
  }

  if (error === "404" || !request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="text-gray-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 font-sans">រកមិនឃើញទិន្នន័យ</h2>
        <p className="text-gray-500 font-sans">រកមិនឃើញពាក្យសុំច្បាប់ឈប់សម្រាកលេខ #{id} ទេ</p>
        <button
          onClick={() => navigate("/leave-requests")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-all font-sans"
        >
          <ArrowLeft size={16} /> ត្រឡប់ក្រោយ
        </button>
      </div>
    );
  }

  const t = request.teacher;
  const getSignatureUrl = (url: string | null | undefined) => {
    if (!url) return "";
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
    if (url.includes("/uploads/")) {
      const parts = url.split("/uploads/");
      return `${baseUrl}/uploads/${parts[parts.length - 1]}`;
    }
    if (url.startsWith("/")) {
      return `${baseUrl}${url}`;
    }
    return url;
  };
  const genderText = t?.gender === "female" ? "ស្រី" : t?.gender === "male" ? "ប្រុស" : "______";
  const pronounText = t?.gender === "female" ? "នាងខ្ញុំ" : t?.gender === "male" ? "ខ្ញុំបាទ" : "ខ្ញុំបាទ/នាងខ្ញុំ";
  const positionText = t?.position || "គ្រូបង្រៀន"; // Default to "គ្រូបង្រៀន" if not set
  const createdDate = new Date(request.createdAt);
  
  // Format letter date details
  const khmerLetterDate = formatKhmerDateFull(request.createdAt);
  const startDateKh = formatKhmerDateFull(request.startDate);
  const endDateKh = formatKhmerDateFull(request.endDate);
  const totalDaysKh = toKhmerDigits(request.totalDays);
  
  const statusLabels = {
    PENDING: { label: "កំពុងរង់ចាំ", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
    APPROVED: { label: "បានអនុម័ត", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
    REJECTED: { label: "បានបដិសេធ", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
  };
  const currentStatus = statusLabels[request.status as keyof typeof statusLabels] || statusLabels.PENDING;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      
      {/* ── Screen Actions Top Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/80 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-sm no-print transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/leave-requests/${id}`)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition-all cursor-pointer font-sans dark:bg-gray-900/50"
          >
            <ArrowLeft size={16} />
            <span>ត្រឡប់ក្រោយ</span>
          </button>
          
          <div className="h-6 w-px bg-gray-200"></div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-sans">ស្ថានភាព ៖</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentStatus.color}`}>
              <StatusIcon size={12} />
              <span className="font-sans">{currentStatus.label}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 shadow-md active:scale-95 transition-all cursor-pointer font-sans"
          >
            <FileText size={16} />
            <span>{exporting ? "កំពុងទាញយក..." : "ទាញយក Excel (លិខិតសុំច្បាប់)"}</span>
          </button>
          <button
            onClick={handlePrintAction}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-900 to-primary text-white rounded-xl text-sm font-semibold hover:from-blue-800 hover:to-primary/80 shadow-md shadow-blue-900/10 hover:shadow-lg active:scale-95 transition-all cursor-pointer font-sans"
          >
            <Printer size={16} />
            <span>បោះពុម្ពលិខិតផ្លូវការ</span>
          </button>
        </div>
      </div>

      {/* Screen Helper Info Alert */}
      <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl no-print flex gap-3 items-start shadow-inner">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <FileText size={18} />
        </div>
        <div>
          <h4 className="text-primary font-semibold text-sm font-sans">ទម្រង់លិខិតរដ្ឋបាលផ្លូវការ (អនុក្រឹត្យ ២១៧)</h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed font-sans">
            ទំព័រនេះត្រូវបានរៀបចំឡើងជាពិសេសសម្រាប់បោះពុម្ព ឬរក្សាទុកជាឯកសារ PDF។ ប្លង់គេហទំព័រ របារចំហៀង និងប៊ូតុងទាំងអស់នឹងត្រូវបានលាក់ដោយស្វ័យប្រវត្តិ នៅពេលអ្នកបោះពុម្ព។ ឯកសារនេះប្រើទំហំក្រដាស A4 ស្ដង់ដារ និងមានរៀបចំគម្លាតសុវត្ថិភាព ២០មីលីម៉ែត្រ (20mm) ជុំវិញក្រដាសយ៉ាងត្រឹមត្រូវ។
          </p>
        </div>
      </div>

      {/* ── A4 Document Wrapper ── */}
      <div className="flex justify-center bg-gray-100 py-6 md:py-10 rounded-2xl border-2 border-dashed border-gray-200 overflow-x-auto shadow-inner">
        <div className="printable-document-container bg-white shadow-2xl relative dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          
          {/* Document Content */}
          <div className="document-layout">
            
            {/* ══ TOP HEADERS ══ */}
            <div className="header-grid">
              
              {/* Left Header - Ministry & School */}
              <div className="left-header">
                <p className="font-moul text-[11pt] tracking-normal leading-normal text-black font-normal">
                  ក្រសួងអប់រំ យុវជន និងកីឡា
                </p>
                <p className="font-moul text-[10pt] tracking-normal leading-normal text-black font-normal mt-1">
                  វិទ្យាល័យ ផ្លូវមាស
                </p>
                <div className="w-16 h-px bg-black mt-2"></div>
                <p className="text-[9pt] font-sans text-gray-500 mt-2 font-semibold">
                  លេខ ៖ ............................ ស.ច
                </p>
              </div>

              {/* Right Header - Kingdom & Motto */}
              <div className="right-header">
                <p className="font-moul text-[12pt] tracking-normal leading-normal text-black font-normal">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </p>
                <p className="font-moul text-[10pt] tracking-normal leading-normal text-black font-normal mt-1">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </p>
                
                {/* Visual Cambodian Administrative Wave/Tecteang Decor */}
                <div className="tecteang-symbol flex justify-center mt-1">
                  <svg viewBox="0 0 200 20" width="160" height="16" className="text-black" style={{ display: "block" }}>
                    {/* Left Line */}
                    <line x1="10" y1="10" x2="80" y2="10" stroke="currentColor" strokeWidth="0.8" />
                    {/* Left Dot */}
                    <circle cx="85" cy="10" r="1.5" fill="currentColor" />
                    {/* Left small diamond */}
                    <path d="M 90 10 L 93 7 L 96 10 L 93 13 Z" fill="currentColor" />
                    {/* Central Ornament - Flourishes and a diamond in the middle */}
                    <path d="M 98 10 C 98 6, 102 6, 102 10 C 102 14, 98 14, 98 10 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    <path d="M 102 10 L 105 6 L 108 10 L 105 14 Z" fill="currentColor" />
                    <path d="M 112 10 C 112 6, 108 6, 108 10 C 108 14, 112 14, 112 10 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    {/* Right small diamond */}
                    <path d="M 114 10 L 117 7 L 120 10 L 117 13 Z" fill="currentColor" />
                    {/* Right Dot */}
                    <circle cx="125" cy="10" r="1.5" fill="currentColor" />
                    {/* Right Line */}
                    <line x1="130" y1="10" x2="190" y2="10" stroke="currentColor" strokeWidth="0.8" />
                  </svg>
                </div>
              </div>

            </div>

            {/* ══ DOCUMENT TITLE ══ */}
            <div className="title-section">
              <h2 className="font-moul text-[14pt] leading-normal text-black font-normal text-center underline decoration-solid underline-offset-8">
                ពាក្យសុំច្បាប់ឈប់សម្រាក
              </h2>
              <p className="text-[9.5pt] font-sans italic text-gray-700 text-center mt-3">
                (អនុលោមតាមបទប្បញ្ញត្តិនៃ អនុក្រឹត្យលេខ ២១៧ អនក្រ.បក ស្ដីពីការសុំច្បាប់ឈប់សម្រាករបស់មន្ត្រីរាជការ)
              </p>
            </div>

            {/* ══ GREETING ══ */}
            <div className="greeting-section">
              <p className="font-moul text-[11pt] text-black font-normal">
                គោរពជូន ៖ លោកនាយកវិទ្យាល័យ ផ្លូវមាស
              </p>
            </div>

            {/* ══ BODY PARAGRAPH ══ */}
            <div className="body-section">
              <p className="indent-paragraph text-[11pt] leading-[2.2] text-black font-normal align-justify text-justify">
                {pronounText}ឈ្មោះ <strong className="font-bold">{t?.nameKh || "..............................."}</strong> ភេទ <strong className="font-bold">{genderText}</strong> មុខងារ <strong className="font-bold">{positionText}</strong> នៃវិទ្យាល័យ ផ្លូវមាស មានកិត្តិយសសូមគោរពជម្រាបជូន លោកនាយក មេត្តាជ្រាបថា ៖ ខ្ញុំបាទ/នាងខ្ញុំសូមគោរពស្នើសុំច្បាប់ឈប់សម្រាកពីការងារ ដោយសារមូលហេតុផ្ទាល់ខ្លួនគឺ <strong className="font-bold">{request.reason || "..................................................................."}</strong>។
              </p>
              
              <p className="indent-paragraph text-[11pt] leading-[2.2] text-black font-normal align-justify text-justify mt-2">
                សេចក្តីដូចបានជម្រាបជូនខាងលើ ខ្ញុំបាទ/នាងខ្ញុំសូមគោរពស្នើសុំអនុញ្ញាតច្បាប់ឈប់សម្រាកពីការងារជាផ្លូវការ ស្របតាមលក្ខខណ្ឌការងារដែលបានកំណត់ក្នុងអនុក្រឹត្យលេខ ២១៧ អនក្រ.បក តាមព័ត៌មានលម្អិតដូចមានក្នុងតារាងសង្ខេបខាងក្រោម ៖
              </p>
            </div>

            {/* ══ GRID / BREAKDOWN SECTION ══ */}
            <div className="grid-section mt-6">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th className="font-moul font-normal text-[10pt] text-black py-2.5 px-3 border border-black text-center">
                      ប្រភេទច្បាប់ឈប់សម្រាក (យោងអនុក្រឹត្យ ២១៧)
                    </th>
                    <th className="font-moul font-normal text-[10pt] text-black py-2.5 px-3 border border-black text-center">
                      រយៈពេលឈប់សម្រាក
                    </th>
                    <th className="font-moul font-normal text-[10pt] text-black py-2.5 px-3 border border-black text-center w-[20%]">
                      ចំនួនថ្ងៃសរុប
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black py-3 px-4 font-sans text-[10.5pt] text-black leading-relaxed">
                      <div className="font-bold">{LEAVE_TYPE_LABELS[request.leaveType] || request.leaveType}</div>
                      <div className="text-[8.5pt] text-gray-500 mt-1 leading-normal italic">
                        * អនុលោមតាមបទប្បញ្ញត្តិស្ដីពីរបបច្បាប់ឈប់សម្រាករបស់មន្ត្រីរាជការស៊ីវិល
                      </div>
                    </td>
                    <td className="border border-black py-3 px-3 text-center font-sans text-[10.5pt] text-black leading-relaxed">
                      ចាប់ពីថ្ងៃទី <strong className="font-bold">{startDateKh}</strong><br />
                      ដល់ថ្ងៃទី <strong className="font-bold">{endDateKh}</strong>
                    </td>
                    <td className="border border-black py-3 px-2 text-center font-moul font-normal text-[13pt] text-black">
                      {totalDaysKh} ថ្ងៃ
                    </td>
                  </tr>
                  
                  {/* Additional info rows */}
                  <tr>
                    <td colSpan={3} className="border border-black py-2.5 px-4 font-sans text-[10pt] text-black">
                      <strong>អាសយដ្ឋានអំឡុងពេលច្បាប់ ៖ </strong> {request.addressDuringLeave || "........................................................................................."}
                    </td>
                  </tr>
                  {t?.phone && (
                    <tr>
                      <td colSpan={3} className="border border-black py-2.5 px-4 font-sans text-[10pt] text-black">
                        <strong>លេខទូរស័ព្ទទំនាក់ទំនងអំឡុងពេលច្បាប់ ៖ </strong> {t.phone}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Ending Phrase */}
            <div className="ending-phrase mt-6">
              <p className="indent-paragraph text-[11pt] leading-[2] text-black font-normal align-justify text-justify">
                សេចក្តីដូចបានជម្រាបជូនខាងលើ សូម លោកនាយកវិទ្យាល័យ មេត្តាពិនិត្យ និងសម្រេចអនុញ្ញាតច្បាប់ឈប់សម្រាកដល់ខ្ញុំបាទ/នាងខ្ញុំដោយក្ដីអនុគ្រោះ។
              </p>
              <p className="indent-paragraph text-[11pt] leading-[2] text-black font-normal align-justify text-justify mt-2">
                សូម លោកនាយក ទទួលនូវការគោរពដ៏ខ្ពង់ខ្ពស់អំពីខ្ញុំបាទ/នាងខ្ញុំ។
              </p>
            </div>

            {/* ══ BOTTOM SECTION - 2 COLUMNS ══ */}
            <div className="bottom-grid-section">
              
              {/* Left Column: Principal Approval Block */}
              <div className="principal-block">
                <p className="font-moul text-[10pt] text-black font-normal text-center mb-4">
                  ការសម្រេចរបស់លោកនាយក
                </p>
                
                {/* Screen status visual guide - hidden when print if we want realistic empty sheet */}
                <div className="screen-status-box my-3 no-print">
                  <div className="text-[8.5pt] text-gray-400 mb-1">ស្ថានភាពបច្ចុប្បន្ន ៖</div>
                  <div className="flex items-center gap-1.5 font-bold text-primary text-[10.5pt]">
                    <StatusIcon size={14} />
                    <span>{currentStatus.label}</span>
                  </div>
                  {request.adminNote && (
                    <div className="text-[8.5pt] text-purple-700 mt-1 italic leading-relaxed">
                      ចំណាំ ៖ {request.adminNote}
                    </div>
                  )}
                </div>

                <div className="approval-choices space-y-2 mt-4 text-[9.5pt]">
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border border-black rounded-[2px] text-center text-[7pt] leading-none font-bold">
                      {request.status === "APPROVED" ? "✓" : ""}
                    </span>
                    <span>យល់ព្រមអនុញ្ញាតតាមការស្នើសុំ</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border border-black rounded-[2px] text-center text-[7pt] leading-none font-bold">
                      {request.status === "REJECTED" ? "✗" : ""}
                    </span>
                    <span>មិនយល់ព្រម ឬកែសម្រួល</span>
                  </p>
                  
                  {/* Real Sign space */}
                  <div className="mt-8 border-t border-black/40 border-dotted pt-2 text-[8.5pt] text-gray-500 italic">
                    ចំណាំ ៖ {request.adminNote || "..........................................................."}
                  </div>
                  
                  <div className="text-center mt-12">
                    <p className="font-moul text-[9.5pt] text-black font-normal leading-normal">
                      នាយកវិទ្យាល័យ ផ្លូវមាស
                    </p>
                    <p className="text-[8pt] text-gray-400 mt-12 font-sans italic">
                      (ហត្ថលេខា និងត្រា)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Teacher's Signature Block */}
              <div className="teacher-block text-right">
                <div className="date-block text-center w-full">
                  <p className="text-[10pt] font-sans text-black leading-relaxed italic">
                    ធ្វើនៅ ផ្លូវមាស, {khmerLetterDate}
                  </p>
                  <p className="font-moul text-[10pt] text-black font-normal mt-3 leading-normal">
                    ហត្ថលេខានិងឈ្មោះសាមីខ្លួន
                  </p>
                </div>
                
                {/* Signature image or spacing */}
                <div className="h-28 flex items-center justify-center">
                  {request?.signatureUrl ? (
                    <img src={getSignatureUrl(request.signatureUrl)} alt="Signature" className="max-h-24 object-contain mx-auto" />
                  ) : (
                    <div className="h-full"></div>
                  )}
                </div>
                
                <div className="teacher-name-block text-center w-full mt-4">
                  <p className="font-moul text-[10.5pt] text-black font-normal leading-normal underline decoration-solid decoration-1 underline-offset-4">
                    {t?.nameKh || "..............................."}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Embedded CSS Styles */}
      <style>{`
        /* ── Screen Page Styles ── */
        .printable-document-container {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          background: white;
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          font-family: 'Khmer OS Siemreap', 'Siemreap', 'Khmer OS Siem Reap', 'Inter', sans-serif;
          color: black;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        .document-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: start;
          margin-bottom: 25px;
        }

        .left-header {
          text-align: left;
        }

        .right-header {
          text-align: center;
        }

        .title-section {
          margin-top: 30px;
          margin-bottom: 25px;
        }

        .greeting-section {
          margin-bottom: 20px;
          padding-left: 10px;
        }

        .body-section {
          margin-bottom: 20px;
        }

        .indent-paragraph {
          text-indent: 1.5cm;
        }

        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 15px;
          border: 1px solid black;
        }

        .breakdown-table th, .breakdown-table td {
          border: 1px solid black;
        }

        .bottom-grid-section {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 30px;
          margin-top: 40px;
          align-items: stretch;
        }

        .principal-block {
          border: 1.5px solid black;
          border-radius: 8px;
          padding: 18px;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .teacher-block {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          min-height: 220px;
        }

        /* ── Print Media Optimization ── */
        @media print {
          /* 1. Hide sidebars, layouts, main headers, button elements */
          aside,
          header,
          nav,
          button,
          .no-print,
          .bg-blue-50\\/60 {
            display: none !important;
          }

          /* 2. Reset backgrounds, margins, paddings of outer layout container divs */
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            color: black !important;
          }

          /* Reset Laravel or React wouter app page borders and parent layouts */
          div.flex.h-screen {
            display: block !important;
            height: auto !important;
            background: transparent !important;
            overflow: visible !important;
          }
          
          div.flex-1.flex.flex-col {
            display: block !important;
            height: auto !important;
            background: transparent !important;
            overflow: visible !important;
          }
          
          main {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            overflow: visible !important;
          }

          /* 3. Isolate the Document Preview container and force A4 dimensions */
          .printable-document-container {
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }

          /* 4. Page layout setup */
          @page {
            size: A4 portrait;
            margin: 20mm;
          }

          /* 5. Fine tune text lines spacing for printed paper */
          .indent-paragraph {
            text-indent: 1.5cm !important;
          }
          
          .breakdown-table th, .breakdown-table td {
            border: 1px solid black !important;
          }
          
          .principal-block {
            border: 1.5px solid black !important;
          }
        }
      `}</style>

    </div>
  );
}
