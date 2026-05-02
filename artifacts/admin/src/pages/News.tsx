import { useState } from "react";
import { useListNews, useCreateNews, useUpdateNews, useDeleteNews } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import type { NewsArticle, CreateNewsRequest } from "@workspace/api-client-react";

const CATEGORIES = ["general", "exam", "enrollment", "event", "announcement"];

function NewsModal({ item, onClose, onSave }: {
  item?: NewsArticle | null;
  onClose: () => void;
  onSave: (data: CreateNewsRequest) => void;
}) {
  const [form, setForm] = useState<CreateNewsRequest>({
    titleEn: item?.titleEn ?? "",
    titleKh: item?.titleKh ?? "",
    contentEn: item?.contentEn ?? "",
    contentKh: item?.contentKh ?? "",
    imageUrl: item?.imageUrl ?? "",
    category: item?.category ?? "general",
    isPublished: item?.isPublished ?? true,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">{item ? "Edit News" : "Add News"}</h2>
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
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL (optional)</label>
              <input value={form.imageUrl ?? ""} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value || null }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.isPublished ?? true}
              onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded" />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm bg-[#1e3a6e] text-white rounded-lg hover:bg-[#2d5a8e]">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const { data, refetch } = useListNews({ request: { headers } });
  const { mutate: create } = useCreateNews({ request: { headers } });
  const { mutate: update } = useUpdateNews({ request: { headers } });
  const { mutate: remove } = useDeleteNews({ request: { headers } });
  const [modal, setModal] = useState<NewsArticle | null | "new">(null);

  const handleSave = (form: CreateNewsRequest) => {
    if (modal === "new") {
      create({ data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    } else if (modal) {
      update({ id: (modal as NewsArticle).id, data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">News Articles</h2>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} total articles</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 bg-[#1e3a6e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d5a8e]">
          <Plus size={16} /> Add News
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.data.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800 truncate max-w-xs">{item.titleEn}</p>
                  <p className="text-xs text-gray-400 truncate max-w-xs">{item.titleKh}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full capitalize">{item.category}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{new Date(item.publishedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {item.isPublished
                    ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><Eye size={12} /> Published</span>
                    : <span className="flex items-center gap-1 text-gray-400 text-xs font-semibold"><EyeOff size={12} /> Draft</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setModal(item)} className="text-gray-400 hover:text-[#1e3a6e]"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm("Delete?")) remove({ id: item.id }, { onSuccess: () => refetch() }); }} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!data?.data.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No news articles yet. Click "Add News" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {modal && <NewsModal item={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
