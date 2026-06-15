import { useState, useMemo } from "react";
import { useListStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, useCreateDisciplineLog, useListClassrooms } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Pencil, Trash2, X, Search, UserPlus, AlertTriangle, ArrowUpDown, Eye, ShieldAlert, IdCard, Users, FileSpreadsheet, Upload, FileText } from "lucide-react";
import type { Student, CreateStudentRequest, CreateDisciplineLogRequest, Classroom } from "@workspace/api-client-react";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";
import StudentIdCardStudio from "@/components/StudentIdCardStudio";
import ExcelJS from 'exceljs';
import { GeoDropdowns } from "@/components/GeoDropdowns";
import { exportStudentProfileToExcel } from "@/utils/excelExport";
import api, { resolveUrl } from "@/lib/axiosConfig";

const GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

// --- Modals ---

function DisciplineModal({ student, onClose, onSave }: { student: Student; onClose: () => void; onSave: (data: CreateDisciplineLogRequest) => void; }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    faultDate: new Date().toISOString().split("T")[0],
    faultDescription: "",
    penaltyType: "Warning",
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1b33]/60 backdrop-blur-sm flex items-center justify-end p-0">
      <div className="bg-white h-full shadow-2xl w-full max-w-md overflow-y-auto animate-in slide-in-from-right duration-300 border-l-[6px] border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="bg-primary px-6 py-5 flex items-center justify-between text-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="text-red-400" />
            <h2 className="text-xl">{t("addDiscipline")}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><X size={20} /></button>
        </div>
        <div className="px-6 py-6 space-y-5">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{t("fullName")}</p>
            <p className="text-lg font-bold text-primary">{student.nameKh} <span className="text-gray-500 text-base font-normal">({student.nameEn})</span></p>
            <p className="text-sm font-mono text-blue-600 mt-1">{student.studentId} • {student.grade}</p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide">{t("faultDate")}</label>
            <input type="date" value={form.faultDate} onChange={e => setForm(f => ({ ...f, faultDate: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-medium text-gray-800" />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide">{t("disciplinePenalty")}</label>
            <select value={form.penaltyType} onChange={e => setForm(f => ({ ...f, penaltyType: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-medium text-gray-800 appearance-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <option value="Warning">Warning / ព្រមាន</option>
              <option value="Labor">Labor / ពលកម្ម</option>
              <option value="Call Parents">Call Parents / ហៅអាណាព្យាបាល</option>
              <option value="Suspension">Suspension / ព្យួរការសិក្សា</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide">{t("disciplineDescription")}</label>
            <textarea value={form.faultDescription} onChange={e => setForm(f => ({ ...f, faultDescription: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[120px] font-medium text-gray-800" placeholder={t("describeFault")} />
          </div>
        </div>
        <div className="px-6 py-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 border-2 rounded-lg hover:bg-gray-50 transition-colors w-full dark:bg-gray-900/50">{t("cancel")}</button>
          <button onClick={() => {
            onSave({ studentId: student.id, faultDate: new Date(form.faultDate).toISOString(), faultDescription: form.faultDescription, penaltyType: form.penaltyType });
          }} className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:opacity-90 transition-colors shadow-md w-full">
            {t("saveRecord")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentModal({ item, onClose, onSave, token, classrooms }: { item?: Student | null; onClose: () => void; onSave: (data: CreateStudentRequest) => void; token: string | null; classrooms: Classroom[] }) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<CreateStudentRequest>({
    studentId: item?.studentId ?? "", nameEn: item?.nameEn ?? "", nameKh: item?.nameKh ?? "",
    grade: item?.grade ?? "Grade 10", gender: item?.gender ?? "Male",
    enrollmentYear: item?.enrollmentYear ?? new Date().getFullYear(),
    classId: item?.classId ?? null,
    phone: item?.phone ?? "", parentPhone: item?.parentPhone ?? "", address: item?.address ?? "",
    photoUrl: item?.photoUrl ?? "", biography: item?.biography ?? "", familyStatus: item?.familyStatus ?? "",
    // Extra fields from Excel (using any casting for now to support extended data)
    fatherName: (item as any)?.fatherName ?? "",
    motherName: (item as any)?.motherName ?? "",
    classRole: (item as any)?.classRole ?? t("member"),
    dob: (item as any)?.dob ? (item as any).dob.split("T")[0] : "",
  } as any);

  const [geoData, setGeoData] = useState(() => {
    try { return JSON.parse(item?.address || "{}"); } catch { return {}; }
  });

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-100 my-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white rounded-t-2xl sticky top-0 z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{item ? t("editStudent") : t("registerStudent")}</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">បំពេញព័ត៌មានលម្អិតរបស់សិស្សខាងក្រោម</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors dark:bg-gray-900/50"><X size={20} /></button>
        </div>

        <div className="px-8 py-6 space-y-8 flex-1">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-5">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              {t("basicInfo")}
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Avatar Uploader */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-28 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center relative group transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:bg-gray-900/50">
                  {form.photoUrl ? (
                    <img src={resolveUrl(form.photoUrl)} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <UserPlus size={28} className="mb-2" />
                      <span className="text-[10px] font-medium px-2 text-center text-gray-500">រូបថត 4x6</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                    <Upload size={20} className="mb-1" />
                    <span className="text-xs font-semibold text-center px-2">{isUploading ? "កំពុងផ្ទុក..." : t("uploadPhoto")}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await api.post("/upload", formData);
                        if (res.data && res.data.url) {
                          setForm(f => ({ ...f, photoUrl: res.data.url }));
                        } else {
                          alert(res.data.message || "Upload failed");
                        }
                      } catch (err) { alert("Upload error"); } 
                      finally { setIsUploading(false); }
                    }} disabled={isUploading} />
                  </label>
                </div>
                {form.photoUrl && (
                  <button onClick={() => setForm(f => ({ ...f, photoUrl: "" }))} className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1 bg-red-50 rounded-full">{t("removePhoto")}</button>
                )}
              </div>

              {/* Basic Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("studentId")}</label>
                  <input value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="e.g. SS-2024-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("enrollmentYear")}</label>
                  <input type="number" value={form.enrollmentYear} onChange={e => setForm(f => ({ ...f, enrollmentYear: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("nameKh")}</label>
                  <input value={form.nameKh} onChange={e => setForm(f => ({ ...f, nameKh: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-khmer bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="នាមត្រកូល និងនាមខ្លួន" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("nameEn")}</label>
                  <input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="Full Name (English)" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("grade")}</label>
                <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  {GRADES.map(g => <option key={g} value={g}>{t(g.toLowerCase().replace(" ", ""))}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("classroom")}</label>
                <select value={form.classId || ""} onChange={e => setForm(f => ({ ...f, classId: e.target.value ? parseInt(e.target.value) : null }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <option value="">-- {t("noClass")} --</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("gender")}</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <option value="Male">{t("male")}</option><option value="Female">{t("female")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Family */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-5">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
              {t("contactFamily")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ថ្ងៃខែឆ្នាំកំណើត (DOB)</label>
                <input type="date" value={(form as any).dob || ""} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">តួនាទីក្នុងថ្នាក់ (Class Role)</label>
                <select value={(form as any).classRole} onChange={e => setForm(f => ({ ...f, classRole: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <option value={t("member")}>{t("member")}</option>
                  <option value={t("president")}>{t("president")}</option>
                  <option value={t("vicePresident1")}>{t("vicePresident1")}</option>
                  <option value={t("vicePresident2")}>{t("vicePresident2")}</option>
                </select>
              </div>
              
              {/* Address Component */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-2">ទីកន្លែងកំណើត / អាសយដ្ឋានបច្ចុប្បន្ន</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <GeoDropdowns
                    selectedProvince={geoData.province}
                    selectedDistrict={geoData.district}
                    selectedCommune={geoData.commune}
                    selectedVillage={geoData.village}
                    onChange={(data) => {
                      setGeoData(data);
                      setForm(f => ({ ...f, address: JSON.stringify(data) }));
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("fatherName")}</label>
                <input value={(form as any).fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="ឈ្មោះឪពុក" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("motherName")}</label>
                <input value={(form as any).motherName} onChange={e => setForm(f => ({ ...f, motherName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="ឈ្មោះម្ដាយ" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("parentPhone")} / លេខទូរសព្ទអាណាព្យាបាល</label>
                <input value={form.parentPhone ?? ""} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value || null }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="012 345 678" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10 dark:bg-gray-900/50">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl hover:bg-white text-gray-700 transition-colors shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">{t("cancel")}</button>
          <button onClick={() => onSave(form)} className="px-8 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">{t("saveRecord")}</button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function StudentsPage() {
  const { token } = useAuth();
  const { t, lang } = useTranslation();
  const headers = { Authorization: `Bearer ${token}` };
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"studentId" | "nameEn" | "grade" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  
  const [modal, setModal] = useState<Student | null | "new">(null);
  const [disciplineModal, setDisciplineModal] = useState<Student | null>(null);
  const [idCardStudioStudents, setIdCardStudioStudents] = useState<Student[] | null>(null);

  const { data, refetch, isLoading, isError, error } = useListStudents(undefined, { request: { headers } });
  const { data: classroomsData } = useListClassrooms({ request: { headers } });
  const classrooms = classroomsData?.data || [];
  
  const { mutate: create } = useCreateStudent({ request: { headers } });
  const { mutate: update } = useUpdateStudent({ request: { headers } });
  const { mutate: remove } = useDeleteStudent({ request: { headers } });
  const { mutate: addDiscipline } = useCreateDisciplineLog({ request: { headers } });

  const students = data?.data || [];

  const filteredAndSorted = useMemo(() => {
    let result = [...students];
    // Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.studentId?.toLowerCase().includes(q) || 
        s.nameEn?.toLowerCase().includes(q) || 
        s.nameKh?.includes(q)
      );
    }
    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [students, search, sortField, sortDir]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleSave = (form: CreateStudentRequest) => {
    if (modal === "new") {
      create({ data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    } else if (modal) {
      update({ id: (modal as Student).id, data: form }, { onSuccess: () => { refetch(); setModal(null); } });
    }
  };

  const handleDisciplineSave = (form: CreateDisciplineLogRequest) => {
    addDiscipline({ data: form }, { onSuccess: () => { refetch(); setDisciplineModal(null); } });
  };

  if (isLoading) return <div className="py-20 text-center text-gray-500 font-bold">{t("loading")}</div>;
  if (isError) return <div className="py-20 text-center text-red-500 font-bold tracking-wide">Error Loading Data</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl flex items-center gap-2">
            <Users className="text-primary" /> {t("studentManagement")}
          </h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} {t("totalStudentsLabel")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t("searchStudents")}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              if (window.confirm(t("confirmDelete") + " " + t("allStudentsLabel") || "Delete all students?")) {
                students.forEach(s => remove({ id: s.id }));
                setTimeout(() => refetch(), 1000);
              }
            }} 
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all border border-red-200 shadow-sm active:scale-95"
          >
            <Trash2 size={18} /> {t("clearAll") || "Clear All"}
          </button>
          <button 
            onClick={() => setIdCardStudioStudents(filteredAndSorted)} 
            className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-all border border-purple-200 shadow-sm active:scale-95"
            disabled={filteredAndSorted.length === 0}
          >
            <IdCard size={18} /> {t("batchIdCards") || "Batch ID Cards"}
          </button>
          <label className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer">
            <FileSpreadsheet size={18} /> {t("importExcel")}
            <input type="file" className="hidden" accept=".xlsx,.xlsm" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              
              const reader = new FileReader();
              reader.onload = async (event) => {
                const buffer = event.target?.result as ArrayBuffer;
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                
                const worksheet = workbook.getWorksheet(1); // Usually first sheet
                if (!worksheet) return;

                const importedStudents: any[] = [];
                worksheet.eachRow((row, rowNumber) => {
                  if (rowNumber < 5) return; // Skip headers
                  
                  const values = row.values as any[];
                  const studentId = values[2]?.toString();
                  if (!studentId) return;

                  importedStudents.push({
                    studentId,
                    nameKh: values[3]?.toString() || "",
                    nameEn: values[3]?.toString() || "", // Using same for now
                    gender: values[4]?.toString() === "ស" ? "Female" : "Male",
                    dob: values[5] instanceof Date ? values[5].toISOString() : null,
                    address: [values[8], values[9], values[10], values[11]].filter(Boolean).join(", "),
                    fatherName: values[16]?.toString() || "",
                    fatherJob: values[17]?.toString() || "",
                    motherName: values[18]?.toString() || "",
                    motherJob: values[19]?.toString() || "",
                    phone: values[20]?.toString() || "",
                    classRole: values[22]?.toString() || t("member"),
                    grade: "Grade 10", // Default or detect from info sheet
                    enrollmentYear: new Date().getFullYear()
                  });
                });

                if (window.confirm(`${t("importExcel")}: ${importedStudents.length} students. Proceed?`)) {
                  for (const s of importedStudents) {
                    create({ data: s });
                  }
                  setTimeout(() => refetch(), 2000);
                }
              };
              reader.readAsArrayBuffer(file);
            }} />
          </label>
          <button onClick={() => setModal("new")} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md active:scale-95">
            <UserPlus size={18} /> {t("registerStudent")}
          </button>
        </div>
      </div>

      {/* Table Bento */}
      <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-primary/5 border-b-2 border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-extrabold text-primary cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => handleSort("studentId")}>
                  <div className="flex items-center gap-2">{t("studentId")} <ArrowUpDown size={14} className={sortField === "studentId" ? "text-blue-600" : "text-gray-400"} /></div>
                </th>
                <th className="text-left px-6 py-4 font-extrabold text-primary cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => handleSort("nameEn")}>
                  <div className="flex items-center gap-2">{t("fullName")} <ArrowUpDown size={14} className={sortField === "nameEn" ? "text-blue-600" : "text-gray-400"} /></div>
                </th>
                <th className="text-left px-6 py-4 font-extrabold text-primary cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => handleSort("grade")}>
                  <div className="flex items-center gap-2">{t("grade")} <ArrowUpDown size={14} className={sortField === "grade" ? "text-blue-600" : "text-gray-400"} /></div>
                </th>
                <th className="text-left px-6 py-4 font-extrabold text-primary">{t("discipline")}</th>
                <th className="px-6 py-4 text-right font-extrabold text-primary">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSorted.map(s => {
                const logsCount = (s as any).disciplineLogs?.length || 0;
                return (
                  <tr key={s.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-primary/70">{s.studentId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                          {s.photoUrl ? (
                            <img src={resolveUrl(s.photoUrl)} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                          ) : null}
                          <span className={`text-gray-400 font-bold text-sm ${s.photoUrl ? 'hidden' : ''}`}>{s.nameEn?.[0]?.toUpperCase() || "?"}</span>
                        </div>
                        <div>
                          <p className="font-bold text-primary">{s.nameKh}</p>
                          <p className="text-xs font-semibold text-gray-500">{s.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                        {t(s.grade.toLowerCase().replace(" ", ""))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {logsCount > 0 ? (
                        <span className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full w-max">
                          <AlertTriangle size={12} /> {logsCount} {t("records")}
                        </span>
                      ) : (
                        <span className="bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full w-max">
                          {t("cleanRecord")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setDisciplineModal(s)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200">
                          <AlertTriangle size={14} /> {t("addDiscipline")}
                        </button>
                        <button onClick={() => setIdCardStudioStudents([s])} className="p-2 bg-blue-50 text-blue-600 hover:text-primary hover:bg-blue-100 border rounded-lg transition-colors" title={t("printIdCard")}><IdCard size={16} /></button>
                        <button onClick={() => exportStudentProfileToExcel(s)} className="p-2 bg-green-50 text-green-600 hover:text-green-700 hover:bg-green-100 border rounded-lg transition-colors" title="ទាញយកប្រវត្តិរូប"><FileText size={16} /></button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button onClick={() => setModal(s)} className="p-2 bg-gray-50 text-gray-600 hover:text-primary hover:bg-blue-50 border rounded-lg transition-colors dark:bg-gray-900/50"><Pencil size={16} /></button>
                        <button onClick={() => { if (window.confirm(t("confirmDelete"))) remove({ id: s.id }, { onSuccess: () => refetch() }); }} className="p-2 bg-gray-50 text-gray-600 hover:text-red-600 hover:bg-red-50 border rounded-lg transition-colors dark:bg-gray-900/50"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 dark:bg-gray-900/50">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500 font-bold text-lg">{t("noRecordsFound")}</p>
                    <p className="text-gray-400 text-sm mt-1">{t("tryAdjustingSearch")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <StudentModal item={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} token={token} classrooms={classrooms} />}
      {disciplineModal && <DisciplineModal student={disciplineModal} onClose={() => setDisciplineModal(null)} onSave={handleDisciplineSave} />}
      {idCardStudioStudents && <StudentIdCardStudio students={idCardStudioStudents} onClose={() => setIdCardStudioStudents(null)} token={token} />}
    </div>
  );
}
