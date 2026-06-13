import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import api from "@/lib/axiosConfig";
import { useListStudents } from "@workspace/api-client-react";
import {
  Link2, Unlink, RefreshCw, CheckCircle, XCircle, Search, Copy, Loader2, Users, Info, Plus, Pencil, Trash2, X
} from "lucide-react";

interface ParentRecord {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  classroomName: string;
  parentName: string;
  phone: string;
  telegramChatId: number | null;
  telegramLinkCode: string | null;
  telegramLinkedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ParentModalState {
  mode: "create" | "edit";
  record?: ParentRecord;
}

export default function ParentTelegramManager() {
  const { token, user } = useAuth();
  const { lang, t } = useTranslation();
  const headers = { Authorization: `Bearer ${token}` };

  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ParentModalState>({ mode: "create" });
  
  // Link code generation details modal
  const [linkCode, setLinkCode] = useState<{ code: string; parentName: string; instructions: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // parentId of loading action
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form Fields
  const [formStudentId, setFormStudentId] = useState<number | "">("");
  const [formParentName, setFormParentName] = useState("");
  const [formPhone, setFormPhone] = useState("");

  // Load students for the dropdown
  const { data: studentsData } = useListStudents(undefined, { request: { headers } });
  const students = studentsData?.data || [];

  const fetchParents = useCallback(async () => {
    setLoadingParents(true);
    try {
      const res = await api.get("/parents", { 
        headers, 
        params: { 
          limit: 1000, // Fetch all for local filtering to keep user experience snappy
          search: search.trim() || undefined 
        } 
      });
      setParents(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch parents:", err);
    } finally {
      setLoadingParents(false);
    }
  }, [search, token]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  // Local filtering based on connection status
  const filteredParents = useMemo(() => {
    let result = [...parents];
    if (statusFilter !== "all") {
      if (statusFilter === "linked") {
        result = result.filter(p => p.telegramChatId !== null);
      } else if (statusFilter === "unlinked") {
        result = result.filter(p => p.telegramChatId === null);
      }
    }
    return result;
  }, [parents, statusFilter]);

  const stats = useMemo(() => {
    const total = parents.length;
    const linked = parents.filter(p => p.telegramChatId !== null).length;
    const unlinked = total - linked;
    const rate = total > 0 ? Math.round((linked / total) * 100) : 0;
    return { total, linked, unlinked, rate };
  }, [parents]);

  const handleGenerateCode = async (parentId: number) => {
    setActionLoading(parentId);
    try {
      const res = await api.post(`/telegram/generate-link-code/parent/${parentId}`, {}, { headers });
      setLinkCode(res.data);
      fetchParents();
    } catch (err: any) {
      console.error("Generate parent link code failed:", err);
      alert(err.response?.data?.error || "Failed to generate code");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlink = async (parentId: number, parentName: string) => {
    if (!window.confirm(lang === "km"
      ? `តើអ្នកពិតជាចង់ផ្ដាច់គណនី Telegram របស់អាណាព្យាបាល ${parentName} មែនទេ?`
      : `Are you sure you want to unlink parent ${parentName}?`
    )) return;

    setActionLoading(parentId);
    try {
      await api.post(`/telegram/unlink/parent/${parentId}`, {}, { headers });
      fetchParents();
    } catch (err: any) {
      console.error("Unlink failed:", err);
      alert(err.response?.data?.error || "Failed to unlink parent");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (parentId: number, parentName: string) => {
    if (!window.confirm(lang === "km"
      ? `តើអ្នកពិតជាចង់លុបព័ត៌មានទំនាក់ទំនងរបស់អាណាព្យាបាល ${parentName} នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`
      : `Are you sure you want to delete contact for parent ${parentName}? This action cannot be undone.`
    )) return;

    try {
      await api.delete(`/parents/${parentId}`, { headers });
      fetchParents();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.error || "Failed to delete parent contact");
    }
  };

  const openCreateModal = () => {
    setModalState({ mode: "create" });
    setFormStudentId("");
    setFormParentName("");
    setFormPhone("");
    setModalOpen(true);
  };

  const openEditModal = (record: ParentRecord) => {
    setModalState({ mode: "edit", record });
    setFormStudentId(record.studentId);
    setFormParentName(record.parentName);
    setFormPhone(record.phone);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formParentName || !formPhone) {
      alert("Please fill in parent name and phone number");
      return;
    }

    setSubmitLoading(true);
    try {
      if (modalState.mode === "create") {
        if (!formStudentId) {
          alert("Please select a student");
          setSubmitLoading(false);
          return;
        }
        await api.post("/parents", {
          studentId: Number(formStudentId),
          parentName: formParentName,
          phone: formPhone
        }, { headers });
      } else {
        await api.put(`/parents/${modalState.record?.id}`, {
          parentName: formParentName,
          phone: formPhone
        }, { headers });
      }
      setModalOpen(false);
      fetchParents();
    } catch (err: any) {
      console.error("Submit failed:", err);
      alert(err.response?.data?.error || "An error occurred");
    } finally {
      setSubmitLoading(false);
    }
  };

  const copyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(`/link ${linkCode.code}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary dark:text-blue-400 flex items-center gap-2">
            <Users size={24} />
            {lang === "km" ? "ការភ្ជាប់ Telegram របស់អាណាព្យាបាល" : "Parent Telegram Accounts"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {lang === "km"
              ? "គ្រប់គ្រងលេខកូដភ្ជាប់គណនី និងព័ត៌មានទំនាក់ទំនងរបស់អាណាព្យាបាលសិស្ស។"
              : "Manage linking codes and contact info for student parents."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            {lang === "km" ? "បន្ថែមអាណាព្យាបាល" : "Add Parent Contact"}
          </button>
          <button 
            onClick={fetchParents} 
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300 transition-colors dark:bg-gray-900/50"
          >
            <RefreshCw size={16} />
            {lang === "km" ? "ធ្វើឱ្យថ្មី" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: lang === "km" ? "អាណាព្យាបាលសរុប" : "Total Parents", value: stats.total, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
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
            placeholder={lang === "km" ? "ស្វែងរកឈ្មោះអាណាព្យាបាល លេខទូរសព្ទ ឬសិស្ស..." : "Search parent name, phone, or student..."}
            className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold">
              <tr>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "អាណាព្យាបាល" : "Parent Name"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "លេខទូរសព្ទ" : "Phone"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "សិស្ស" : "Student"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "ស្ថានភាព" : "Status"}</th>
                <th className="text-left px-6 py-3.5">{lang === "km" ? "លេខកូដភ្ជាប់" : "Link Code"}</th>
                <th className="px-6 py-3.5 text-right">{lang === "km" ? "សកម្មភាព" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loadingParents ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={24} />
                    <p className="mt-2 text-xs">Loading parent contacts...</p>
                  </td>
                </tr>
              ) : filteredParents.length > 0 ? (
                filteredParents.map((parent) => {
                  const isLinked = parent.telegramChatId !== null;
                  const hasCode = parent.telegramLinkCode !== null;
                  const isLoading = actionLoading === parent.id;
                  
                  return (
                    <tr key={parent.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors dark:bg-gray-900/50">
                      {/* Parent Name */}
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                        {parent.parentName}
                      </td>

                      {/* Parent Phone */}
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                        {parent.phone}
                      </td>

                      {/* Associated Student */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{parent.studentName}</span>
                          <span className="text-xs text-gray-400 font-mono">{parent.studentCode} • {parent.classroomName}</span>
                        </div>
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
                            <span className="font-mono font-bold text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded border border-blue-100/30">
                              {parent.telegramLinkCode}
                            </span>
                            <button
                              title="Copy Code Command"
                              onClick={() => {
                                navigator.clipboard.writeText(`/link ${parent.telegramLinkCode}`);
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(parent)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-100"
                            title="Edit Contact"
                          >
                            <Pencil size={15} />
                          </button>
                          
                          {user?.role === "admin" && (
                            <button
                              onClick={() => handleDelete(parent.id, parent.parentName)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500 hover:text-red-700"
                              title="Delete Contact"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                          {isLinked ? (
                            <button
                              onClick={() => handleUnlink(parent.id, parent.parentName)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />}
                              {lang === "km" ? "ផ្ដាច់" : "Unlink"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateCode(parent.id)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-primary hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-100 dark:border-blue-800/50 disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                              {hasCode ? (lang === "km" ? "បង្កើតឡើងវិញ" : "Regenerate") : (lang === "km" ? "បង្កើតលេខកូដ" : "Generate Code")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Info size={40} className="mx-auto mb-3 opacity-50 text-gray-400" />
                    <p className="font-semibold">{lang === "km" ? "រកមិនឃើញទិន្នន័យអាណាព្យាបាលទេ" : "No parent records found"}</p>
                    <p className="text-xs mt-1">{lang === "km" ? "សូមបន្ថែមទំនាក់ទំនង ឬស្វែងរកឡើងវិញ" : "Add a parent contact or adjust your search filter"}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-150 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 rounded-t-xl">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                {modalState.mode === "create" 
                  ? (lang === "km" ? "បន្ថែមព័ត៌មានទំនាក់ទំនងអាណាព្យាបាល" : "Add Parent Contact") 
                  : (lang === "km" ? "កែសម្រួលព័ត៌មានអាណាព្យាបាល" : "Edit Parent Contact")}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Student Dropdown - Only show on CREATE mode */}
              {modalState.mode === "create" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {lang === "km" ? "សិស្ស" : "Student"}
                  </label>
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- {lang === "km" ? "ជ្រើសរើសសិស្ស" : "Select Student"} --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameKh} ({s.studentId}) {s.classroom ? `• ${s.classroom.name}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-700 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === "km" ? "សិស្សសកម្ម" : "Associated Student"}</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{modalState.record?.studentName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{modalState.record?.studentCode} • {modalState.record?.classroomName}</p>
                </div>
              )}

              {/* Parent Name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  {lang === "km" ? "ឈ្មោះអាណាព្យាបាល" : "Parent Name"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "km" ? "ឧ. សុខ ម៉ារី" : "e.g. Sok Mary"}
                  className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  value={formParentName}
                  onChange={(e) => setFormParentName(e.target.value)}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  {lang === "km" ? "លេខទូរសព្ទ" : "Phone Number"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "km" ? "ឧ. 012345678" : "e.g. 012345678"}
                  className="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-900 dark:text-gray-100"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors dark:bg-gray-900/50"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/10"
                >
                  {submitLoading && <Loader2 size={14} className="animate-spin" />}
                  {lang === "km" ? "រក្សាទុក" : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Code Display Modal */}
      {linkCode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLinkCode(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-150 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Link2 size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {lang === "km" ? "លេខកូដភ្ជាប់អាណាព្យាបាល" : "Link Code Generated!"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {lang === "km" ? `សម្រាប់អាណាព្យាបាល៖ ${linkCode.parentName}` : `For parent: ${linkCode.parentName}`}
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
