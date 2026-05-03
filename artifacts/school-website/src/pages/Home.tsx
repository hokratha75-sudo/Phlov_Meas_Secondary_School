import { useI18n } from "@/lib/i18n";
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListNews, useListActivities } from "@workspace/api-client-react";

const STATIC_NEWS = [
  {
    id: 1,
    titleEn: "National High School Examination Results Announced",
    titleKh: "លទ្ធផលប្រឡងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិត្រូវបានប្រកាស",
    publishedAt: "2024-10-15T00:00:00Z",
    category: "exam",
    contentEn: "We are proud to announce that 95% of our students passed the national examination with flying colors.",
    contentKh: "យើងមានមោទនភាពសូមប្រកាសថាសិស្សរបស់យើង ៩៥% បានប្រឡងជាប់ថ្នាក់ជាតិដោយជោគជ័យ។",
    imageUrl: "/campus-hero.png",
  },
  {
    id: 2,
    titleEn: "Annual Science Fair Showcases Student Innovations",
    titleKh: "ពិព័រណ៍វិទ្យាសាស្ត្រប្រចាំឆ្នាំបង្ហាញពីការច្នៃប្រឌិតរបស់សិស្ស",
    publishedAt: "2024-09-28T00:00:00Z",
    category: "event",
    contentEn: "Over 50 projects were presented at this year's Science Fair, demonstrating incredible STEM talent.",
    contentKh: "គម្រោងជាង ៥០ ត្រូវបានបង្ហាញ ដែលបង្ហាញពីទេពកោសល្យដ៏អស្ចារ្យ។",
    imageUrl: "/campus-hero.png",
  },
];

const STATIC_EVENTS = [
  { monthEn: "NOV", monthKh: "វិច្ឆិកា", day: 9, titleEn: "Independence Day Ceremony", titleKh: "ពិធីប្រារព្ធទិវាឯករាជ្យ", locationEn: "School Courtyard", locationKh: "ទីធ្លាសាលា" },
  { monthEn: "DEC", monthKh: "ធ្នូ", day: 15, titleEn: "Year-End Cultural Show", titleKh: "ការសម្តែងវប្បធម៌ចុងឆ្នាំ", locationEn: "Main Hall", locationKh: "សាលធំ" },
  { monthEn: "JAN", monthKh: "មករា", day: 7, titleEn: "National Children's Day", titleKh: "ទិវាជាតិកុមារ", locationEn: "School Grounds", locationKh: "ទីធ្លាសាលា" },
];

export default function Home() {
  const { t, lang } = useI18n();
  const { data: newsData, isLoading: newsLoading } = useListNews({ limit: 2, offset: 0 });
  const { data: activitiesData } = useListActivities({ limit: 3, offset: 0 });

  const newsItems = newsData?.data && newsData.data.length > 0 ? newsData.data : STATIC_NEWS;
  const events = activitiesData?.data && activitiesData.data.length > 0
    ? activitiesData.data.slice(0, 3).map((a, i) => ({
        monthEn: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        monthKh: new Date(a.createdAt).toLocaleDateString("km-KH", { month: "short" }),
        day: new Date(a.createdAt).getDate() || (i + 10),
        titleEn: a.titleEn, titleKh: a.titleKh,
        locationEn: a.eventDate, locationKh: a.eventDate,
      }))
    : STATIC_EVENTS;

  const getNewsTitle = (item: { titleEn: string; titleKh: string }) => lang === "kh" ? item.titleKh : item.titleEn;
  const getNewsExcerpt = (item: { contentEn: string; contentKh: string }) => lang === "kh" ? item.contentKh : item.contentEn;
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === "kh" ? "km-KH" : "en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch { return dateStr; }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/campus-hero.png" alt="School Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center text-white mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="inline-block py-1 px-3 rounded-full bg-secondary/90 text-sm font-bold tracking-widest mb-6 backdrop-blur-sm">
            {t("ENROLLMENT OPEN 2024-2025", "បើកទទួលចុះឈ្មោះចូលរៀនឆ្នាំ ២០២៤-២០២៥")}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-khmer leading-tight drop-shadow-lg">
            {t("Welcome to", "សូមស្វាគមន៍មកកាន់")} <br />
            <span className="text-white">{t("Treng Junior High School", "អនុវិទ្យាល័យត្រែង")}</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-white/90 drop-shadow-md">
            {t(
              "Empowering the next generation of Cambodian leaders through academic excellence, character development, and community engagement.",
              "ពង្រឹងសមត្ថភាពអ្នកដឹកនាំកម្ពុជាជំនាន់ក្រោយ តាមរយៈឧត្តមភាពសិក្សា ការអភិវឌ្ឍន៍អត្តចរិត និងការចូលរួមក្នុងសង្គម។"
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold h-14 px-8 text-lg w-full sm:w-auto rounded-none">
              {t("Discover Our Programs", "ស្វែងយល់ពីកម្មវិធីរបស់យើង")}
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm font-bold h-14 px-8 text-lg w-full sm:w-auto rounded-none">
              {t("Contact Admissions", "ទំនាក់ទំនងចុះឈ្មោះ")}
            </Button>
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="bg-white border-b border-gray-200 shadow-sm relative z-20 -mt-8 mx-4 md:mx-8 xl:mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {[
            { icon: <BookOpen className="text-primary" size={24} />, bg: "bg-primary/10", titleEn: "Academic Excellence", titleKh: "ឧត្តមភាពសិក្សា", descEn: "Rigorous curriculum for future success", descKh: "កម្មវិធីសិក្សាច្បាស់លាស់សម្រាប់ភាពជោគជ័យ" },
            { icon: <Users className="text-secondary" size={24} />, bg: "bg-secondary/10", titleEn: "Expert Teachers", titleKh: "គ្រូបង្រៀនជំនាញ", descEn: "Dedicated and highly qualified staff", descKh: "មានការលះបង់ និងមានលក្ខណៈសម្បត្តិគ្រប់គ្រាន់" },
            { icon: <Trophy className="text-primary" size={24} />, bg: "bg-primary/10", titleEn: "Student Life", titleKh: "ជីវិតសិស្ស", descEn: "Clubs, sports and community events", descKh: "ក្លឹប កីឡា និងព្រឹត្តិការណ៍សហគមន៍" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 ${item.bg} rounded-full flex items-center justify-center shrink-0`}>{item.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900">{lang === "kh" ? item.titleKh : item.titleEn}</h3>
                <p className="text-sm text-gray-500">{lang === "kh" ? item.descKh : item.descEn}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 text-secondary font-bold tracking-wider text-sm uppercase">
                <span className="w-8 h-0.5 bg-secondary"></span>
                {t("About Us", "អំពីយើង")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-khmer">
                {t("Building a Foundation for Lifelong Learning", "កសាងមូលដ្ឋានគ្រឹះសម្រាប់ការរៀនសូត្រពេញមួយជីវិត")}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t(
                  "Treng Junior High School is committed to providing a holistic education that prepares students for the challenges of tomorrow.",
                  "អនុវិទ្យាល័យត្រែង ប្តេជ្ញាផ្តល់ការអប់រំដ៏ទូលំទូលាយដែលរៀបចំសិស្សសម្រាប់បញ្ហាប្រឈមនៃថ្ងៃស្អែក។"
                )}
              </p>
              <ul className="space-y-3">
                {[
                  [t("State-of-the-art learning facilities", "សម្ភារៈសិក្សាទំនើប")],
                  [t("Comprehensive science and computer labs", "មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រ និងកុំព្យូទ័រ")],
                  [t("Dedicated counseling and career guidance", "ការប្រឹក្សាយោបល់ និងការណែនាំអាជីព")],
                ].map(([item], i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <span className="text-secondary text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/about" className="inline-flex items-center gap-2 font-bold text-primary hover:text-secondary transition-colors mt-4">
                {t("Read Our Full Story", "អានប្រវត្តិរបស់យើង")} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <img src="/campus-hero.png" alt="Students" className="w-full h-48 md:h-64 object-cover" />
                <div className="bg-primary p-6 text-white">
                  <h4 className="font-bold text-2xl mb-1">98%</h4>
                  <p className="text-sm opacity-80">{t("Graduation Rate", "អត្រាបញ្ចប់ការសិក្សា")}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-secondary p-6 text-white">
                  <h4 className="font-bold text-2xl mb-1">25+</h4>
                  <p className="text-sm opacity-80">{t("Years of Excellence", "ឆ្នាំនៃឧត្តមភាព")}</p>
                </div>
                <img src="/campus-gate.png" alt="Campus Gate" className="w-full h-48 md:h-64 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live News & Events */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Live News */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8 border-b pb-4">
                <h2 className="text-3xl font-bold text-primary font-khmer">
                  {t("Latest News", "ព័ត៌មានថ្មីៗ")}
                </h2>
                <Link href="/news" className="text-secondary font-semibold hover:underline hidden sm:block">
                  {t("View All News", "មើលព័ត៌មានទាំងអស់")}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsLoading
                  ? [0, 1].map(i => (
                    <div key={i} className="border rounded-sm overflow-hidden animate-pulse">
                      <div className="aspect-[16/9] bg-gray-200" />
                      <div className="p-6 space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-5 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  ))
                  : newsItems.map((item) => (
                    <div key={item.id} className="group border rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="aspect-[16/9] bg-gray-200 overflow-hidden relative">
                        <img src={item.imageUrl || "/campus-hero.png"} alt={getNewsTitle(item)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 uppercase">
                          {item.category}
                        </div>
                      </div>
                      <div className="p-6 bg-white">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar size={14} />
                          <span>{formatDate(item.publishedAt)}</span>
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-primary transition-colors line-clamp-2 font-khmer">
                          {getNewsTitle(item)}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {getNewsExcerpt(item)}
                        </p>
                        <Link href="/news" className="text-primary font-semibold text-sm hover:text-secondary inline-flex items-center gap-1">
                          {t("Read More", "អានបន្ថែម")} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-8 border-b pb-4">
                <h2 className="text-3xl font-bold text-primary font-khmer">
                  {t("Upcoming Events", "ព្រឹត្តិការណ៍បន្ទាប់")}
                </h2>
              </div>
              <div className="space-y-6">
                {events.map((ev, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="w-16 h-16 shrink-0 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white group-hover:border-secondary transition-colors">
                      <span className="text-xs font-bold uppercase">{lang === "kh" ? ev.monthKh : ev.monthEn}</span>
                      <span className="text-xl font-black">{ev.day}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-secondary transition-colors mb-1 line-clamp-2">
                        {lang === "kh" ? ev.titleKh : ev.titleEn}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={12} />
                        <span>{lang === "kh" ? ev.locationKh : ev.locationEn}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/activities">
                <Button variant="outline" className="w-full mt-8 border-primary text-primary hover:bg-primary hover:text-white rounded-none">
                  {t("All Events Calendar", "ប្រតិទិនព្រឹត្តិការណ៍ទាំងអស់")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16 relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
            {[
              { icon: <Users size={36} className="text-secondary" />, val: "1,500+", labelEn: "Students", labelKh: "សិស្សសរុប" },
              { icon: <GraduationCap size={36} className="text-secondary" />, val: "120+", labelEn: "Teachers", labelKh: "គ្រូបង្រៀន" },
              { icon: <BookOpen size={36} className="text-secondary" />, val: "15", labelEn: "Academic Programs", labelKh: "កម្មវិធីសិក្សា" },
              { icon: <Trophy size={36} className="text-secondary" />, val: "100%", labelEn: "Commitment", labelKh: "ការប្តេជ្ញាចិត្ត" },
            ].map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-center mb-4">{s.icon}</div>
                <h3 className="text-4xl md:text-5xl font-black">{s.val}</h3>
                <p className="text-white/80 font-medium uppercase tracking-wider text-sm">{lang === "kh" ? s.labelKh : s.labelEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
