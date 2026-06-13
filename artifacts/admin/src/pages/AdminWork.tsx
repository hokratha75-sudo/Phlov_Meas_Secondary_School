import { ClipboardList, CalendarDays, Users2, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const workItems = [
  { en: "Monthly staff schedule", kh: "កាលវិភាគបុគ្គលិកប្រចាំខែ" },
  { en: "Morning assembly duty", kh: "ភារកិច្ចគោរពទង់ជាតិពេលព្រឹក" },
  { en: "Parent meeting tracking", kh: "តាមដានកិច្ចប្រជុំមាតាបិតា" },
  { en: "Discipline and attendance log", kh: "កំណត់ហេតុវិន័យ និងវត្តមាន" },
];

export default function AdminWorkPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-xl text-primary">{t("adminWork")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("adminWorkSubtitle")}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workItems.map(item => (
          <div key={item.en} className="bg-white border rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <p className="font-semibold text-primary">{item.en}</p>
            <p className="text-xs text-gray-400 mt-1">{item.kh}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><CalendarDays className="text-blue-600" /><span className="text-sm text-gray-700">Duty roster and deadlines</span></div>
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><Users2 className="text-green-600" /><span className="text-sm text-gray-700">Staff assignment by role</span></div>
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><ShieldCheck className="text-amber-600" /><span className="text-sm text-gray-700">Compliance and incident notes</span></div>
      </div>
    </div>
  );
}