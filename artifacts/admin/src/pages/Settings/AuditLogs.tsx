import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { History, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";

// Mock Data
const mockLogs = [
  { id: 1, user: "admin", action: "Login", details: "Logged into the system", ip: "192.168.1.1", timestamp: "2026-06-17 10:00:00" },
  { id: 2, user: "admin", action: "Create User", details: "Created teacher account 'sok_s'", ip: "192.168.1.1", timestamp: "2026-06-17 10:15:22" },
  { id: 3, user: "teacher_sok", action: "Update Grade", details: "Updated math grade for student #1024", ip: "10.0.0.5", timestamp: "2026-06-17 11:30:00" },
  { id: 4, user: "admin", action: "Backup", details: "Triggered manual system backup", ip: "192.168.1.1", timestamp: "2026-06-16 18:00:00" },
];

export default function AuditLogsPage() {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredLogs = mockLogs.filter(log => 
    log.user.toLowerCase().includes(search.toLowerCase()) || 
    log.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {lang === "km" ? "ប្រវត្តិការងារ (Audit Logs)" : "Audit Logs"}
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
          <Download size={18} />
          {lang === "km" ? "ទាញយក CSV" : "Export CSV"}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={lang === "km" ? "ស្វែងរកអ្នកប្រើប្រាស់ ឬសកម្មភាព..." : "Search user or action..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "អ្នកប្រើប្រាស់" : "User"}</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "សកម្មភាព" : "Action"}</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "ព័ត៌មានលម្អិត" : "Details"}</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">IP Address</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{lang === "km" ? "ថ្ងៃ-ម៉ោង" : "Timestamp"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{log.id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {log.user}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{log.details}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">{log.ip}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{log.timestamp}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {lang === "km" ? "មិនមានទិន្នន័យទេ" : "No records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {lang === "km" ? "បង្ហាញទំព័រ 1 នៃ 1" : "Showing page 1 of 1"}
          </span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border dark:border-gray-600 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50">
              <ChevronLeft size={18} />
            </button>
            <button className="p-1.5 border dark:border-gray-600 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
