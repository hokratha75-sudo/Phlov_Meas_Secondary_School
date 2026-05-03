import { BarChart3, TrendingUp, FileBarChart, Users } from "lucide-react";

const reports = [
  { en: "Enrollment trend", kh: "និន្នាការចុះឈ្មោះ", value: "1,500+" },
  { en: "Attendance rate", kh: "អត្រាវត្តមាន", value: "96%" },
  { en: "Bac II pass rate", kh: "អត្រាជាប់ Bac II", value: "98%" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a6e]">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">School Reports</h2>
            <p className="text-sm text-gray-500 mt-1">Quick school reporting for Cambodian admin needs.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(report => (
          <div key={report.en} className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{report.en}</p>
            <p className="text-xs text-gray-400">{report.kh}</p>
            <p className="text-2xl font-bold text-[#1e3a6e] mt-3">{report.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-3"><TrendingUp className="text-green-600" /><span className="text-sm text-gray-700">Yearly comparison and growth view</span></div>
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-3"><FileBarChart className="text-blue-600" /><span className="text-sm text-gray-700">Export-friendly summary reports</span></div>
      </div>
      <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-3"><Users className="text-amber-600" /><span className="text-sm text-gray-700">Student, teacher, and class performance breakdown</span></div>
    </div>
  );
}