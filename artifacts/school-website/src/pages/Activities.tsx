import { useI18n } from "@/lib/i18n";
import { Music, Activity, BookOpen, Palette, Calendar, Users, Heart, Award, Monitor, Leaf } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { useListActivities, useGetSiteSettings } from "@workspace/api-client-react";

function parseJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

type ClubEntry = { titleEn: string; titleKh: string; descEn: string; descKh: string; color: string };

const DEFAULT_CLUBS: ClubEntry[] = [
  { titleEn: "Sports Club", titleKh: "ក្លឹបកីឡា", descEn: "Football, volleyball, basketball and traditional Khmer sports competitions.", descKh: "បាល់ទាត់ បាល់ទះ បាល់បោះ និងការប្រកួតកីឡាប្រពៃណីខ្មែរ។", color: "bg-blue-50 text-blue-700" },
  { titleEn: "Arts & Culture", titleKh: "សិល្បៈ និងវប្បធម៌", descEn: "Traditional Khmer dance, drawing, painting and cultural heritage preservation.", descKh: "របាំប្រពៃណីខ្មែរ គំនូរ ការគូរ និងការអភិរក្សបេតិកភណ្ឌវប្បធម៌។", color: "bg-pink-50 text-pink-700" },
  { titleEn: "Debate Club", titleKh: "ក្លឹបជជែកដេញដោល", descEn: "Public speaking, critical thinking and leadership development activities.", descKh: "ការនិយាយជាសាធារណៈ ការគិតស៊ីជម្រៅ និងសកម្មភាពអភិវឌ្ឍភាពជាអ្នកដឹកនាំ។", color: "bg-amber-50 text-amber-700" },
  { titleEn: "Music Band", titleKh: "ក្រុមតន្ត្រី", descEn: "Modern and traditional Khmer instrument training and school performances.", descKh: "ការបណ្តុះបណ្តាលឧបករណ៍តន្ត្រីទំនើប និងប្រពៃណីខ្មែរ និងការសម្តែងក្នុងសាលា។", color: "bg-purple-50 text-purple-700" },
  { titleEn: "IT & Computer Club", titleKh: "ក្លឹបព័ត៌មានវិទ្យា", descEn: "Computer skills, programming basics, and digital literacy for the modern world.", descKh: "ជំនាញកុំព្យូទ័រ មូលដ្ឋានការសរសេរកូដ និងការប្រើប្រាស់បច្ចេកវិទ្យាឌីជីថល។", color: "bg-green-50 text-green-700" },
  { titleEn: "Environment Club", titleKh: "ក្លឹបបរិស្ថាន", descEn: "Tree planting, school cleaning campaigns and environmental awareness.", descKh: "ការដាំដើមឈើ យុទ្ធនាការសំអាតសាលា និងការដឹងដល់បរិស្ថាន។", color: "bg-teal-50 text-teal-700" },
];

const CLUB_ICONS = [
  <Activity size={26} />,
  <Palette size={26} />,
  <BookOpen size={26} />,
  <Music size={26} />,
  <Monitor size={26} />,
  <Leaf size={26} />,
];

const STATIC_ACTIVITIES = [
  {
    id: 1,
    titleEn: "Khmer New Year Celebration 2024", titleKh: "ខួបឆ្នាំថ្មីខ្មែរ ២០២៤",
    descriptionEn: "Students and teachers celebrated Khmer New Year with traditional games, water festivals, Angkor Wat sand castle building, and cultural performances.",
    descriptionKh: "សិស្សានុសិស្ស និងគ្រូបង្រៀនបានប្រារព្ធពិធីបុណ្យឆ្នាំថ្មីខ្មែរ ជាមួយនឹងល្បែងប្រពៃណី ពិធីបោះទឹក ការសាងប្រាសាទខ្សាច់ និងការសម្តែងវប្បធម៌។",
    eventDate: "April 13–15, 2024",
    category: "festival", imageUrl: "/campus-hero.png",
    likes: 214, commentsCount: 38,
  },
  {
    id: 2,
    titleEn: "Teacher's Day Celebration", titleKh: "ខួបទិវាគ្រូ",
    descriptionEn: "Students organized a heartfelt ceremony honoring all teachers at Treng Secondary School.",
    descriptionKh: "សិស្សានុសិស្សបានរៀបចំពិធីដ៏ស្មោះស្ងួតមួយ ដើម្បីអំណរគុណគ្រូបង្រៀនទាំងអស់នៅអនុវិទ្យាល័យត្រែង។",
    eventDate: "October 5, 2023",
    category: "national", imageUrl: "/campus-gate.png",
    likes: 178, commentsCount: 24,
  },
  {
    id: 3,
    titleEn: "Independence Day Ceremony", titleKh: "ពិធីប្រារព្ធទិវាឯករាជ្យ",
    descriptionEn: "The school held a solemn flag-raising ceremony to mark Cambodia's Independence Day.",
    descriptionKh: "សាលាបានរៀបចំពិធីប្រារព្ធទិវាជាតិ ការលើកទង់ជាតិ ដើម្បីប្រារព្ធទិវាឯករាជ្យ។",
    eventDate: "November 9, 2023",
    category: "national", imageUrl: "/campus-hero.png",
    likes: 132, commentsCount: 17,
  },
  {
    id: 4,
    titleEn: "Inter-School Football Tournament", titleKh: "ការប្រកួតបាល់ទាត់អន្តរសាលា",
    descriptionEn: "Our school's football team competed in the district inter-school tournament.",
    descriptionKh: "ក្រុមបាល់ទាត់របស់សាលារបស់យើងបានប្រកួតក្នុងការប្រកួតបាល់ទាត់អន្តរសាលា។",
    eventDate: "February 2024",
    category: "sports", imageUrl: "/campus-gate.png",
    likes: 96, commentsCount: 12,
  },
  {
    id: 5,
    titleEn: "School Clean-Up & Tree Planting Day", titleKh: "ថ្ងៃសំអាតសាលា និងដាំដើមឈើ",
    descriptionEn: "Students and teachers joined for a school-wide environmental campaign. Over 100 trees were planted.",
    descriptionKh: "សិស្សានុសិស្ស និងគ្រូបង្រៀនបានចូលរួមក្នុងយុទ្ធនាការបរិស្ថានរបស់សាលា។",
    eventDate: "March 8, 2024",
    category: "community", imageUrl: "/campus-hero.png",
    likes: 153, commentsCount: 29,
  },
  {
    id: 6,
    titleEn: "National Exam Preparation Sessions", titleKh: "វគ្គរៀបចំប្រឡងជាតិ",
    descriptionEn: "Grade 12 students participated in intensive exam preparation classes.",
    descriptionKh: "សិស្សថ្នាក់ទី ១២ បានចូលរួមក្នុងថ្នាក់រៀបចំប្រឡង។",
    eventDate: "June 2024",
    category: "academics", imageUrl: "/campus-gate.png",
    likes: 201, commentsCount: 45,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  festival: "bg-red-600", national: "bg-primary", sports: "bg-blue-600",
  culture: "bg-pink-600", academics: "bg-indigo-600", community: "bg-teal-600",
  general: "bg-gray-600",
};

function ActivitySkeleton() {
  return (
    <div className="bg-white border rounded-sm overflow-hidden animate-pulse flex flex-col">
      <div className="h-52 bg-gray-200" />
      <div className="p-6 space-y-3 flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export default function Activities() {
  const { t, lang } = useI18n();
  const { data, isLoading } = useListActivities({ limit: 6, offset: 0 });
  const { data: settings } = useGetSiteSettings({ query: { staleTime: 0, refetchOnMount: "always", refetchInterval: 3000 } });

  const clubs = parseJson<ClubEntry[]>(settings?.["clubs"], DEFAULT_CLUBS);
  const activityItems = data?.data && data.data.length > 0 ? data.data : STATIC_ACTIVITIES;

  const getTitle = (a: { titleEn: string; titleKh: string }) => lang === "kh" ? a.titleKh : a.titleEn;
  const getDesc = (a: { descriptionEn: string; descriptionKh: string }) => lang === "kh" ? a.descriptionKh : a.descriptionEn;

  return (
    <div className="w-full flex flex-col pb-20">
      {/* Page Header */}
      <div className="bg-primary pt-16 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-khmer">
            {t("Student Activities", "សកម្មភាពសិស្ស")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("Activities", "សកម្មភាព")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-16">

        {/* Clubs Section — live from settings */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-secondary font-bold tracking-wider text-sm uppercase mb-3">
              <span className="w-8 h-0.5 bg-secondary"></span>
              {t("School Clubs", "ក្លឹបសាលា")}
              <span className="w-8 h-0.5 bg-secondary"></span>
            </div>
            <h2 className="text-3xl font-bold text-primary font-khmer">
              {t("Clubs & Organizations", "ក្លឹប និងអង្គការ")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, i) => (
              <div key={i} className="bg-white border hover:shadow-lg transition-all duration-300 group p-6 flex gap-4 items-start">
                <div className={`w-14 h-14 shrink-0 ${club.color} flex items-center justify-center rounded-full group-hover:scale-110 transition-transform`}>
                  {CLUB_ICONS[i % CLUB_ICONS.length]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary mb-2">
                    {lang === "kh" ? club.titleKh : club.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {lang === "kh" ? club.descKh : club.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-secondary font-bold tracking-wider text-sm uppercase mb-3">
              <span className="w-8 h-0.5 bg-secondary"></span>
              {t("Recent Activities", "សកម្មភាពថ្មីៗ")}
              <span className="w-8 h-0.5 bg-secondary"></span>
            </div>
            <h2 className="text-3xl font-bold text-primary font-khmer">
              {t("School Events & News", "ព្រឹត្តិការណ៍ និងព័ត៌មានសាលា")}
            </h2>
            <p className="text-gray-500 mt-2 text-sm flex items-center justify-center gap-2">
              <SiFacebook className="text-[#1877F2]" size={16} />
              {t("Sourced from our official Facebook page", "ប្រភពមកពីផេក Facebook ផ្លូវការរបស់យើង")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)
              : activityItems.map((activity) => (
                <div key={activity.id} className="bg-white border rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                  <div className="relative overflow-hidden h-52">
                    <img
                      src={activity.imageUrl || "/campus-hero.png"}
                      alt={getTitle(activity)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className={`absolute top-4 left-4 ${CATEGORY_COLORS[activity.category] ?? "bg-gray-600"} text-white text-xs font-bold px-3 py-1 uppercase tracking-wider`}>
                      {t(activity.category, activity.category)}
                    </span>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm">
                      <Calendar size={14} />
                      <span>{activity.eventDate}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-primary mb-3 group-hover:text-secondary transition-colors font-khmer leading-snug">
                      {getTitle(activity)}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1">
                      {getDesc(activity)}
                    </p>
                    <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Heart size={15} className="text-red-400" />
                        <span>{activity.likes} {t("likes", "ចូលចិត្ត")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={15} className="text-primary/60" />
                        <span>{activity.commentsCount} {t("comments", "មតិ")}</span>
                      </div>
                      <a
                        href="https://www.facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1.5 text-[#1877F2] font-semibold hover:underline"
                      >
                        <SiFacebook size={14} />
                        {t("View on Facebook", "មើលនៅ Facebook")}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Photo Gallery */}
        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-secondary font-bold tracking-wider text-sm uppercase mb-3">
              <span className="w-8 h-0.5 bg-secondary"></span>
              {t("Gallery", "វិចិត្រសាល")}
              <span className="w-8 h-0.5 bg-secondary"></span>
            </div>
            <h2 className="text-3xl font-bold text-primary font-khmer">
              {t("Photo Gallery", "វិចិត្រសាលរូបថត")}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { img: "/campus-hero.png", labelEn: "School Campus", labelKh: "បរិវេណសាលា" },
              { img: "/campus-gate.png", labelEn: "School Gate", labelKh: "ច្រកទ្វារសាលា" },
              { img: "/campus-hero.png", labelEn: "Khmer New Year", labelKh: "ឆ្នាំថ្មីខ្មែរ" },
              { img: "/campus-gate.png", labelEn: "Sports Day", labelKh: "ថ្ងៃកីឡា" },
              { img: "/campus-hero.png", labelEn: "Teacher's Day", labelKh: "ទិវាគ្រូ" },
              { img: "/campus-gate.png", labelEn: "Independence Day", labelKh: "ទិវាឯករាជ្យ" },
            ].map((item, i) => (
              <div key={i} className="aspect-square overflow-hidden relative group cursor-pointer">
                <img src={item.img} alt={lang === "kh" ? item.labelKh : item.labelEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <Award className="text-white" size={28} />
                  <span className="text-white font-bold text-sm tracking-wider text-center px-3">
                    {lang === "kh" ? item.labelKh : item.labelEn}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white font-bold px-8 py-3 hover:bg-[#1565C0] transition-colors">
              <SiFacebook size={20} />
              {t("See More Photos on Facebook", "មើលរូបថតបន្ថែមនៅ Facebook")}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
