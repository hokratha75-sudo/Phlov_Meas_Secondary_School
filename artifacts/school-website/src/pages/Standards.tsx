import { useI18n } from "@/lib/i18n";
import { CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function Standards() {
  const { t, lang } = useI18n();

  const subjects = [
    { nameEn: "Khmer Literature", nameKh: "អក្សរសាស្ត្រខ្មែរ", coeff: 2, minScore: 30, totalScore: 60 },
    { nameEn: "Mathematics", nameKh: "គណិតវិទ្យា", coeff: 2, minScore: 30, totalScore: 60 },
    { nameEn: "Physics", nameKh: "រូបវិទ្យា", coeff: 1, minScore: 15, totalScore: 30 },
    { nameEn: "Chemistry", nameKh: "គីមីវិទ្យា", coeff: 1, minScore: 15, totalScore: 30 },
    { nameEn: "Biology", nameKh: "ជីវវិទ្យា", coeff: 1, minScore: 15, totalScore: 30 },
    { nameEn: "History", nameKh: "ប្រវត្តិវិទ្យា", coeff: 1, minScore: 15, totalScore: 30 },
    { nameEn: "Geography", nameKh: "ភូមិវិទ្យា", coeff: 1, minScore: 15, totalScore: 30 },
    { nameEn: "English", nameKh: "ភាសាអង់គ្លេស", coeff: 1, minScore: 15, totalScore: 30 },
  ];

  return (
    <div className="w-full flex flex-col pb-20">
      <div className="bg-[#0d2550] pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-khmer">
            {t("Bac II Standards", "ស្តង់ដារបាក់ឌុប")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("Bac II Standards", "ស្តង់ដារបាក់ឌុប")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-12">
        <div className="max-w-3xl mx-auto mb-12 bg-amber-50 border border-amber-200 rounded-sm p-5 flex gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <p className="text-amber-800 text-sm leading-relaxed">
            {t(
              "The Baccalaureate II (Grade 12 National Exam) standards are set by the Ministry of Education, Youth and Sport of Cambodia. Students must meet minimum score requirements in each subject to pass.",
              "ស្តង់ដារបាក់ឌុប (ប្រឡងជាតិថ្នាក់ទី ១២) ត្រូវបានកំណត់ដោយក្រសួងអប់រំ យុវជន និងកីឡា។ សិស្សត្រូវទទួលបានពិន្ទុអប្បបរមានៅក្នុងមុខវិជ្ជានីមួយៗ ដើម្បីប្រឡងជាប់។"
            )}
          </p>
        </div>

        {/* Grading Scale */}
        <h2 className="text-2xl font-bold text-[#0d2550] mb-6 font-khmer">
          {t("Grading Scale", "មាត្រដ្ឋានការវាយតម្លៃ")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { grade: "A", rangeEn: "90–100", rangeKh: "៩០–១០០", labelEn: "Excellent", labelKh: "ល្អប្រសើរ", color: "bg-green-100 border-green-400 text-green-800" },
            { grade: "B", rangeEn: "80–89", rangeKh: "៨០–៨៩", labelEn: "Very Good", labelKh: "ល្អ", color: "bg-blue-100 border-blue-400 text-blue-800" },
            { grade: "C", rangeEn: "70–79", rangeKh: "៧០–៧៩", labelEn: "Good", labelKh: "មធ្យម", color: "bg-yellow-100 border-yellow-400 text-yellow-800" },
            { grade: "D", rangeEn: "50–69", rangeKh: "៥០–៦៩", labelEn: "Pass", labelKh: "ជាប់", color: "bg-orange-100 border-orange-400 text-orange-800" },
          ].map((g, i) => (
            <div key={i} className={`border-2 rounded-sm p-5 text-center ${g.color}`}>
              <div className="text-4xl font-black mb-2">{g.grade}</div>
              <div className="text-lg font-bold mb-1">{lang === "kh" ? g.rangeKh : g.rangeEn}</div>
              <div className="text-sm font-medium">{lang === "kh" ? g.labelKh : g.labelEn}</div>
            </div>
          ))}
        </div>

        {/* Subject Requirements */}
        <h2 className="text-2xl font-bold text-[#0d2550] mb-6 font-khmer">
          {t("Subject Requirements (Science Track)", "តម្រូវការមុខវិជ្ជា (ផ្លូវវិទ្យាសាស្ត្រ)")}
        </h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-left border-collapse bg-white shadow-sm">
            <thead>
              <tr className="bg-[#1a3a6b] text-white">
                <th className="p-4 font-semibold">{t("Subject", "មុខវិជ្ជា")}</th>
                <th className="p-4 font-semibold text-center">{t("Coefficient", "មេគុណ")}</th>
                <th className="p-4 font-semibold text-center">{t("Total Score", "ពិន្ទុសរុប")}</th>
                <th className="p-4 font-semibold text-center">{t("Minimum to Pass", "ពិន្ទុអប្បបរមា")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{lang === "kh" ? s.nameKh : s.nameEn}</td>
                  <td className="p-4 text-center text-gray-600">{s.coeff}</td>
                  <td className="p-4 text-center text-gray-600">{s.totalScore}</td>
                  <td className="p-4 text-center">
                    <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">{s.minScore}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-sm p-5 flex gap-3">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-green-800 mb-1">{t("Overall Pass Requirement", "លក្ខខណ្ឌជាប់ទូទៅ")}</p>
            <p className="text-green-700 text-sm">
              {t(
                "Students must score a minimum of 50% of the total weighted score across all subjects. No subject may be scored at 0.",
                "សិស្សត្រូវតែទទួលបានពិន្ទុអប្បបរមា ៥០% នៃពិន្ទុសរុបគ្រប់មុខវិជ្ជា។ មិនអនុញ្ញាតឱ្យទទួលបានពិន្ទុ ០ ក្នុងមុខវិជ្ជាណាមួយឡើយ។"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
