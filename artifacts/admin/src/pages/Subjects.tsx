import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Loader2, 
  AlertCircle,
  Hash,
  Type
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: number;
  nameEn: string;
  nameKh: string;
  code: string;
}

export default function SubjectsPage() {
  const { lang, t } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nameEn: "", nameKh: "", code: "" });

  const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t("failedToLoad"));
      const json = await res.json();
      setSubjects(json.data || []);
    } catch (error) {
      toast({ title: t("error"), description: t("failedToLoad"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn || !formData.nameKh || !formData.code) {
      toast({ title: t("error"), description: t("fieldsRequired"), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `${baseUrl}/api/subjects/${editingId}` : `${baseUrl}/api/subjects`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || t("error"));
      }

      toast({ 
        title: t("success"), 
        description: editingId ? t("subjectUpdated") : t("subjectAdded")
      });

      setFormData({ nameEn: "", nameKh: "", code: "" });
      setEditingId(null);
      fetchSubjects();
    } catch (error: any) {
      console.error("Subject save error:", error);
      toast({ 
        title: t("error"), 
        description: error.message || t("error"), 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setFormData({ nameEn: sub.nameEn, nameKh: sub.nameKh, code: sub.code });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDeleteSubject"))) return;

    try {
      const res = await fetch(`${baseUrl}/api/subjects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t("deleteFailed"));
      toast({ title: t("success"), description: t("subjectDeleted") });
      fetchSubjects();
    } catch (error) {
      toast({ title: t("error"), description: t("deleteFailed"), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-sans">
      
      {/* Page Header */}
      <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-sans font-black text-primary">
              {t("subjectManagement")}
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1">
              {t("subjectSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form Section */}
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-xl space-y-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
            {editingId ? <Edit2 className="text-amber-500" size={20} /> : <Plus className="text-indigo-500" size={20} />}
            <h3 className="font-sans font-black text-primary">
              {editingId ? t("editSubject") : t("addSubject")}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-black text-primary/70 uppercase tracking-widest flex items-center gap-2">
                <Type size={14} className="text-indigo-500" /> {t("nameKh")}
              </label>
              <input 
                type="text"
                value={formData.nameKh}
                onChange={e => setFormData({...formData, nameKh: e.target.value})}
                placeholder={lang === 'km' ? "ឧ. គណិតវិទ្យា" : "Ex. Mathematics"}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-primary outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-primary/70 uppercase tracking-widest flex items-center gap-2">
                <Type size={14} className="text-indigo-500" /> {t("nameEn")}
              </label>
              <input 
                type="text"
                value={formData.nameEn}
                onChange={e => setFormData({...formData, nameEn: e.target.value})}
                placeholder="Ex. Mathematics"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-primary outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-primary/70 uppercase tracking-widest flex items-center gap-2">
                <Hash size={14} className="text-indigo-500" /> {t("subjectCode")}
              </label>
              <input 
                type="text"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="Ex. MAT"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-primary outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex gap-3 pt-4">
              {editingId && (
                <button 
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({ nameEn: "", nameKh: "", code: "" }); }}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold transition-all hover:bg-gray-200"
                >
                  {t("cancel")}
                </button>
              )}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all hover:bg-[#2a4e8c] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {editingId ? t("update") : t("save")}
              </button>
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden min-h-[500px] relative dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between dark:bg-gray-900/50">
              <h3 className="text-base font-sans font-black text-primary uppercase tracking-widest">
                {t("existingSubjects")}
              </h3>
              <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {t("total")}: {subjects.length}
              </span>
            </div>

            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-[1px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600 animate-pulse">{t("loading")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <th className="px-8 py-5 text-sm font-black text-primary uppercase tracking-wide">{t("subjectCode")}</th>
                      <th className="px-8 py-5 text-sm font-black text-primary uppercase tracking-wide">{t("subjectName")}</th>
                      <th className="px-8 py-5 text-sm font-black text-primary uppercase tracking-wide text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subjects.map(sub => (
                      <tr key={sub.id} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="px-8 py-5">
                          <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            {sub.code}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div>
                            <p className="font-bold text-primary group-hover:text-indigo-600 transition-colors">{sub.nameKh}</p>
                            <p className="text-xs text-gray-400 font-medium">{sub.nameEn}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button 
                              onClick={() => handleEdit(sub)}
                              className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                              title={t("edit")}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(sub.id)}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title={t("delete")}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subjects.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-32 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-300">
                            <div className="p-6 bg-gray-50 rounded-full mb-6 dark:bg-gray-900/50">
                              <AlertCircle size={48} className="opacity-20" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest tracking-tighter">
                              {t("noData")}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">
                              {lang === 'km' ? "សូមចាប់ផ្ដើមដោយបន្ថែមមុខវិជ្ជាថ្មីនៅខាងឆ្វេង" : "Start by adding your first subject on the left."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
