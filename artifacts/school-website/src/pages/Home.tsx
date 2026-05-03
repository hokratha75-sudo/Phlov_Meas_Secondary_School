import { useI18n } from "@/lib/i18n";
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, Calendar, MapPin, ClipboardList, BookMarked, PieChart, Mail } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListNews, useListActivities, useGetSiteSettings } from "@workspace/api-client-react";
import heroImage from "@assets/image_1777800214905.png";

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

function parseJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

export default function Home() {
  const { t, lang } = useI18n();
  const { data: newsData, isLoading: newsLoading } = useListNews({ limit: 2, offset: 0 });
  const { data: activitiesData } = useListActivities({ limit: 3, offset: 0 });
  const { data: settings } = useGetSiteSettings();

  const hero = parseJson(settings?.["hero"], {
    enrollmentBannerEn: "ENROLLMENT OPEN 2024-2025",
    enrollmentBannerKh: "បើកទទួលចុះឈ្មោះចូលរៀនឆ្នាំ ២០២៤-២០២៥",
    subtitleEn: "Empowering the next generation of Cambodian leaders through academic excellence, character development, and community engagement.",
    subtitleKh: "ពង្រឹងសមត្ថភាពអ្នកដឹកនាំកម្ពុជាជំនាន់ក្រោយ តាមរយៈឧត្តមភាពសិក្សា ការអភិវឌ្ឍន៍អត្តចរិត និងការចូលរួមក្នុងសង្គម។",
  });

  const stats = parseJson(settings?.["stats"], {
    studentsCount: "1,500+",
    teachersCount: "120+",
    programsCount: "15",
    yearsExcellence: "25+",
    graduationRate: "98%",
    commitmentLabel: "100%",
  });

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

  const quickInfo = [
    { icon: ClipboardList, titleEn: "Admissions", titleKh: "ការចុះឈ្មោះ", descEn: "Enrollment steps and required documents", descKh: "ជំហានចុះឈ្មោះ និងឯកសារចាំបាច់" },
    { icon: BookMarked, titleEn: "Academics", titleKh: "ការសិក្សា", descEn: "Subjects, class tracks and exam support", descKh: "មុខវិជ្ជា ថ្នាក់ និងជំនួយប្រឡង" },
    { icon: PieChart, titleEn: "Results", titleKh: "លទ្ធផល", descEn: "Bac II and annual performance summaries", descKh: "លទ្ធផល Bac II និងសេចក្តីសង្ខេបប្រចាំឆ្នាំ" },
    { icon: Mail, titleEn: "Contact", titleKh: "ទំនាក់ទំនង", descEn: "Phone, email and school office updates", descKh: "លេខទូរស័ព្ទ អ៊ីមែល និងព័ត៌មានការិយាល័យ" },
  ];

  return (
    <div className="w-full flex flex-col">
      <section className="bg-white pt-6 md:pt-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl min-h-[420px]">
              <img src={heroImage} alt="School banner" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b2a66]/85 via-[#0b2a66]/55 to-transparent" />
              <div className="relative z-10 p-6 md:p-10 flex flex-col justify-end h-full text-white">
                <span className="inline-flex w-fit items-center rounded-full bg-red-600 px-3 py-1 text-xs font-bold mb-4">
                  {lang === "kh" ? "ព័ត៌មានថ្មី" : "Latest Update"}
                </span>
                <h1 className="text-3xl md:text-5xl font-black leading-tight font-khmer max-w-2xl drop-shadow-lg">
                  {lang === "kh" ? hero.subtitleKh : hero.subtitleEn}
                </h1>
                <p className="mt-4 max-w-2xl text-white/90 text-sm md:text-base">
                  {lang === "kh" ? hero.enrollmentBannerKh : hero.enrollmentBannerEn}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button className="bg-secondary text-white hover:bg-secondary/90 rounded-full px-6">
                    {t("Learn More", "មើលបន្ថែម")}
                  </Button>
                  <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 rounded-full px-6">
                    {t("Apply Now", "ចុះឈ្មោះឥឡូវ")}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary font-khmer border-b pb-3">
                {t("Quick Information", "ព័ត៌មានរហ័ស")}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {quickInfo.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.titleEn} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1e3a6e] mb-4">
                        <Icon size={20} />
                      </div>
                      <p className="font-bold text-gray-800 font-khmer">{lang === "kh" ? item.titleKh : item.titleEn}</p>
                      <p className="text-xs text-gray-500 mt-1">{lang === "kh" ? item.descKh : item.descEn}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { titleEn: "Academic Excellence", titleKh: "ឧត្តមភាពសិក្សា", descEn: "Strong learning programs and disciplined support", descKh: "កម្មវិធីសិក្សាមាំមួន និងការគាំទ្រមានវិន័យ" },
              { titleEn: "Student Support", titleKh: "ការគាំទ្រសិស្ស", descEn: "Guidance, mentoring and school activities", descKh: "ការណែនាំ ការបង្រៀន និងសកម្មភាពសាលា" },
              { titleEn: "Cambodia Context", titleKh: "បរិបទកម្ពុជា", descEn: "Bac II readiness, civic values and community life", descKh: "ការត្រៀម Bac II តម្លៃពលរដ្ឋ និងជីវិតសហគមន៍" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border shadow-sm p-6">
                <p className="font-bold text-primary">{lang === "kh" ? item.titleKh : item.titleEn}</p>
                <p className="text-sm text-gray-600 mt-2">{lang === "kh" ? item.descKh : item.descEn}</p>
              </div>
            ))}
          </div>
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
                  "Treng Secondary School is committed to providing a holistic education that prepares students for the challenges of tomorrow.",
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
                  <h4 className="font-bold text-2xl mb-1">{stats.graduationRate}</h4>
                  <p className="text-sm opacity-80">{t("Graduation Rate", "អត្រាបញ្ចប់ការសិក្សា")}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-secondary p-6 text-white">
                  <h4 className="font-bold text-2xl mb-1">{stats.yearsExcellence}</h4>
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
              { icon: <Users size={36} className="text-secondary" />, val: stats.studentsCount, labelEn: "Students", labelKh: "សិស្សសរុប" },
              { icon: <GraduationCap size={36} className="text-secondary" />, val: stats.teachersCount, labelEn: "Teachers", labelKh: "គ្រូបង្រៀន" },
              { icon: <BookOpen size={36} className="text-secondary" />, val: stats.programsCount, labelEn: "Academic Programs", labelKh: "កម្មវិធីសិក្សា" },
              { icon: <Trophy size={36} className="text-secondary" />, val: stats.commitmentLabel, labelEn: "Commitment", labelKh: "ការប្តេជ្ញាចិត្ត" },
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
