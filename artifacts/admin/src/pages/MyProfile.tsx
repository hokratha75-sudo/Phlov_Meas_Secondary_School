import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import api, { resolveUrl } from "@/lib/axiosConfig";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  Save, 
  ShieldCheck, 
  Info,
  Calendar,
  BookOpen,
  UserCheck
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { GeoDropdowns } from "@/components/GeoDropdowns";

interface TeacherProfile {
  id: number;
  nameEn: string;
  nameKh: string;
  subjectEn: string;
  subjectKh: string;
  photoUrl: string | null;
  bioEn: string | null;
  bioKh: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gender: string | null;
  dob: string | null;
  pob: string | null;
  officerId: string | null;
  position: string | null;
  educationLevel: string | null;
  employmentDate: string | null;
  username: string | null;
}

export default function MyProfile() {
  const { token, user } = useAuth();
  const { lang, t } = useTranslation();
  const { toast } = useToast();

  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setLocation] = useLocation();

  // Form states
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bioKh, setBioKh] = useState("");
  const [bioEn, setBioEn] = useState("");

  // Geo Address state
  const [geoData, setGeoData] = useState<any>({});

  // Password change states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      setLocation("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await api.get("/teachers/profile/self").then(res => res.data);
        setProfile(data);
        
        // Populate states
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setGender(data.gender || "");
        setDob(data.dob || "");
        setOfficerId(data.officerId || "");
        setEducationLevel(data.educationLevel || "");
        setPhotoUrl(data.photoUrl || "");
        setBioKh(data.bioKh || "");
        setBioEn(data.bioEn || "");
        
        try {
          if (data.address) {
            setGeoData(JSON.parse(data.address));
          }
        } catch {
          setGeoData({});
        }
      } catch (err: any) {
        console.error("Failed to load profile", err);
        toast({
          title: lang === "km" ? "បរាជ័យ" : "Error",
          description: lang === "km" ? "មិនអាចទាញយកទិន្នន័យប្រវត្តិរូបបានទេ" : "Failed to load profile details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, toast, lang]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast({
        title: lang === "km" ? "កំហុសលេខសម្ងាត់" : "Password Mismatch",
        description: lang === "km" ? "លេខសម្ងាត់ថ្មី និងការបញ្ជាក់មិនស៊ីគ្នានោះទេ!" : "New password and confirmation do not match!",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        phone: phone || null,
        email: email || null,
        gender: gender || null,
        dob: dob || null,
        officerId: officerId || null,
        educationLevel: educationLevel || null,
        photoUrl: photoUrl || null,
        bioKh: bioKh || null,
        bioEn: bioEn || null,
        address: Object.keys(geoData).length > 0 ? JSON.stringify(geoData) : null,
      };

      if (password) {
        payload.password = password;
      }

      const updated = await api.put("/teachers/profile/self", payload).then(res => res.data);

      setProfile(updated);
      setPassword("");
      setConfirmPassword("");

      toast({
        title: lang === "km" ? "រក្សាទុកជោគជ័យ" : "Save Success",
        description: lang === "km" ? "ប្រវត្តិរូប MoEYS របស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ។" : "Your MoEYS profile details saved successfully.",
      });
    } catch (err: any) {
      console.error("Failed to save profile", err);
      toast({
        title: lang === "km" ? "រក្សាទុកបរាជ័យ" : "Save Failed",
        description: err.message || (lang === "km" ? "មានបញ្ហាក្នុងការរក្សាទុកប្រវត្តិរូប" : "Failed to save profile changes"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("loading") || "កំពុងផ្ទុក..."}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center text-red-500 font-semibold uppercase">
        {lang === "km" ? "រកមិនឃើញគណនីគ្រូបង្រៀនឡើយ" : "Failed to load teacher profile"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <GraduationCap size={36} className="text-primary" /> 
          {lang === "km" ? "ប្រវត្តិរូបផ្ទាល់ខ្លួនរបស់ខ្ញុំ" : "My Professional Profile"}
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">
          {lang === "km" ? "ប្រព័ន្ធគ្រប់គ្រងព័ត៌មានគ្រូបង្រៀន MoEYS Standards" : "MoEYS Standard Civil Servant Profile"}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ── 1. Read-Only Administrative Info ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Info size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              {lang === "km" ? "ព័ត៌មានរដ្ឋបាល (បញ្ចូលដោយសាលា - Read Only)" : "Administrative Status (Managed by School)"}
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white ring-1 ring-gray-100 shrink-0 bg-blue-50/50 flex items-center justify-center">
                {photoUrl ? (
                  <img src={resolveUrl(photoUrl)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap size={28} className="text-blue-300" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary">{lang === "km" ? profile.nameKh : profile.nameEn}</h3>
                <p className="text-xs text-gray-400 font-medium">{lang === "km" ? profile.nameEn : profile.nameKh}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500">
              <div>
                <p className="font-black text-gray-400 uppercase tracking-wider text-[9px] mb-1">{lang === "km" ? "តួនាទីបច្ចុប្បន្ន" : "Current Position"}</p>
                <p className="font-bold text-gray-800 text-sm">{profile.position || (lang === "km" ? "គ្រូបង្រៀន" : "Teacher")}</p>
              </div>
              <div>
                <p className="font-black text-gray-400 uppercase tracking-wider text-[9px] mb-1">{lang === "km" ? "ឯកទេសបង្រៀន" : "Specialty"}</p>
                <p className="font-bold text-gray-800 text-sm">{lang === "km" ? profile.subjectKh : profile.subjectEn}</p>
              </div>
              <div>
                <p className="font-black text-gray-400 uppercase tracking-wider text-[9px] mb-1">{lang === "km" ? "ថ្ងៃចូលបម្រើការងារ" : "Employment Date"}</p>
                <p className="font-bold text-gray-800 text-sm">{profile.employmentDate || "N/A"}</p>
              </div>
              <div>
                <p className="font-black text-gray-400 uppercase tracking-wider text-[9px] mb-1">{lang === "km" ? "ឈ្មោះគណនី (Username)" : "Account Username"}</p>
                <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                  <UserCheck size={14} className="text-green-500" /> @{profile.username || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Editable MoEYS Personal Details ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="border-b pb-3 flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              {lang === "km" ? "ប្រវត្តិរូបផ្ទាល់ខ្លួន (ស្ដង់ដារក្រសួងអប់រំ)" : "Personal Profile (MoEYS Standard Fields)"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "អត្តលេខមន្ត្រីរាជការ (Civil Servant ID)" : "Officer / Civil Servant ID"}
              </label>
              <input 
                type="text"
                value={officerId}
                onChange={e => setOfficerId(e.target.value)}
                placeholder="ឧ. 1999120034"
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "ភេទ (Gender)" : "Gender"}
              </label>
              <select 
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none appearance-none"
              >
                <option value="">{lang === "km" ? "--- ជ្រើសរើសភេទ ---" : "--- Select Gender ---"}</option>
                <option value="male">{lang === "km" ? "ប្រុស (Male)" : "Male"}</option>
                <option value="female">{lang === "km" ? "ស្រី (Female)" : "Female"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)" : "Date of Birth"}
              </label>
              <input 
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "កម្រិតវប្បធម៌ / សញ្ញាបត្រខ្ពស់បំផុត" : "Highest Education / Degree"}
              </label>
              <input 
                type="text"
                value={educationLevel}
                onChange={e => setEducationLevel(e.target.value)}
                placeholder="ឧ. បរិញ្ញាបត្រអក្សរសាស្ត្រខ្មែរ"
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                <Phone size={12} className="inline mr-1" /> {lang === "km" ? "លេខទូរស័ព្ទ" : "Phone Number"}
              </label>
              <input 
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                <Mail size={12} className="inline mr-1" /> {lang === "km" ? "អ៊ីមែល" : "Email Address"}
              </label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <ImageUpload 
              label={lang === "km" ? "រូបថតប្រវត្តិរូបផ្ទាល់ខ្លួន (Photo Profile)" : "Upload Photo Profile"}
              value={photoUrl}
              onChange={url => setPhotoUrl(url)}
            />
          </div>

          {/* Current Address Geo Dropdowns */}
          <div className="pt-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3 ml-1">
              <MapPin size={12} className="inline mr-1" /> {lang === "km" ? "អាសយដ្ឋានបច្ចុប្បន្ន (ភូមិ/ឃុំ/ស្រុក/ខេត្ត)" : "Current Address Details"}
            </label>
            <div className="border border-slate-100 p-5 rounded-xl bg-slate-50/20">
              <GeoDropdowns
                selectedProvince={geoData.province}
                selectedDistrict={geoData.district}
                selectedCommune={geoData.commune}
                selectedVillage={geoData.village}
                onChange={(data) => {
                  setGeoData(data);
                }}
              />
            </div>
          </div>

          {/* Biographies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "ជីវប្រវត្តិសង្ខេប / ព័ត៌មានបន្ថែម (ភាសាខ្មែរ)" : "Biography (Khmer)"}
              </label>
              <textarea 
                rows={3}
                value={bioKh}
                onChange={e => setBioKh(e.target.value)}
                placeholder="ឧ. គរុកោសល្យ៖ គ្រូមធ្យមកម្រិតឧត្តម (UAP)..."
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "ជីវប្រវត្តិសង្ខេប (ភាសាអង់គ្លេស)" : "Biography (English)"}
              </label>
              <textarea 
                rows={3}
                value={bioEn}
                onChange={e => setBioEn(e.target.value)}
                placeholder="e.g. Pedagogy: High School Teacher Degree..."
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── 3. Account Security (Change Password) ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="border-b pb-3 flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              {lang === "km" ? "សុវត្ថិភាពគណនី (ផ្លាស់ប្ដូរលេខសម្ងាត់)" : "Account Security (Change Password)"}
            </h2>
          </div>

          <div className="bg-blue-50/30 border border-dashed border-blue-100 rounded-xl p-4 flex gap-3 text-xs text-blue-700">
            <ShieldCheck size={18} className="shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold">{lang === "km" ? "ការណែនាំអំពីសុវត្ថិភាព៖" : "Security Guideline:"}</p>
              <p className="mt-1 leading-relaxed">
                {lang === "km" 
                  ? "សូមរក្សាទុកលេខសម្ងាត់របស់អ្នកជាការសម្ងាត់ខ្ពស់បំផុត។ កុំប្រើលេខសម្ងាត់ងាយៗ ដូចជា 123456 ឬថ្ងៃខែកំណើតឡើយ ដើម្បីការពារសិស្សានុសិស្ស ឬអ្នកដទៃមិនឱ្យលួចចូលគណនីរបស់អ្នកកែប្រែពិន្ទុ ឬវត្តមាន។" 
                  : "Keep your password confidential. Avoid simple passwords like 123456 or your date of birth to prevent students or others from tampering with grades/attendance."
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "លេខសម្ងាត់ថ្មី (ទុកទទេ = មិនផ្លាស់ប្ដូរ)" : "New Password (Leave blank = Keep current)"}
              </label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "បញ្ជាក់លេខសម្ងាត់ថ្មី" : "Confirm New Password"}
              </label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── 4. Submit Action ── */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:opacity-90 transition-all disabled:opacity-60 hover:translate-y-[-1px] active:translate-y-0"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving 
              ? (lang === "km" ? "កំពុងរក្សាទុក..." : "Saving...") 
              : (lang === "km" ? "រក្សាទុកព័ត៌មានផ្ទាល់ខ្លួន" : "Save Profile Details")
            }
          </button>
        </div>

      </form>
    </div>
  );
}
