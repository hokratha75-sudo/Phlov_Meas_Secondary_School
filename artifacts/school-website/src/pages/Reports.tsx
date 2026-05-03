import { useI18n } from "@/lib/i18n";
import { Download, FileBarChart, Calendar, Eye } from "lucide-react";

export default function Reports() {
  const { t, lang } = useI18n();

  const reports = [
    {
      titleEn: "Annual School Performance Report 2023-2024",
      titleKh: "របាយការណ៍ប្រតិបត្តិការសាលាប្រចាំឆ្នាំ ២០២៣-២០២៤",
      dateEn: "July 2024", dateKh: "កក្កដា ២០២៤",
      typeEn: "Annual Report", typeKh: "របាយការណ៍ប្រចាំឆ្នាំ",
      pages: 48, available: true,
    },
    {
      titleEn: "Grade 12 National Exam Analysis 2024",
      titleKh: "ការវិភាគលទ្ធផលប្រឡងជាតិថ្នាក់ទី ១២ ឆ្នាំ ២០២៤",
      dateEn: "August 2024", dateKh: "សីហា ២០២៤",
      typeEn: "Exam Report", typeKh: "របាយការណ៍ប្រឡង",
      pages: 22, available: true,
    },
    {
      titleEn: "Teacher Professional Development Summary 2024",
      titleKh: "សង្ខេបការអភិវឌ្ឍវិជ្ជាជីវៈគ្រូ ២០២៤",
      dateEn: "June 2024", dateKh: "មិថុនា ២០២៤",
      typeEn: "HR Report", typeKh: "របាយការណ៍ HR",
      pages: 16, available: true,
    },
    {
      titleEn: "Student Enrollment & Attendance Report 2023-2024",
      titleKh: "របាយការណ៍ការចុះឈ្មោះ និងវត្តមានសិស្ស ២០២៣-២០២៤",
      dateEn: "May 2024", dateKh: "ឧសភា ២០២៤",
      typeEn: "Enrollment Report", typeKh: "របាយការណ៍ចុះឈ្មោះ",
      pages: 30, available: true,
    },
    {
      titleEn: "Infrastructure & Facilities Maintenance Report 2024",
      titleKh: "របាយការណ៍ថែទាំហេដ្ឋារចនាសម្ព័ន្ធ ២០២៤",
      dateEn: "September 2024", dateKh: "កញ្ញា ២០២៤",
      typeEn: "Facilities Report", typeKh: "របាយការណ៍ហេដ្ឋារចនាសម្ព័ន្ធ",
      pages: 12, available: false,
    },
    {
      titleEn: "Annual School Budget & Expenditure 2023-2024",
      titleKh: "ថវិកា និងការចំណាយប្រចាំឆ្នាំ ២០២៣-២០២៤",
      dateEn: "October 2024", dateKh: "តុលា ២០២៤",
      typeEn: "Financial Report", typeKh: "របាយការណ៍ហិរញ្ញវត្ថុ",
      pages: 20, available: false,
    },
  ];

  const TYPE_COLORS: Record<string, string> = {
    "Annual Report": "bg-blue-100 text-blue-700",
    "Exam Report": "bg-green-100 text-green-700",
    "HR Report": "bg-purple-100 text-purple-700",
    "Enrollment Report": "bg-amber-100 text-amber-700",
    "Facilities Report": "bg-teal-100 text-teal-700",
    "Financial Report": "bg-red-100 text-red-700",
  };

  return (
    <div className="w-full flex flex-col pb-20">
      <div className="bg-[#0d2550] pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-khmer">
            {t("School Reports", "របាយការណ៍សាលា")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("School Reports", "របាយការណ៍សាលា")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-12">
        <div className="flex items-center gap-3 mb-8">
          <FileBarChart className="text-secondary" size={28} />
          <h2 className="text-2xl font-bold text-[#0d2550] font-khmer">
            {t("Published Reports", "របាយការណ៍ដែលបានចេញផ្សាយ")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((r, i) => (
            <div key={i} className="bg-white border rounded-sm p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${TYPE_COLORS[r.typeEn] ?? "bg-gray-100 text-gray-600"}`}>
                    {lang === "kh" ? r.typeKh : r.typeEn}
                  </span>
                  <h3 className="font-bold text-[#0d2550] text-base leading-snug font-khmer">
                    {lang === "kh" ? r.titleKh : r.titleEn}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-sm flex items-center justify-center shrink-0 border">
                  <FileBarChart size={22} className="text-secondary" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Calendar size={12} /> {lang === "kh" ? r.dateKh : r.dateEn}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {r.pages} {t("pages", "ទំព័រ")}</span>
              </div>
              {r.available ? (
                <button className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1a3a6b] px-4 py-2 hover:bg-secondary transition-colors">
                  <Download size={14} />
                  {t("Download PDF", "ទាញយក PDF")}
                </button>
              ) : (
                <span className="flex items-center gap-2 text-sm text-gray-400 italic">
                  {t("Coming soon…", "នឹងចេញឆាប់ៗ…")}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-sm p-5 text-sm text-blue-800">
          <strong>{t("Transparency Notice:", "សេចក្ដីជូនដំណឹងអំពីតម្លាភាព:")}</strong>{" "}
          {t(
            "Treng Secondary School is committed to transparency. Reports are published in accordance with the Ministry of Education guidelines. For older reports or specific data requests, please contact the school administration.",
            "វិទ្យាល័យត្រែងប្តេជ្ញាចំពោះតម្លាភាព។ របាយការណ៍ត្រូវបានចេញផ្សាយស្របតាមគោលការណ៍ណែនាំរបស់ក្រសួងអប់រំ។ សម្រាប់របាយការណ៍ចាស់ ឬការស្នើសុំទិន្នន័យជាក់លាក់ សូមទំនាក់ទំនងការិយាល័យ។"
          )}
        </div>
      </div>
    </div>
  );
}
