import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { DatabaseBackup, Download, Server, HardDrive, Play, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

// Mock Data
const mockBackups = [
  { id: 1, filename: "backup_db_2026-06-17.sql", size: "14.2 MB", date: "2026-06-17 02:00:00", status: "success" },
  { id: 2, filename: "backup_db_2026-06-16.sql", size: "14.1 MB", date: "2026-06-16 02:00:00", status: "success" },
  { id: 3, filename: "backup_db_2026-06-15.sql", size: "0 MB", date: "2026-06-15 02:00:00", status: "failed" },
  { id: 4, filename: "backup_db_2026-06-14.sql", size: "13.9 MB", date: "2026-06-14 02:00:00", status: "success" },
];

export default function BackupRestorePage() {
  const { t, lang } = useTranslation();
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    // Simulate backup delay
    setTimeout(() => {
      setIsBackingUp(false);
      alert(lang === "km" ? "ការបម្រុងទុកបានជោគជ័យ!" : "Backup completed successfully!");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DatabaseBackup className="text-primary" size={24} />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {lang === "km" ? "បម្រុងទុក & ស្តារ (Backup & Restore)" : "Backup & Restore"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4 text-gray-800 dark:text-gray-100">
            <Server className="text-primary" size={20} />
            <h3 className="text-lg font-bold">{lang === "km" ? "ស្ថានភាពប្រព័ន្ធ" : "System Status"}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">{lang === "km" ? "ការបម្រុងទុកចុងក្រោយ" : "Last Successful Backup"}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">2026-06-17 02:00:00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">{lang === "km" ? "ទំហំផ្ទុកសរុប (Storage Used)" : "Storage Used"}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">14.2 MB</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">{lang === "km" ? "បម្រុងទុកស្វ័យប្រវត្តិ" : "Auto-Backup"}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">
                <CheckCircle2 size={12} /> {lang === "km" ? "បើក (ម៉ោង 2:00 ព្រឹក)" : "Enabled (2:00 AM)"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <HardDrive className="text-gray-400 mb-4" size={48} />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            {lang === "km" 
              ? "អ្នកអាចធ្វើការបម្រុងទុកទិន្នន័យប្រព័ន្ធទាំងមូលភ្លាមៗ ដើម្បីធានាសុវត្ថិភាពទិន្នន័យ។" 
              : "You can manually trigger a full system database backup immediately to ensure data safety."}
          </p>
          <button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className="w-full max-w-xs flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isBackingUp ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                {lang === "km" ? "កំពុងបម្រុងទុក..." : "Backing up..."}
              </>
            ) : (
              <>
                <Play size={20} />
                {lang === "km" ? "ចាប់ផ្តើមបម្រុងទុកឥឡូវនេះ" : "Start Backup Now"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold text-gray-800 dark:text-gray-200">
            {lang === "km" ? "ប្រវត្តិបម្រុងទុក (Backup History)" : "Backup History"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "ឈ្មោះឯកសារ" : "Filename"}</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "ទំហំ" : "Size"}</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "កាលបរិច្ឆេទ" : "Date"}</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "ស្ថានភាព" : "Status"}</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">{lang === "km" ? "សកម្មភាព" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {mockBackups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <DatabaseBackup size={16} className="text-gray-400" />
                    {backup.filename}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{backup.size}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{backup.date}</td>
                  <td className="px-6 py-4">
                    {backup.status === "success" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 size={12} /> {lang === "km" ? "ជោគជ័យ" : "Success"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle size={12} /> {lang === "km" ? "បរាជ័យ" : "Failed"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      disabled={backup.status !== "success"}
                      onClick={() => alert(`Downloading ${backup.filename}...`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Download size={16} />
                      {lang === "km" ? "ទាញយក" : "Download"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
