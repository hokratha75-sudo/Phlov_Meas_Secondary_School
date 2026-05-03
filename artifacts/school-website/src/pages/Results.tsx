import { useI18n } from "@/lib/i18n";
import { Trophy, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

export default function Results() {
  const { t, lang } = useI18n();

  const years = [
    { year: "2023-2024", passed: 312, total: 328, rate: "95.1%", grade12: 98, grade11: 214 },
    { year: "2022-2023", passed: 298, total: 315, rate: "94.6%", grade12: 92, grade11: 206 },
    { year: "2021-2022", passed: 281, total: 302, rate: "93.0%", grade12: 87, grade11: 194 },
  ];

  return (
    <div className="w-full flex flex-col pb-20">
      <div className="bg-[#0d2550] pt-12 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-khmer">
            {t("General Academic Results", "លទ្ធផលសិក្សាទូទៅ")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("General Results", "លទ្ធផលសិក្សាទូទៅ")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
          {[
            { icon: <GraduationCap size={32} className="text-secondary" />, val: "95.1%", labelEn: "Pass Rate 2024", labelKh: "អត្រាជាប់ ២០២៤" },
            { icon: <Trophy size={32} className="text-secondary" />, val: "312", labelEn: "Students Passed", labelKh: "សិស្សបានជាប់" },
            { icon: <BookOpen size={32} className="text-secondary" />, val: "3", labelEn: "Academic Tracks", labelKh: "ផ្លូវវិជ្ជា" },
            { icon: <TrendingUp size={32} className="text-secondary" />, val: "↑2.1%", labelEn: "Year-on-Year Growth", labelKh: "កំណើនឆ្នាំនឹងឆ្នាំ" },
          ].map((s, i) => (
            <div key={i} className="bg-white border rounded-sm p-6 text-center shadow-sm">
              <div className="flex justify-center mb-3">{s.icon}</div>
              <div className="text-3xl font-black text-[#0d2550] mb-1">{s.val}</div>
              <div className="text-sm text-gray-500 font-medium">{lang === "kh" ? s.labelKh : s.labelEn}</div>
            </div>
          ))}
        </div>

        {/* Results Table */}
        <h2 className="text-2xl font-bold text-[#0d2550] mb-6 font-khmer">
          {t("Yearly Results Summary", "សង្ខេបលទ្ធផលប្រចាំឆ្នាំ")}
        </h2>
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-left border-collapse bg-white shadow-sm">
            <thead>
              <tr className="bg-[#1a3a6b] text-white">
                <th className="p-4 font-semibold">{t("Academic Year", "ឆ្នាំសិក្សា")}</th>
                <th className="p-4 font-semibold">{t("Total Students", "សិស្សសរុប")}</th>
                <th className="p-4 font-semibold">{t("Passed", "បានជាប់")}</th>
                <th className="p-4 font-semibold">{t("Pass Rate", "អត្រាជាប់")}</th>
                <th className="p-4 font-semibold">{t("Grade 12", "ថ្នាក់ទី ១២")}</th>
                <th className="p-4 font-semibold">{t("Grade 11", "ថ្នាក់ទី ១១")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {years.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-[#0d2550]">{row.year}</td>
                  <td className="p-4 text-gray-700">{row.total}</td>
                  <td className="p-4 text-gray-700">{row.passed}</td>
                  <td className="p-4"><span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">{row.rate}</span></td>
                  <td className="p-4 text-gray-700">{row.grade12}</td>
                  <td className="p-4 text-gray-700">{row.grade11}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-sm p-6 text-blue-800 text-sm">
          <strong>{t("Note:", "សម្គាល់:")}</strong>{" "}
          {t(
            "Results are certified by the Ministry of Education, Youth and Sport. Detailed grade-level breakdowns are available upon request from the school administration.",
            "លទ្ធផលត្រូវបានបញ្ជាក់ដោយក្រសួងអប់រំ យុវជន និងកីឡា។ ព័ត៌មានលម្អិតតាមថ្នាក់អាចស្នើសុំបានពីការិយាល័យសាលា។"
          )}
        </div>
      </div>
    </div>
  );
}
