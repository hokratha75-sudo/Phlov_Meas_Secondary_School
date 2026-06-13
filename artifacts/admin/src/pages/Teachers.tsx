import { useState } from "react";
import { useListTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, X, GraduationCap, Search, Phone, Mail, KeyRound, ShieldCheck, ShieldOff, FileSpreadsheet, FileText, Link2, Bot } from "lucide-react";
import type { Teacher, CreateTeacherRequest } from "@workspace/api-client-react";

import { exportTeachersListToExcel, exportTeacherProfileToExcel } from "@/utils/excelExport";

import ImageUpload from "@/components/ImageUpload";
import { GeoDropdowns } from "@/components/GeoDropdowns";
import { useTranslation } from "@/lib/i18n";
import api from "@/lib/axiosConfig";

// Extended form type to include login credentials
type TeacherForm = CreateTeacherRequest & {
  username?: string;
  password?: string;
  removeLogin?: boolean;
};

function TeacherModal({ item, onClose, onSave }: {
  item?: Teacher | null;
  onClose: () => void;
  onSave: (data: TeacherForm) => void;
}) {
  const { t } = useTranslation();
  const hasExistingLogin = !!(item as any)?.hasLoginAccount;

  const [form, setForm] = useState<TeacherForm>({
    nameEn: item?.nameEn ?? "",
    nameKh: item?.nameKh ?? "",
    subjectEn: item?.subjectEn ?? "",
    subjectKh: item?.subjectKh ?? "",
    photoUrl: item?.photoUrl ?? "",
    bioEn: item?.bioEn ?? "",
    bioKh: item?.bioKh ?? "",
    phone: item?.phone ?? "",
    email: item?.email ?? "",
    address: (item as any)?.address ?? "",
    username: (item as any)?.username ?? "",
    password: "",
    gender: item?.gender ?? "",
    dob: item?.dob ?? "",
    pob: item?.pob ?? "",
    officerId: item?.officerId ?? "",
    position: item?.position ?? "",
    educationLevel: item?.educationLevel ?? "",
    employmentDate: item?.employmentDate ?? "",
    framework: item?.framework ?? "",
    additionalSubjects: item?.additionalSubjects ?? "",
    additionalTeachingHours: item?.additionalTeachingHours ?? "",
    designatedTeachingHours: item?.designatedTeachingHours ?? "",
    remarks: item?.remarks ?? "",
    familyStatus: (item as any)?.familyStatus ?? "",
    degreeInfo: (item as any)?.degreeInfo ?? "",
    pedagogyInfo: (item as any)?.pedagogyInfo ?? "",
    trainingInfo: (item as any)?.trainingInfo ?? "",
    workExperience: (item as any)?.workExperience ?? "",
    teachingSkills: (item as any)?.teachingSkills ?? "",
    techSkills: (item as any)?.techSkills ?? "",
    languages: (item as any)?.languages ?? "",
  } as any);

  const [geoData, setGeoData] = useState(() => {
    try { return JSON.parse((item as any)?.address || "{}"); } catch { return {}; }
  });
  const [enableLogin, setEnableLogin] = useState(hasExistingLogin);
  const [removeLogin, setRemoveLogin] = useState(false);

  const set = (k: keyof TeacherForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value || null }));

  const handleSave = () => {
    const payload: TeacherForm = { ...form };
    if (!enableLogin || removeLogin) {
      payload.username = undefined;
      payload.password = undefined;
      payload.removeLogin = true;
    } else {
      payload.removeLogin = false;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg text-primary">{item ? t("editTeacher") : t("addTeacher")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-4 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("nameEn")}</label>
              <input value={form.nameEn ?? ""} onChange={set("nameEn")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("nameKh")}</label>
              <input value={form.nameKh ?? ""} onChange={set("nameKh")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("subjectEn")}</label>
              <input value={form.subjectEn ?? ""} onChange={set("subjectEn")}
                placeholder="e.g. Grade 7A"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("subjectKh")}</label>
              <input value={form.subjectKh ?? ""} onChange={set("subjectKh")}
                placeholder="ឧ. ថ្នាក់ទី៧A"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("phone")}</label>
              <input value={form.phone ?? ""} onChange={set("phone")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("email")}</label>
              <input value={form.email ?? ""} onChange={set("email")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ភេទ (Gender)</label>
              <select value={form.gender ?? ""} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <option value="">ជ្រើសរើស / Select</option>
                <option value="male">ប្រុស (Male)</option>
                <option value="female">ស្រី (Female)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ថ្ងៃខែឆ្នាំកំណើត (DOB)</label>
              <input type="date" value={form.dob ?? ""} onChange={set("dob")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">អត្តលេខមន្ត្រីរាជការ (Officer ID)</label>
              <input value={form.officerId ?? ""} onChange={set("officerId")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">តួនាទី / មុខតំណែង (Position)</label>
              <input value={form.position ?? ""} onChange={set("position")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">កម្រិតវប្បធម៌ (Education Level)</label>
              <input value={form.educationLevel ?? ""} onChange={set("educationLevel")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ថ្ងៃចូលបម្រើការងារ (Employment Date)</label>
              <input type="date" value={form.employmentDate ?? ""} onChange={set("employmentDate")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ក្របខ័ណ្ឌ (Framework)</label>
              <input value={form.framework ?? ""} onChange={set("framework")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">មុខវិជ្ជាបង្រៀនបន្ថែម</label>
              <input value={form.additionalSubjects ?? ""} onChange={set("additionalSubjects")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ម៉ោងបន្ថែមក្នុង១សប្ដាហ៍</label>
              <input type="number" value={form.additionalTeachingHours ?? ""} onChange={(e) => setForm(f => ({ ...f, additionalTeachingHours: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ម៉ោងកំណត់ក្នុង១សប្ដាហ៍</label>
              <input type="number" value={form.designatedTeachingHours ?? ""} onChange={(e) => setForm(f => ({ ...f, designatedTeachingHours: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ស្ថានភាពគ្រួសារ (Family Status)</label>
              <input value={(form as any).familyStatus ?? ""} onChange={set("familyStatus" as any)}
                placeholder="ឧ. នៅលីវ / មានគ្រួសារ"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">ផ្សេងៗ (Remarks)</label>
              <input value={form.remarks ?? ""} onChange={set("remarks")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4 mt-4">
            <h3 className="font-semibold text-primary text-md">២. កម្រិតវប្បធម៌ និងការអប់រំ</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 tracking-wider">បរិញ្ញាបត្រ/អនុបណ្ឌិត/បណ្ឌិត (ជំនាញ, សាកលវិទ្យាល័យ, ឆ្នាំបញ្ចប់)</label>
                <textarea value={(form as any).degreeInfo ?? ""} onChange={set("degreeInfo" as any)} rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 tracking-wider">សញ្ញាបត្រគរុកោសល្យ (វិទ្យាស្ថាន ឬមជ្ឈមណ្ឌលគរុកោសល្យ)</label>
                <textarea value={(form as any).pedagogyInfo ?? ""} onChange={set("pedagogyInfo" as any)} rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 tracking-wider">វគ្គបណ្តុះបណ្តាលបន្ថែម (វិញ្ញាបនបត្រផ្សេងៗ)</label>
                <textarea value={(form as any).trainingInfo ?? ""} onChange={set("trainingInfo" as any)} rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4 mt-4">
            <h3 className="font-semibold text-primary text-md">៣. បទពិសោធន៍ការងារ</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 tracking-wider">បទពិសោធន៍ការងារ (រៀបរាប់បញ្ច្រាសពីបច្ចុប្បន្នទៅអតីតកាល)</label>
                <textarea value={(form as any).workExperience ?? ""} onChange={set("workExperience" as any)} rows={3}
                  placeholder="ឧ. ២០២០-បច្ចុប្បន្ន៖ គ្រូបង្រៀនមុខវិជ្ជាគណិតវិទ្យា នៅអនុវិទ្យាល័យផ្លូវមាស"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4 mt-4">
            <h3 className="font-semibold text-primary text-md">៤. ជំនាញ និងចំណេះដឹងទូទៅ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 tracking-wider">ជំនាញបង្រៀន (Teaching Skills)</label>
                <textarea value={(form as any).teachingSkills ?? ""} onChange={set("teachingSkills" as any)} rows={3}
                  placeholder="ឧ. វិធីសាស្រ្តបង្រៀនបែបសកម្ម"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 tracking-wider">ជំនាញបច្ចេកវិទ្យា (Tech Skills)</label>
                <textarea value={(form as any).techSkills ?? ""} onChange={set("techSkills" as any)} rows={3}
                  placeholder="ឧ. Word, Excel, PowerPoint"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 tracking-wider">ភាសាបរទេស (Languages)</label>
                <textarea value={(form as any).languages ?? ""} onChange={set("languages" as any)} rows={3}
                  placeholder="ឧ. អង់គ្លេស: មធ្យម"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <ImageUpload
            label={t("photoUrl")}
            value={form.photoUrl ?? ""}
            onChange={(url) => setForm(f => ({ ...f, photoUrl: url }))}
          />

          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">{t("address") || "ទីកន្លែងកំណើត / អាសយដ្ឋាន"}</label>
            <div className="border border-gray-200 p-4 rounded-xl bg-gray-50/30 dark:bg-gray-900/50">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("bioEn")}</label>
              <textarea rows={3} value={form.bioEn ?? ""} onChange={set("bioEn")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t("bioKh")}</label>
              <textarea rows={3} value={form.bioKh ?? ""} onChange={set("bioKh")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* ══ Login Account Section ══ */}
          <div className="border border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-primary" />
                <span className="text-sm font-bold text-primary">
                  {hasExistingLogin ? "គណនី Login របស់គ្រូ" : "បង្កើតគណនី Login"}
                </span>
                {hasExistingLogin && !removeLogin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full border border-green-200">
                    <ShieldCheck size={11} /> មានគណនីហើយ
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (hasExistingLogin && enableLogin) {
                    // Toggle remove
                    setRemoveLogin(r => !r);
                  } else {
                    setEnableLogin(e => !e);
                  }
                }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  enableLogin && !removeLogin
                    ? "bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                    : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {enableLogin && !removeLogin ? (
                  <><ShieldCheck size={12} /> {hasExistingLogin ? "កែប្រែ" : "បើក"}</>
                ) : (
                  <><ShieldOff size={12} /> {hasExistingLogin ? "លុបចោល" : "បិទ"}</>
                )}
              </button>
            </div>

            {removeLogin && hasExistingLogin && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                ⚠️ គណនី Login របស់គ្រូបង្រៀននឹងត្រូវបានលុបចោល។ គ្រូនឹងមិនអាច login ចូលបានទៀតទេ។
              </div>
            )}

            {enableLogin && !removeLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    value={form.username ?? ""}
                    onChange={set("username")}
                    placeholder="ឧ. teacher_sok"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    {hasExistingLogin ? "លេខសំងាត់ថ្មី (ទុកទទេ = មិនផ្លាស់ប្ដូរ)" : "លេខសំងាត់"}
                  </label>
                  <input
                    type="password"
                    value={form.password ?? ""}
                    onChange={set("password")}
                    placeholder={hasExistingLogin ? "••••••• (optional)" : "••••••••"}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-900/50">{t("cancel")}</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90">{t("save")}</button>
        </div>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  const { token } = useAuth();
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Teacher | null | "new">(null);
  const [generatingLink, setGeneratingLink] = useState<number | null>(null);
  const [linkCodeResult, setLinkCodeResult] = useState<{ code: string; teacherName: string } | null>(null);

  const { data, refetch, isLoading, isError, error } = useListTeachers({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { mutate: create } = useCreateTeacher({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: update } = useUpdateTeacher({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const { mutate: remove } = useDeleteTeacher({ request: { headers: { Authorization: `Bearer ${token}` } } });

  if (isLoading) return <div className="py-20 text-center text-gray-500">{t("loading")}</div>;
  if (isError) return <div className="py-20 text-center text-red-500 font-semibold uppercase">{t("error")}: {(error as any)?.message || "Failed to load teachers"}</div>;

  const handleSave = (form: TeacherForm) => {
    const onError = (err: any) => {
      const msg = err?.message || "Failed to save teacher";
      alert(`❌ Error: ${msg}`);
    };
    if (modal === "new") {
      create(
        { data: form as any },
        { onSuccess: () => { refetch(); setModal(null); }, onError }
      );
    } else if (modal) {
      update(
        { id: (modal as Teacher).id, data: form as any },
        { onSuccess: () => { refetch(); setModal(null); }, onError }
      );
    }
  };

  const filtered = data?.data.filter(tData =>
    tData.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    tData.nameKh.includes(search) ||
    tData.subjectEn.toLowerCase().includes(search.toLowerCase()) ||
    tData.subjectKh.includes(search)
  ) ?? [];

  const handleGenerateLinkCode = async (teacherId: number) => {
    setGeneratingLink(teacherId);
    try {
      const res = await api.post(`/telegram/generate-link-code/${teacherId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.code) {
        setLinkCodeResult({ code: res.data.code, teacherName: res.data.teacherName });
      } else {
        alert('Failed to generate code');
      }
    } catch (err: any) {
      console.error('Generate link code error:', err);
      alert(err?.response?.data?.error || err.message || 'Failed to generate code');
    } finally {
      setGeneratingLink(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl flex items-center gap-2">
            <GraduationCap className="text-primary" /> {t("teacherManagement")}
          </h2>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} {t("totalStaff")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t("searchTeachers")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button onClick={() => exportTeachersListToExcel(filtered)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-md active:scale-95">
            <FileSpreadsheet size={18} /> ទាញយក Excel
          </button>
          <button onClick={() => setModal("new")} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md active:scale-95">
            <Plus size={18} /> {t("addTeacher")}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ប្រវត្តិរូប</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">អត្តលេខ & ក្របខ័ណ្ឌ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ឈ្មោះគ្រូបង្រៀន</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">មុខតំណែង & ឯកទេស</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("contact")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Login</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telegram</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map((tData) => (
                <tr key={tData.id} className="hover:bg-gray-50/50 dark:hover:bg-blue-900/20 transition-colors group dark:bg-gray-900/50">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
                      {tData.photoUrl ? (
                        <img src={tData.photoUrl} alt={tData.nameEn} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                          <GraduationCap size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-700 w-fit">
                        ID: {tData.officerId || "N/A"}
                      </span>
                      {tData.framework && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          ក្របខ័ណ្ឌ៖ <span className="text-primary dark:text-blue-400">{tData.framework}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-primary dark:text-blue-400 font-semibold">
                      {lang === "km" ? tData.nameKh : tData.nameEn}
                      {tData.gender === "male" && <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">(ប្រុស)</span>}
                      {tData.gender === "female" && <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">(ស្រី)</span>}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{lang === "km" ? tData.nameEn : tData.nameKh}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {tData.position || "គ្រូបង្រៀន"}
                    </div>
                    <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                      {lang === "km" ? tData.subjectKh : tData.subjectEn}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {tData.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Phone size={12} className="text-gray-400 dark:text-gray-500" /> {tData.phone}
                        </div>
                      )}
                      {tData.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Mail size={12} className="text-gray-400 dark:text-gray-500" /> {tData.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(tData as any).hasLoginAccount ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 font-medium">
                        <ShieldCheck size={12} />
                        {(tData as any).username}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">
                        <ShieldOff size={12} />
                        គ្មានគណនី
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {(tData as any).telegramChatId ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 font-medium">
                        <Bot size={12} /> ✅ ភ្ជាប់
                      </span>
                    ) : (
                      <button
                        onClick={() => handleGenerateLinkCode(tData.id)}
                        disabled={generatingLink === tData.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all cursor-pointer"
                      >
                        <Link2 size={12} />
                        {generatingLink === tData.id ? '...' : 'Link'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => exportTeacherProfileToExcel(tData)} title="ទាញយកប្រវត្តិរូប" className="p-2 text-gray-400 hover:text-green-600 border dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><FileText size={14} /></button>
                      <button onClick={() => setModal(tData)} className="p-2 text-gray-400 hover:text-primary border dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><Pencil size={14} /></button>
                      <button onClick={() => { if (window.confirm(t("confirmDelete"))) remove({ id: tData.id }, { onSuccess: () => refetch() }); }} className="p-2 text-gray-400 hover:text-red-600 border dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <TeacherModal item={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}

      {/* Link Code Modal */}
      {linkCodeResult && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setLinkCodeResult(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Link2 size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Link Code</h3>
            <p className="text-sm text-gray-500 mb-4">សម្រាប់ {linkCodeResult.teacherName}</p>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 mb-4">
              <p className="text-xl font-mono font-bold text-primary dark:text-blue-400 tracking-wider">{linkCodeResult.code}</p>
            </div>
            <p className="text-xs text-gray-400 mb-4">គ្រូត្រូវផ្ញើ <code className="bg-gray-100 px-1 rounded">/link {linkCodeResult.code}</code> ទៅ Bot</p>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(`/link ${linkCodeResult.code}`); }}
                className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-colors"
              >
                📋 Copy
              </button>
              <button onClick={() => setLinkCodeResult(null)} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors dark:bg-gray-900/50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
