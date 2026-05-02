import { useState } from "react";
import { useListStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import type { Student, CreateStudentRequest } from "@workspace/api-client-react";

const GRADES = ["Grade 10", "Grade 11", "Grade 12"];

function StudentModal({ item, onClose, onSave }: {
  item?: Student | null;
  onClose: () => void;
  onSave: (data: CreateStudentRequest) => void;
}) {
  const [form, setForm] = useState<CreateStudentRequest>({
    studentId: item?.studentId ?? "",
    nameEn: item?.nameEn ?? "",
    nameKh: item?.nameKh ?? "",
    grade: item?.grade ?? "Grade 10",
    gender: item?.gender ?? "Male",
    enrollmentYear: item?.enrollmentYear ?? new Date().getFullYear(),
    phone: item?.phone ?? "",
    parentPhone: item?.parentPhone ?? "",
    address: item?.address ?? "",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg text-gray-800">{item ? "Edit Student" : "Add Student"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Student ID</label>
              <input value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. SS-2024-001" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Enrollment Year</label>
              <input type="number" value={form.enrollmentYear} onChange={e => setForm(f => ({ ...f, enrollmentYear: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name (English)</label>
              <input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name (Khmer)</label>
              <input value={form.nameKh} onChange={e => setForm(f => ({ ...f, nameKh: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Grade</label>
              <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              <input value={form.phone ?? ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value || null }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Phone</label>
              <input value={form.parentPhone ?? ""} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value || null }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
            <input value={form.address ?? ""} onChange={e => setForm(f => ({ ...f, address: e.target.value || null }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

export default function StudentsPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [search, setSearch] = useState("");
  const { data, refetch } = useListStudents({ request: { headers } });
  const { mutate: create } = useCreateStudent({ request: { headers } });
  const { mutate: update } = useUpdateStudent({ request: { headers } });
  const { mutate: remove } = useDeleteStudent({ request: { headers } });
  const [modal, setModal] = useState<Student | null | "new">(null);

  const filtered = data?.data.filter(s =>
    s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    s.nameKh.includes(search) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleSave = (form: CreateStudentRequest) => {
    if (modal === "new") {
      create({ data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    } else if (modal) {
      update({ id: (modal as Student).id, data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    }
  };

  const gradeColors: Record<string, string> = {
    "Grade 10": "bg-blue-50 text-blue-700",
    "Grade 11": "bg-green-50 text-green-700",
    "Grade 12": "bg-purple-50 text-purple-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Students</h2>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} enrolled students</p>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-2 bg-[#1e3a6e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d5a8e]">
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID..." className="flex-1 text-sm outline-none" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Grade</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Gender</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Phone</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.studentId}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800">{s.nameEn}</p>
                  <p className="text-xs text-gray-400">{s.nameKh}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${gradeColors[s.grade] ?? "bg-gray-50 text-gray-600"}`}>{s.grade}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 capitalize">{s.gender}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{s.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setModal(s)} className="text-gray-400 hover:text-[#1e3a6e]"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm("Delete?")) remove({ id: s.id }, { onSuccess: () => refetch() }); }} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {modal && <StudentModal item={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
