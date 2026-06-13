import { useState, useMemo } from "react";
import { useListNews, useCreateNews, useUpdateNews, useDeleteNews } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Search as SearchIcon, Filter, AlertTriangle, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import type { NewsArticle, CreateNewsRequest } from "@workspace/api-client-react";
import ImageUpload from "@/components/ImageUpload";

const CATEGORIES = ["general", "exam", "enrollment", "event", "announcement"];

function NewsModal({ item, onClose, onSave }: {
  item?: NewsArticle | null;
  onClose: () => void;
  onSave: (data: CreateNewsRequest) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CreateNewsRequest>({
    titleEn: item?.titleEn ?? "",
    titleKh: item?.titleKh ?? "",
    contentEn: item?.contentEn ?? "",
    contentKh: item?.contentKh ?? "",
    imageUrl: item?.imageUrl ?? "",
    category: item?.category ?? "general",
    isPublished: item?.isPublished ?? true,
    sendToMain: true,
    sendToTeachers: false,
    sendToStudents: false,
    sendToParents: false,
    pinToMain: false,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg text-primary">{item ? "Edit News" : "Add News"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title (English)</label>
              <input value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title (Khmer)</label>
              <input value={form.titleKh} onChange={e => setForm(f => ({ ...f, titleKh: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Content (English)</label>
              <textarea rows={4} value={form.contentEn} onChange={e => setForm(f => ({ ...f, contentEn: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Content (Khmer)</label>
              <textarea rows={4} value={form.contentKh} onChange={e => setForm(f => ({ ...f, contentKh: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <ImageUpload 
            label={t("photoUrl")} 
            value={form.imageUrl ?? ""} 
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} 
          />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.isPublished ?? true}
                onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded" />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 block mb-1">📢 ផ្ញើទៅកាន់ Telegram</label>
              
              <div className="space-y-2 ml-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.sendToMain ?? false}
                    onChange={(e) => setForm(f => ({ ...f, sendToMain: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">📢 Main Channel (ទាំងអស់គ្នា)</span>
                </label>
                
                {form.sendToMain && (
                  <label className="flex items-center gap-2 ml-6 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.pinToMain ?? false}
                      onChange={(e) => setForm(f => ({ ...f, pinToMain: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500">📌 Pin ខាងលើក្នុង Main Channel</span>
                  </label>
                )}
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.sendToTeachers ?? false}
                    onChange={(e) => setForm(f => ({ ...f, sendToTeachers: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">👨🏫 Teachers Channel (សម្រាប់គ្រូបង្រៀន)</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.sendToStudents ?? false}
                    onChange={(e) => setForm(f => ({ ...f, sendToStudents: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">👨🎓 Students Channel (សម្រាប់សិស្ស)</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.sendToParents ?? false}
                    onChange={(e) => setForm(f => ({ ...f, sendToParents: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">👨👩👧 Parents Channel (សម្រាប់មាតាបិតា)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-900/50">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90">Save</button>
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from "@/lib/i18n";

export default function NewsPage() {
  const { token } = useAuth();
  const { t, lang } = useTranslation();
  const [modal, setModal] = useState<NewsArticle | null | "new">(null);
  const [deleteModal, setDeleteModal] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof NewsArticle | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  
  const { data, refetch, isLoading, isError, error } = useListNews(undefined, { request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: create } = useCreateNews({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: update } = useUpdateNews({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: remove } = useDeleteNews({ request: { headers: { Authorization: `Bearer ${token}` } } });

  const handleSort = (key: keyof NewsArticle) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    let filtered = [...data.data];
    
    // Apply sorting first
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof NewsArticle] as any;
        let bVal = b[sortConfig.key as keyof NewsArticle] as any;
        
        if (sortConfig.key === 'publishedAt') {
           aVal = new Date(aVal || 0).getTime();
           bVal = new Date(bVal || 0).getTime();
        } else if (typeof aVal === 'string') {
           aVal = aVal.toLowerCase();
           bVal = (bVal || '').toLowerCase();
        } else if (typeof aVal === 'boolean') {
           aVal = aVal ? 1 : 0;
           bVal = bVal ? 1 : 0;
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.titleEn?.toLowerCase().includes(q)) || 
        (item.titleKh?.toLowerCase().includes(q)) ||
        (item.contentEn?.toLowerCase().includes(q)) ||
        (item.contentKh?.toLowerCase().includes(q))
      );
    }
    
    return filtered;
  }, [data?.data, searchQuery, categoryFilter, sortConfig]);

  if (isLoading) return <div className="py-20 text-center text-gray-500">{t("loading")}</div>;
  if (isError) return <div className="py-20 text-center text-red-500 font-semibold uppercase">{t("error")}: {(error as any)?.message || "Failed to load news"}</div>;

  const handleSave = (form: CreateNewsRequest) => {
    if (modal === "new") {
      create({ data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    } else if (modal) {
      update({ id: (modal as NewsArticle).id, data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-sans">{t("newsArticles")}</h2>
          <p className="text-gray-500 text-sm mt-1">{filteredData.length} {lang === 'km' ? 'ព័ត៌មានបានរកឃើញ' : 'articles found'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={lang === 'km' ? 'ស្វែងរកព័ត៌មាន...' : 'Search news...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-gray-800 dark:text-gray-100 shadow-sm"
            />
          </div>
          <button onClick={() => setModal("new")} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95 whitespace-nowrap">
            <Plus size={18} /> {t("addNews")}
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter size={16} className="text-gray-400 mr-1 hidden sm:block" />
        {["all", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              categoryFilter === cat 
                ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background" 
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
            }`}
          >
            {cat === "all" ? (lang === "km" ? "ទាំងអស់" : "All") : cat}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none" onClick={() => handleSort('titleEn')}>
                <div className="flex items-center gap-1">
                  {t("titleEn")} / {t("titleKh")}
                  {sortConfig.key === 'titleEn' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ChevronsUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />}
                </div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1">
                  {t("category")}
                  {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ChevronsUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />}
                </div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden lg:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none" onClick={() => handleSort('publishedAt')}>
                <div className="flex items-center gap-1">
                  {t("date")}
                  {sortConfig.key === 'publishedAt' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ChevronsUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />}
                </div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none" onClick={() => handleSort('isPublished')}>
                <div className="flex items-center gap-1">
                  {t("status")}
                  {sortConfig.key === 'isPublished' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ChevronsUpDown size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />}
                </div>
              </th>
              <th className="px-4 py-3 text-right dark:text-gray-300">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700/50">
            {filteredData.map(item => (
              <tr key={item.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-semibold text-primary dark:text-blue-400 truncate max-w-xs">{lang === "km" ? item.titleKh : item.titleEn}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5">{lang === "km" ? item.titleEn : item.titleKh}</p>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full capitalize inline-block">{item.category}</span>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell text-gray-500 dark:text-gray-400 text-sm font-medium">{new Date(item.publishedAt).toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US')}</td>
                <td className="px-4 py-4">
                  {item.isPublished
                    ? <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"><Eye size={12} /> {t("published")}</span>
                    : <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"><EyeOff size={12} /> {t("draft")}</span>}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteModal(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <SearchIcon size={32} className="mb-3 opacity-20" />
                    <p className="text-base font-medium">{lang === 'km' ? 'រកមិនឃើញព័ត៌មានទេ' : 'No news found'}</p>
                    <p className="text-sm mt-1 opacity-80">{lang === 'km' ? 'សាកល្បងស្វែងរកម្តងទៀតដោយប្រើពាក្យផ្សេង' : 'Try adjusting your search or filters'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {modal && <NewsModal item={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {lang === 'km' ? 'លុបព័ត៌មាននេះ?' : 'Delete this article?'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {lang === 'km' 
                  ? 'តើអ្នកប្រាកដជាចង់លុបព័ត៌មាននេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។' 
                  : 'Are you sure you want to delete this article? This action cannot be undone.'}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteModal(null)} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors dark:bg-gray-900/50"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button 
                  onClick={() => {
                    remove({ id: deleteModal.id }, { onSuccess: () => { refetch(); setDeleteModal(null); } });
                  }} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  {lang === 'km' ? 'លុប' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
