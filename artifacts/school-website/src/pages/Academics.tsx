import { useI18n } from "@/lib/i18n";
import { FlaskConical, Globe, Calculator, PenTool, Monitor, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSiteSettings } from "@workspace/api-client-react";

function parseJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

type ProgramEntry = { titleEn: string; titleKh: string; descEn: string; descKh: string };

const DEFAULT_PROGRAMS: ProgramEntry[] = [
  { titleEn: "Science Track", titleKh: "ថ្នាក់វិទ្យាសាស្ត្រពិត", descEn: "Intensive focus on Mathematics, Physics, Chemistry, and Biology.", descKh: "ផ្តោតសំខាន់លើគណិតវិទ្យា រូបវិទ្យា គីមីវិទ្យា និងជីវវិទ្យា។" },
  { titleEn: "Social Science Track", titleKh: "ថ្នាក់វិទ្យាសាស្ត្រសង្គម", descEn: "Emphasizes History, Geography, Literature, and Moral Civics.", descKh: "សង្កត់ធ្ងន់លើប្រវត្តិវិទ្យា ភូមិវិទ្យា អក្សរសាស្ត្រ និងសីលធម៌ពលរដ្ឋ។" },
  { titleEn: "Computer Science", titleKh: "វិទ្យាសាស្ត្រកុំព្យូទ័រ", descEn: "Modern IT skills, basic programming, and digital literacy.", descKh: "ជំនាញព័ត៌មានវិទ្យាទំនើប ការសរសេរកម្មវិធីមូលដ្ឋាន និងចំណេះដឹងឌីជីថល។" },
  { titleEn: "Languages", titleKh: "ភាសាបរទេស", descEn: "English and French language programs with native speakers.", descKh: "កម្មវិធីភាសាអង់គ្លេស និងបារាំងជាមួយអ្នកនិយាយដើម។" },
];

const PROGRAM_ICONS = [
  <FlaskConical size={32} className="text-secondary" />,
  <Globe size={32} className="text-secondary" />,
  <Monitor size={32} className="text-secondary" />,
  <PenTool size={32} className="text-secondary" />,
  <Calculator size={32} className="text-secondary" />,
  <BookOpen size={32} className="text-secondary" />,
];

export default function Academics() {
  const { t, lang } = useI18n();
  const { data: settings } = useGetSiteSettings({});
  const programs = parseJson<ProgramEntry[]>(settings?.["academic_programs"], DEFAULT_PROGRAMS);

  return (
    <div className="w-full flex flex-col pb-20">
      <div className="bg-primary pt-16 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-khmer">
            {t("Academic Programs", "កម្មវិធីសិក្សា")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("Academics", "ការសិក្សា")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-6 font-khmer">
            {t("Excellence in Education", "ឧត្តមភាពនៃការអប់រំ")}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {t(
              "Our academic programs strictly follow the Ministry of Education, Youth and Sport's national curriculum while integrating modern teaching methodologies to ensure our students achieve their highest potential.",
              "កម្មវិធីសិក្សារបស់យើងអនុវត្តយ៉ាងតឹងរ៉ឹងតាមកម្មវិធីសិក្សាជាតិរបស់ក្រសួងអប់រំ យុវជន និងកីឡា ខណៈពេលដែលរួមបញ្ចូលនូវវិធីសាស្ត្របង្រៀនទំនើប ដើម្បីធានាថាសិស្សរបស់យើងសម្រេចបាននូវសក្តានុពលខ្ពស់បំផុតរបស់ពួកគេ។"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {programs.map((prog, i) => (
            <div key={i} className="border p-8 hover:shadow-lg transition-all duration-300 hover:border-secondary/50 group bg-white">
              <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-full mb-6 group-hover:scale-110 transition-transform">
                {PROGRAM_ICONS[i % PROGRAM_ICONS.length]}
              </div>
              <h3 className="text-xl font-bold text-primary mb-3 font-khmer">
                {lang === "kh" ? prog.titleKh : prog.titleEn}
              </h3>
              <p className="text-gray-600">
                {lang === "kh" ? prog.descKh : prog.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Schedule Section */}
        <div className="bg-gray-50 p-8 md:p-12 border rounded-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-4 font-khmer">
              {t("Class Schedule Overview", "ទិដ្ឋភាពទូទៅនៃកាលវិភាគថ្នាក់")}
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto"></div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 font-semibold">{t("Time", "ម៉ោង")}</th>
                  <th className="p-4 font-semibold">{t("Monday - Wednesday", "ច័ន្ទ - ពុធ")}</th>
                  <th className="p-4 font-semibold">{t("Thursday - Friday", "ព្រហស្បតិ៍ - សុក្រ")}</th>
                  <th className="p-4 font-semibold">{t("Saturday", "សៅរ៍")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">07:00 AM - 11:00 AM</td>
                  <td className="p-4 text-gray-600">{t("Core Subjects", "មុខវិជ្ជាស្នូល")}</td>
                  <td className="p-4 text-gray-600">{t("Core Subjects", "មុខវិជ្ជាស្នូល")}</td>
                  <td className="p-4 text-gray-600">{t("Extra Classes", "ថ្នាក់បំប៉ន")}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">11:00 AM - 01:00 PM</td>
                  <td className="p-4 text-gray-500 italic text-center" colSpan={3}>{t("Lunch Break", "សម្រាកអាហារថ្ងៃត្រង់")}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">01:00 PM - 05:00 PM</td>
                  <td className="p-4 text-gray-600">{t("Specialized Subjects", "មុខវិជ្ជាឯកទេស")}</td>
                  <td className="p-4 text-gray-600">{t("Labs / Physical Ed.", "មន្ទីរពិសោធន៍ / កីឡា")}</td>
                  <td className="p-4 text-gray-600">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 text-center">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 rounded-none">
              {t("Download Full Academic Calendar", "ទាញយកប្រតិទិនសិក្សាពេញលេញ")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
