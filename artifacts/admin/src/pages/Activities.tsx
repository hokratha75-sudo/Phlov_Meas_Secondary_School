import { useState } from "react";
import { useListActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, X, Calendar, Activity as ActivityIcon } from "lucide-react";
import type { Activity, CreateActivityRequest } from "@workspace/api-client-react";
import ImageUpload from "@/components/ImageUpload";
import { useTranslation } from "@/lib/i18n";
import { resolveUrl } from "@/lib/axiosConfig";

const CATEGORIES = ["general", "sports", "culture", "academics", "festival", "community", "national"];

function ActivityModal({ item, onClose, onSave }: {
  item?: Activity | null;
  onClose: () => void;
  onSave: (data: CreateActivityRequest) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CreateActivityRequest>({
    titleEn: item?.titleEn ?? "",
    titleKh: item?.titleKh ?? "",
    descriptionEn: item?.descriptionEn ?? "",
    descriptionKh: item?.descriptionKh ?? "",
    category: item?.category ?? "general",
    imageUrl: item?.imageUrl ?? "",
    eventDate: item?.eventDate ?? "",
    likes: item?.likes ?? 0,
    commentsCount: item?.commentsCount ?? 0,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg text-primary">{item ? t("editActivity") : t("addActivity")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("titleEn")}</label>
              <input value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("titleKh")}</label>
              <input value={form.titleKh} onChange={e => setForm(f => ({ ...f, titleKh: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("descriptionEn")}</label>
              <textarea rows={4} value={form.descriptionEn} onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("descriptionKh")}</label>
              <textarea rows={4} value={form.descriptionKh} onChange={e => setForm(f => ({ ...f, descriptionKh: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("category")}</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("date")}</label>
              <input value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                placeholder="e.g. April 13-15, 2024"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <ImageUpload 
            label={t("photoUrl")} 
            value={form.imageUrl ?? ""} 
            onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))} 
          />
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-900/50">{t("cancel")}</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90">{t("save")}</button>
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const { token } = useAuth();
  const { t, lang } = useTranslation();
  const [modal, setModal] = useState<Activity | null | "new">(null);
  const { data, refetch, isLoading, isError, error } = useListActivities(undefined, { request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: create } = useCreateActivity({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: update } = useUpdateActivity({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: remove } = useDeleteActivity({ request: { headers: { Authorization: `Bearer ${token}` } } });

  if (isLoading) return <div className="py-20 text-center text-gray-500">{t("loading")}</div>;
  if (isError) return <div className="py-20 text-center text-red-500 font-semibold uppercase">{t("error")}: {(error as any)?.message || "Failed to load activities"}</div>;

  const handleSave = (form: CreateActivityRequest) => {
    if (modal === "new") {
      create({ data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    } else if (modal) {
      update({ id: (modal as Activity).id, data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    }
  };

  const categoryColors: Record<string, string> = {
    sports: "bg-blue-50 text-blue-700", culture: "bg-pink-50 text-pink-700",
    academics: "bg-indigo-50 text-indigo-700", festival: "bg-red-50 text-red-700",
    community: "bg-teal-50 text-teal-700", national: "bg-amber-50 text-amber-700",
    general: "bg-gray-50 text-gray-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl text-primary">{t("activitiesTitle")}</h2>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} {t("totalActivities")}</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          <Plus size={16} /> {t("addActivity")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.data.map(a => (
          <div key={a.id} className="bg-white border rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            {a.imageUrl && <img src={resolveUrl(a.imageUrl)} alt={a.titleEn} className="w-full h-40 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-primary truncate">{lang === "km" ? a.titleKh : a.titleEn}</p>
                  <p className="text-xs text-gray-400 truncate">{lang === "km" ? a.titleEn : a.titleKh}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-tighter ${categoryColors[a.category] ?? "bg-gray-50 text-gray-600"}`}>{a.category}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                <Calendar size={12} />
                <span>{a.eventDate}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{lang === "km" ? a.descriptionKh : a.descriptionEn}</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setModal(a)} className="p-2 text-gray-400 hover:text-primary border rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-900/50"><Pencil size={14} /></button>
                <button onClick={() => { if (window.confirm(t("confirmDelete"))) remove({ id: a.id }, { onSuccess: () => refetch() }); }} className="p-2 text-gray-400 hover:text-red-600 border rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {(!data?.data || data.data.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-400">{t("noData")}</div>
        )}
      </div>
      {modal && <ActivityModal item={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
