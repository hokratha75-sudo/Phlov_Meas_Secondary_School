import { useState } from "react";
import { useListTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, X, GraduationCap } from "lucide-react";
import type { Teacher, CreateTeacherRequest } from "@workspace/api-client-react";

function TeacherModal({ item, onClose, onSave }: {
  item?: Teacher | null;
  onClose: () => void;
  onSave: (data: CreateTeacherRequest) => void;
}) {
  const [form, setForm] = useState<CreateTeacherRequest>({
    nameEn: item?.nameEn ?? "",
    nameKh: item?.nameKh ?? "",
    subjectEn: item?.subjectEn ?? "",
    subjectKh: item?.subjectKh ?? "",
    photoUrl: item?.photoUrl ?? "",
    bioEn: item?.bioEn ?? "",
    bioKh: item?.bioKh ?? "",
    phone: item?.phone ?? "",
    email: item?.email ?? "",
  });

  const set = (k: keyof CreateTeacherRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value || null }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">{item ? "Edit Teacher" : "Add Teacher"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {([["nameEn", "Name (English)"], ["nameKh", "Name (Khmer)"], ["subjectEn", "Subject (English)"], ["subjectKh", "Subject (Khmer)"], ["phone", "Phone"], ["email", "Email"]] as const).map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input value={(form[k] as string) ?? ""} onChange={set(k)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Photo URL</label>
            <input value={form.photoUrl ?? ""} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value || null }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([["bioEn", "Bio (English)"], ["bioKh", "Bio (Khmer)"]] as const).map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <textarea rows={3} value={(form[k] as string) ?? ""} onChange={set(k)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
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

export default function TeachersPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const { data, refetch } = useListTeachers({ request: { headers } });
  const { mutate: create } = useCreateTeacher({ request: { headers } });
  const { mutate: update } = useUpdateTeacher({ request: { headers } });
  const { mutate: remove } = useDeleteTeacher({ request: { headers } });
  const [modal, setModal] = useState<Teacher | null | "new">(null);

  const handleSave = (form: CreateTeacherRequest) => {
    if (modal === "new") {
      create({ data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    } else if (modal) {
      update({ id: (modal as Teacher).id, data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Teachers</h2>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} staff members</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 bg-[#1e3a6e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d5a8e]">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.data.map(t => (
          <div key={t.id} className="bg-white border rounded-xl p-5 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-shadow">
            {t.photoUrl ? (
              <img src={t.photoUrl} alt={t.nameEn} className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 mb-3" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <GraduationCap size={32} className="text-blue-300" />
              </div>
            )}
            <p className="font-bold text-gray-800">{t.nameEn}</p>
            <p className="text-gray-400 text-sm mb-1">{t.nameKh}</p>
            <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">{t.subjectEn}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setModal(t)} className="p-2 text-gray-400 hover:text-[#1e3a6e] border rounded-lg hover:bg-gray-50"><Pencil size={14} /></button>
              <button onClick={() => { if (confirm("Delete?")) remove({ id: t.id }, { onSuccess: () => refetch() }); }} className="p-2 text-gray-400 hover:text-red-600 border rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!data?.data.length && (
          <div className="col-span-full text-center py-12 text-gray-400">No teachers yet. Click "Add Teacher" to get started.</div>
        )}
      </div>
      {modal && <TeacherModal item={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
