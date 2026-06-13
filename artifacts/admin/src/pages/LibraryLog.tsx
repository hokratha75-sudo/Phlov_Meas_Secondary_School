import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { 
  useListLibraryLogs, 
  useCreateLibraryLog, 
  useUpdateLibraryLog, 
  useDeleteLibraryLog,
  useListStudents
} from "@workspace/api-client-react";
import { 
  Book, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Trash2, 
  Pencil,
  Download,
  User,
  GraduationCap,
  Phone,
  FileSpreadsheet,
  ArrowUpDown,
  BookOpen
} from "lucide-react";
import type { Student, LibraryLog } from "@workspace/api-client-react";

export default function LibraryLogPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LibraryLog | null>(null);

  // Auto-complete student search state
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    bookTitle: "",
    bookCode: "",
    borrowDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default 14 days later
    returnDate: "",
    status: "Borrowed"
  });

  // Export state
  const [exporting, setExporting] = useState(false);

  // API Hooks
  const { data: logsData, refetch: refetchLogs, isLoading: isLogsLoading } = useListLibraryLogs(
    {
      limit,
      offset,
      status: statusFilter === "All" ? undefined : statusFilter,
      search: searchTerm || undefined
    },
    { request: { headers } }
  );

  // Load students for combobox autocomplete
  const { data: studentsData } = useListStudents(
    { limit: 1000 },
    { request: { headers } }
  );

  const { mutate: createLog } = useCreateLibraryLog({ request: { headers } });
  const { mutate: updateLog } = useUpdateLibraryLog({ request: { headers } });
  const { mutate: deleteLog } = useDeleteLibraryLog({ request: { headers } });

  // Filter students locally based on typed search query
  const filteredStudents = useMemo(() => {
    const students = studentsData?.data || [];
    if (!studentSearch) return students.slice(0, 10);
    const q = studentSearch.toLowerCase();
    return students.filter(
      s => s.nameKh.toLowerCase().includes(q) || 
           s.nameEn.toLowerCase().includes(q) || 
           s.studentId.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [studentsData, studentSearch]);

  // Handle open modal for create/edit
  const handleOpenModal = (log: LibraryLog | null = null) => {
    if (log) {
      setEditingLog(log);
      setSelectedStudent(log.student);
      setStudentSearch("");
      setForm({
        bookTitle: log.bookTitle,
        bookCode: log.bookCode || "",
        borrowDate: log.borrowDate.split("T")[0],
        dueDate: log.dueDate ? log.dueDate.split("T")[0] : new Date(new Date(log.borrowDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        returnDate: log.returnDate ? log.returnDate.split("T")[0] : "",
        status: log.bookStatus
      });
    } else {
      setEditingLog(null);
      setSelectedStudent(null);
      setStudentSearch("");
      setForm({
        bookTitle: "",
        bookCode: "",
        borrowDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        returnDate: "",
        status: "Borrowed"
      });
    }
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = () => {
    if (!selectedStudent) {
      alert("សូមជ្រើសរើសសិស្សម្នាក់ជាមុនសិន!");
      return;
    }
    if (!form.bookTitle.trim()) {
      alert("សូមបញ្ចូលចំណងជើងសៀវភៅ!");
      return;
    }

    const payload = {
      studentId: selectedStudent.id,
      bookTitle: form.bookTitle,
      bookCode: form.bookCode || null,
      borrowDate: new Date(form.borrowDate).toISOString(),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      returnDate: form.status === "Returned" ? new Date(form.returnDate || Date.now()).toISOString() : null,
      bookStatus: form.status
    };

    if (editingLog) {
      updateLog(
        { id: editingLog.id, data: payload },
        {
          onSuccess: () => {
            refetchLogs();
            setIsModalOpen(false);
          },
          onError: (err: any) => {
            alert("❌ បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពកំណត់ត្រា៖ " + err.message);
          }
        }
      );
    } else {
      createLog(
        { data: payload },
        {
          onSuccess: () => {
            refetchLogs();
            setIsModalOpen(false);
          },
          onError: (err: any) => {
            alert("❌ បរាជ័យក្នុងការបង្កើតកំណត់ត្រាខ្ចី៖ " + err.message);
          }
        }
      );
    }
  };

  // Quick return marking
  const markAsReturned = (log: LibraryLog) => {
    const payload = {
      studentId: log.studentId,
      bookTitle: log.bookTitle,
      bookCode: log.bookCode || null,
      borrowDate: log.borrowDate,
      dueDate: log.dueDate,
      returnDate: new Date().toISOString(),
      bookStatus: "Returned"
    };

    updateLog(
      { id: log.id, data: payload },
      {
        onSuccess: () => {
          refetchLogs();
        },
        onError: (err: any) => {
          alert("❌ បរាជ័យក្នុងការកត់ត្រាសងសៀវភៅ៖ " + err.message);
        }
      }
    );
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm("តើអ្នកពិតជាចង់លុបកំណត់ត្រាខ្ចី-សងនេះមែនទេ?")) {
      deleteLog(
        { id },
        {
          onSuccess: () => {
            refetchLogs();
          },
          onError: (err: any) => {
            alert("❌ បរាជ័យក្នុងការលុបកំណត់ត្រា៖ " + err.message);
          }
        }
      );
    }
  };

  // Export Excel with Auth
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const statusParam = statusFilter !== "All" ? `status=${statusFilter}` : "";
      const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}` : "";
      const queryParams = [statusParam, searchParam].filter(Boolean).join("&");
      const url = `${baseUrl}/api/reports/library/export${queryParams ? "?" + queryParams : ""}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("ការទាញយករបាយការណ៍បានបរាជ័យ!");
      }

      const blob = await res.blob();
      const today = new Date().toISOString().split("T")[0];
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `របាយការណ៍បណ្ណាល័យ_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert("❌ បញ្ហាក្នុងការទាញយក៖ " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Dynamic statistics calculation from overall logs (or current batch)
  const stats = useMemo(() => {
    const logs = logsData?.data || [];
    return {
      borrowed: logs.filter(l => l.bookStatus === "Borrowed").length,
      returned: logs.filter(l => l.bookStatus === "Returned").length,
      overdue: logs.filter(l => l.bookStatus === "Overdue").length,
      total: logs.length
    };
  }, [logsData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6 dark:bg-gray-900/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-primary font-bold flex items-center gap-3">
            <BookOpen size={36} className="text-blue-600" />
            របាយការណ៍ខ្ចី-សងសៀវភៅបណ្ណាល័យ
          </h1>
          <p className="text-gray-500 mt-1">គ្រប់គ្រង និងតាមដានស្ថិតិនៃការខ្ចីសៀវភៅរបស់សិស្សានុសិស្ស</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel} 
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet size={18} /> 
            {exporting ? "កំពុងទាញយក..." : "ទាញយករបាយការណ៍ (Excel)"}
          </button>
          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={20} /> កត់ត្រាខ្ចីថ្មី
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-bold">សរុបប្រចាំទំព័រ</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{stats.total} ករណី</h3>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 dark:bg-gray-900/50">
            <Book size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-bold">កំពុងខ្ចី</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.borrowed} ក្បាល</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-bold">សងរួច</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.returned} ក្បាល</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-bold">ហួសកំណត់</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.overdue} ក្បាល</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ស្វែងរកឈ្មោះសិស្ស អត្តលេខ ឬចំណងជើងសៀវភៅ..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:bg-gray-900/50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["All", "Borrowed", "Returned", "Overdue"].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === status 
                  ? "bg-primary text-white shadow-md" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {status === "All" ? "ទាំងអស់" : status === "Borrowed" ? "កំពុងខ្ចី" : status === "Returned" ? "សងរួច" : "ហួសកំណត់"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="overflow-x-auto">
          {isLogsLoading ? (
            <div className="py-20 text-center text-gray-400 font-bold">កំពុងទាញយកទិន្នន័យ...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 dark:bg-gray-900/50">
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">សិស្ស / អត្តលេខ</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">ថ្នាក់រៀន</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">សៀវភៅខ្ចី</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">កាលបរិច្ឆេទខ្ចី-សង</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">ស្ថានភាព</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(logsData?.data || []).map(log => (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-primary">{log.student?.nameKh || "—"}</p>
                        <p className="text-xs font-mono font-semibold text-gray-400 mt-0.5">{log.student?.studentId || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {log.student?.classroom?.name || log.student?.grade || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-700">{log.bookTitle}</p>
                        {log.bookCode && <p className="text-xs font-mono text-gray-400 mt-0.5">លេខកូដ៖ {log.bookCode}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 font-mono text-xs">
                        <span className="w-16 text-gray-400">ថ្ងៃខ្ចី៖</span>
                        <span>{log.borrowDate.split("T")[0]}</span>
                      </div>
                      {log.dueDate && (
                        <div className="flex items-center gap-2 text-gray-600 font-mono text-xs">
                          <span className="w-16 text-gray-400">ត្រូវសង៖</span>
                          <span className={log.bookStatus === "Overdue" ? "text-red-500 font-bold" : ""}>{log.dueDate.split("T")[0]}</span>
                        </div>
                      )}
                      {log.returnDate && (
                        <div className="flex items-center gap-2 text-green-600 font-mono text-xs">
                          <span className="w-16 text-green-400/80">ថ្ងៃសង៖</span>
                          <span className="font-bold">{log.returnDate.split("T")[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.bookStatus === "Returned" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={14} /> សងរួច
                        </span>
                      )}
                      {log.bookStatus === "Borrowed" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock size={14} /> កំពុងខ្ចី
                        </span>
                      )}
                      {log.bookStatus === "Overdue" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                          <AlertTriangle size={14} /> ហួសកំណត់
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2 h-full">
                      {log.bookStatus !== "Returned" && (
                        <button 
                          onClick={() => markAsReturned(log)} 
                          className="text-xs font-extrabold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          កត់ត្រាសង
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenModal(log)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(log.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!logsData?.data || logsData.data.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4 dark:bg-gray-900/50">
                        <BookOpen size={28} />
                      </div>
                      <p className="text-gray-500 font-bold text-lg">មិនមានកំណត់ត្រាខ្ចីសៀវភៅទេ</p>
                      <p className="text-gray-400 text-sm mt-1">សូមសាកល្បងសារជាថ្មី ឬចុច "កត់ត្រាខ្ចីថ្មី" ដើម្បីបង្កើត</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d1b33]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen size={20} className="text-blue-300" />
                {editingLog ? "កែប្រែកំណត់ត្រាខ្ចី-សង" : "កត់ត្រាការខ្ចីសៀវភៅថ្មី"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><X size={18} /></button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* Autocomplete Student Select */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">ស្វែងរកសិស្សានុសិស្ស</label>
                {selectedStudent ? (
                  /* Selected Student Card */
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md font-bold text-lg">
                        {selectedStudent.nameKh?.[0] || <User size={24} />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-primary">{selectedStudent.nameKh} <span className="text-xs text-gray-500 font-normal">({selectedStudent.nameEn})</span></h4>
                        <p className="text-xs font-mono text-blue-600 font-semibold mt-0.5">{selectedStudent.studentId}</p>
                        
                        {/* More Metadata */}
                        <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><GraduationCap size={14} className="text-indigo-400" /> {selectedStudent.classroom?.name || selectedStudent.grade}</span>
                          <span className="flex items-center gap-1"><User size={14} className="text-indigo-400" /> {selectedStudent.gender === "female" ? "ស្រី" : "ប្រុស"}</span>
                          {selectedStudent.parentPhone && (
                            <span className="flex items-center gap-1 font-mono"><Phone size={12} className="text-indigo-400" /> {selectedStudent.parentPhone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!editingLog && (
                      <button 
                        onClick={() => {
                          setSelectedStudent(null);
                          setStudentSearch("");
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-3 py-1.5 rounded-lg border border-red-100 transition-colors shrink-0 cursor-pointer"
                      >
                        ផ្លាស់ប្តូរ
                      </button>
                    )}
                  </div>
                ) : (
                  /* Search Input Combobox */
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="ស្វែងរកតាម ឈ្មោះខ្មែរ ឈ្មោះឡាតាំង ឬអត្តលេខ..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                        value={studentSearch}
                        onChange={e => {
                          setStudentSearch(e.target.value);
                          setIsStudentDropdownOpen(true);
                        }}
                        onFocus={() => setIsStudentDropdownOpen(true)}
                      />
                    </div>

                    {isStudentDropdownOpen && studentSearch && (
                      <div className="absolute z-10 w-full bg-white border border-gray-100 mt-1.5 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                        {filteredStudents.map(student => (
                          <div 
                            key={student.id}
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsStudentDropdownOpen(false);
                            }}
                            className="p-3 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors group"
                          >
                            <div>
                              <p className="font-bold text-primary group-hover:text-blue-700 text-sm">{student.nameKh}</p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">{student.studentId} • {student.nameEn}</p>
                            </div>
                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {student.classroom?.name || student.grade}
                            </span>
                          </div>
                        ))}
                        {filteredStudents.length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-400 font-medium">មិនមានសិស្សដែលត្រូវនឹងការស្វែងរកទេ</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ចំណងជើងសៀវភៅ</label>
                  <input 
                    value={form.bookTitle} 
                    onChange={e => setForm({...form, bookTitle: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium" 
                    placeholder="ឧ. គណិតវិទ្យា ថ្នាក់ទី១២" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">លេខកូដសៀវភៅ (បាកូដ / កូដបណ្ណាល័យ)</label>
                  <input 
                    value={form.bookCode} 
                    onChange={e => setForm({...form, bookCode: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-mono font-medium" 
                    placeholder="ឧ. BK-MATH-12-005" 
                  />
                </div>
              </div>

              {/* Borrow and Due Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ថ្ងៃខ្ចី</label>
                  <input 
                    type="date" 
                    value={form.borrowDate} 
                    onChange={e => {
                      const newBorrowDate = e.target.value;
                      // Update due date automatically to borrowDate + 14 days
                      const due = new Date(new Date(newBorrowDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                      setForm({...form, borrowDate: newBorrowDate, dueDate: due});
                    }} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ថ្ងៃត្រូវសង (Due Date)</label>
                  <input 
                    type="date" 
                    value={form.dueDate} 
                    onChange={e => setForm({...form, dueDate: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium" 
                  />
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ស្ថានភាព</label>
                  <select 
                    value={form.status} 
                    onChange={e => {
                      const newStatus = e.target.value;
                      const today = new Date().toISOString().split("T")[0];
                      setForm({
                        ...form, 
                        status: newStatus,
                        returnDate: newStatus === "Returned" ? today : ""
                      });
                    }} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium bg-white appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    <option value="Borrowed">កំពុងខ្ចី</option>
                    <option value="Returned">សងរួច</option>
                    <option value="Overdue">ហួសកំណត់</option>
                  </select>
                </div>

                {form.status === "Returned" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-bold text-gray-700 mb-1">ថ្ងៃសងពិតប្រាកដ</label>
                    <input 
                      type="date" 
                      value={form.returnDate} 
                      onChange={e => setForm({...form, returnDate: e.target.value})} 
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium" 
                    />
                  </div>
                )}
              </div>

            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 dark:bg-gray-900/50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 border rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">បោះបង់</button>
              <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-xl shadow-md hover:opacity-90 transition-colors cursor-pointer">រក្សាទុក</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
