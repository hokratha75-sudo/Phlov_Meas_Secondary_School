import { useI18n } from "@/lib/i18n";
import { FileText, ClipboardList, Users, Building2, CalendarDays, Phone } from "lucide-react";

export default function AdminWork() {
  const { t, lang } = useI18n();

  const services = [
    { iconEl: <FileText size={28} className="text-secondary" />, titleEn: "Student Enrollment", titleKh: "ការចុះឈ្មោះសិស្ស", descEn: "New student registration, document verification and placement testing.", descKh: "ការចុះឈ្មោះសិស្សថ្មី ការផ្ទៀងផ្ទាត់ឯកសារ និងការធ្វើតេស្តប្រឡងចូល។" },
    { iconEl: <ClipboardList size={28} className="text-secondary" />, titleEn: "Certificates & Transcripts", titleKh: "សញ្ញាបត្រ និងលិខិតបញ្ជាក់", descEn: "Request for academic certificates, transcripts and official school letters.", descKh: "ការស្នើសុំសញ្ញាបត្រ ពិន្ទុ និងលិខិតផ្លូវការពីសាលា។" },
    { iconEl: <Users size={28} className="text-secondary" />, titleEn: "Teacher Affairs", titleKh: "កិច្ចការបុគ្គលិក", descEn: "Staff management, leave applications, payroll and professional development.", descKh: "ការគ្រប់គ្រងបុគ្គលិក ការស្នើសុំឈប់សំរាក ប្រាក់ខែ និងការអភិវឌ្ឍវិជ្ជាជីវៈ។" },
    { iconEl: <Building2 size={28} className="text-secondary" />, titleEn: "Facilities & Equipment", titleKh: "ហេដ្ឋារចនាសម្ព័ន្ធ", descEn: "Classroom assignments, equipment requests and facility maintenance schedules.", descKh: "ការចាត់ចែងបន្ទប់រៀន ការស្នើសុំសម្ភារៈ និងកាលវិភាគថែទាំ។" },
    { iconEl: <CalendarDays size={28} className="text-secondary" />, titleEn: "School Calendar", titleKh: "ប្រតិទិនសាលា", descEn: "Official academic calendar, exam schedules, and holiday announcements.", descKh: "ប្រតិទិនសិក្សាផ្លូវការ កាលវិភាគប្រឡង និងការប្រកាសសម្រាកបុណ្យ។" },
    { iconEl: <Phone size={28} className="text-secondary" />, titleEn: "Parent-School Communication", titleKh: "ទំនាក់ទំនង父母-សាលា", descEn: "Parent meetings, complaint handling and school-community relations.", descKh: "កិច្ចប្រជុំ父母 ការដោះស្រាយការ민complaint និងទំនាក់ទំនងសហគមន៍-សាលា។" },
  ];

  return (
    <div className="w-full flex flex-col pb-20">
      <div className="bg-[#0d2550] pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-khmer">
            {t("Administrative Work", "កិច្ចការរដ្ឋបាល")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("Administrative Work", "កិច្ចការរដ្ឋបាល")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold text-[#0d2550] mb-4 font-khmer">
            {t("Administrative Services", "សេវាកម្មរដ្ឋបាល")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t(
              "The school administration is responsible for managing all non-academic operations to ensure smooth and efficient school functioning. Find information about our key administrative functions below.",
              "ការិយាល័យរដ្ឋបាលសាលាមានការទទួលខុសត្រូវក្នុងការគ្រប់គ្រងប្រតិបត្តិការទាំងអស់ ដើម្បីធានាថាសាលារៀនដំណើរការបានរលូន។"
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {services.map((s, i) => (
            <div key={i} className="bg-white border rounded-sm p-6 hover:shadow-lg transition-all duration-300 hover:border-secondary/40 group">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {s.iconEl}
              </div>
              <h3 className="font-bold text-lg text-[#0d2550] mb-2 font-khmer">
                {lang === "kh" ? s.titleKh : s.titleEn}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {lang === "kh" ? s.descKh : s.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Office Hours */}
        <div className="bg-gray-50 border rounded-sm p-8 max-w-2xl mx-auto text-center mb-10">
          <h3 className="text-xl font-bold text-[#0d2550] mb-4 font-khmer">
            {t("Office Hours", "ម៉ោងធ្វើការ")}
          </h3>
          <div className="space-y-2 text-gray-700 text-sm">
            <p><strong>{t("Monday – Friday:", "ច័ន្ទ – សុក្រ:")}</strong> 7:00 AM – 5:00 PM</p>
            <p><strong>{t("Saturday:", "សៅរ៍:")}</strong> 7:00 AM – 11:30 AM</p>
            <p><strong>{t("Sunday & Public Holidays:", "អាទិត្យ & ថ្ងៃឈប់:")}</strong> {t("Closed", "បិទ")}</p>
          </div>
          <p className="mt-4 text-gray-500 text-sm">
            {t("For urgent matters, contact us at", "សម្រាប់ការជាក់ស្ដែង ទាក់ទងយើងតាម")} <strong>012 345 678</strong>
          </p>
        </div>

        {/* Admin Access Section */}
        <div className="bg-primary rounded-sm p-8 max-w-2xl mx-auto text-center shadow-xl">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-khmer">
            {t("Admin Portal Access", "ការចូលប្រើប្រាស់ផ្នែករដ្ឋបាល")}
          </h3>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            {t(
              "This section is restricted to school administrators and staff only. Authorized personnel can log in to manage school data, news, and student records.",
              "ផ្នែកនេះគឺសម្រាប់តែបុគ្គលិករដ្ឋបាល និងថ្នាក់ដឹកនាំសាលាប៉ុណ្ណោះ។ បុគ្គលិកដែលមានសិទ្ធិអាចចូលប្រើប្រាស់ដើម្បីគ្រប់គ្រងទិន្នន័យសាលា។"
            )}
          </p>
          <a 
            href="http://localhost:3001" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-secondary text-[#0d2550] px-8 py-3 rounded-md font-bold hover:bg-secondary/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {t("Log In to Dashboard", "ចូលទៅកាន់ប្រព័ន្ធគ្រប់គ្រង")}
          </a>
        </div>
      </div>
    </div>
  );
}
