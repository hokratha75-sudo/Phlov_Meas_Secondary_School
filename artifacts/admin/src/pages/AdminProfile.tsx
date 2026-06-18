import { useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axiosConfig";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, ShieldCheck, Lock, Save, UserCheck } from "lucide-react";

export default function AdminProfile() {
  const { user } = useAuth();
  const { lang, t } = useTranslation();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast({ 
        title: lang === "km" ? "កំហុសលេខសម្ងាត់" : "Password Mismatch", 
        description: lang === "km" ? "លេខសម្ងាត់ថ្មី និងការបញ្ជាក់មិនស៊ីគ្នានោះទេ!" : "New password and confirmation do not match!", 
        variant: "destructive" 
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({ 
        title: lang === "km" ? "កំហុសលេខសម្ងាត់" : "Error", 
        description: lang === "km" ? "លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ" : "Password must be at least 6 characters", 
        variant: "destructive" 
      });
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put("/auth/me/password", { newPassword });
      toast({ 
        title: lang === "km" ? "ជោគជ័យ" : "Success", 
        description: lang === "km" ? "លេខសម្ងាត់ត្រូវបានផ្លាស់ប្ដូរដោយជោគជ័យ" : "Admin password updated successfully" 
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ 
        title: lang === "km" ? "បរាជ័យ" : "Error", 
        description: err.response?.data?.error || (lang === "km" ? "មានបញ្ហាក្នុងការប្តូរលេខសម្ងាត់" : "Failed to update password"), 
        variant: "destructive" 
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <UserCircle size={36} className="text-primary" /> 
          {lang === "km" ? "ប្រវត្តិរូបរដ្ឋបាល" : "Admin Profile"}
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">
          {lang === "km" ? "គណនីគ្រប់គ្រងប្រព័ន្ធ" : "System Administrator Account"}
        </p>
      </div>

      <div className="space-y-6">
        
        {/* ── 1. Admin Info ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <UserCheck size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              {lang === "km" ? "ព័ត៌មានគណនី" : "Account Information"}
            </h2>
          </div>
          <div className="p-6 bg-slate-50/30 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white ring-1 ring-gray-100 shrink-0 bg-primary flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-white uppercase">
                {user?.username?.[0] || 'A'}
              </span>
            </div>
            <div>
              <p className="font-black text-gray-400 uppercase tracking-wider text-[10px] mb-1">{lang === "km" ? "ឈ្មោះគណនី (Username)" : "Account Username"}</p>
              <h3 className="font-bold text-2xl text-primary mb-2">@{user?.username || "admin"}</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                <ShieldCheck size={14} />
                {lang === "km" ? "អ្នកគ្រប់គ្រងប្រព័ន្ធ (System Admin)" : "System Administrator"}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Account Security (Change Password) ── */}
        <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="border-b pb-3 flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              {lang === "km" ? "សុវត្ថិភាពគណនី (ផ្លាស់ប្ដូរលេខសម្ងាត់)" : "Account Security (Change Password)"}
            </h2>
          </div>

          <div className="bg-red-50/50 border border-dashed border-red-100 rounded-xl p-4 flex gap-3 text-xs text-red-700">
            <ShieldCheck size={18} className="shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">{lang === "km" ? "ការណែនាំអំពីសុវត្ថិភាព៖" : "Security Guideline:"}</p>
              <p className="mt-1 leading-relaxed">
                {lang === "km" 
                  ? "គណនីនេះមានសិទ្ធិគ្រប់គ្រងទិន្នន័យសាលាទាំងមូល។ សូមរក្សាទុកលេខសម្ងាត់ឱ្យបានរឹងមាំ និងមានសុវត្ថិភាពបំផុត។" 
                  : "This account has root access to all school data. Please ensure your password is very strong."
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {lang === "km" ? "លេខសម្ងាត់ថ្មី" : "New Password"}
              </label>
              <input 
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={passwordSaving || !newPassword}
              className="flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:opacity-90 transition-all disabled:opacity-60 hover:translate-y-[-1px] active:translate-y-0"
            >
              {passwordSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {passwordSaving 
                ? (lang === "km" ? "កំពុងរក្សាទុក..." : "Saving...") 
                : (lang === "km" ? "រក្សាទុកលេខសម្ងាត់" : "Update Password")
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
