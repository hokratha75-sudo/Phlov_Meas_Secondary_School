import { useI18n } from "@/lib/i18n";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useListNews } from "@workspace/api-client-react";

const STATIC_NEWS = [
  {
    id: 1,
    titleEn: "National High School Examination Results Announced",
    titleKh: "លទ្ធផលប្រឡងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិត្រូវបានប្រកាស",
    publishedAt: "2024-10-15T00:00:00Z",
    category: "exam",
    contentEn: "We are proud to announce that 95% of our students passed the national examination with flying colors. Congratulations to all students and teachers for their hard work.",
    contentKh: "យើងមានមោទនភាពសូមប្រកាសថាសិស្សរបស់យើង ៩៥% បានប្រឡងជាប់ថ្នាក់ជាតិដោយជោគជ័យ។ សូមអបអរសាទរដល់សិស្សានុសិស្ស និងលោកគ្រូអ្នកគ្រូទាំងអស់។",
    imageUrl: "/campus-hero.png",
  },
  {
    id: 2,
    titleEn: "Annual Science Fair Showcases Student Innovations",
    titleKh: "ពិព័រណ៍វិទ្យាសាស្ត្រប្រចាំឆ្នាំបង្ហាញពីការច្នៃប្រឌិតរបស់សិស្ស",
    publishedAt: "2024-09-28T00:00:00Z",
    category: "event",
    contentEn: "Over 50 projects were presented at this year's Science Fair, demonstrating our students' incredible talent in STEM fields.",
    contentKh: "គម្រោងជាង ៥០ ត្រូវបានបង្ហាញនៅក្នុងពិព័រណ៍វិទ្យាសាស្ត្រឆ្នាំនេះ ដែលបង្ហាញពីទេពកោសល្យដ៏អស្ចារ្យរបស់សិស្សយើងក្នុងវិស័យ STEM ។",
    imageUrl: "/campus-hero.png",
  },
  {
    id: 3,
    titleEn: "School Football Team Wins Provincial Championship",
    titleKh: "ក្រុមបាល់ទាត់សាលាឈ្នះជើងឯកថ្នាក់ខេត្ត",
    publishedAt: "2024-09-10T00:00:00Z",
    category: "general",
    contentEn: "Our school football team defeated the defending champions in a thrilling 2-1 final match to bring home the provincial trophy.",
    contentKh: "ក្រុមបាល់ទាត់សាលារបស់យើងបានយកឈ្នះម្ចាស់ការពារតំណែងជើងឯកក្នុងការប្រកួតវគ្គផ្តាច់ព្រ័ត្រ ២-១ ដ៏រំភើប។",
    imageUrl: "/campus-gate.png",
  },
  {
    id: 4,
    titleEn: "New Library Facilities Opened to Students",
    titleKh: "សម្ភារៈបណ្ណាល័យថ្មីបើកឲ្យសិស្សានុសិស្សប្រើប្រាស់",
    publishedAt: "2024-08-05T00:00:00Z",
    category: "announcement",
    contentEn: "The newly renovated library features over 5,000 new books, modern study pods, and high-speed internet access for research.",
    contentKh: "បណ្ណាល័យដែលទើបជួសជុលថ្មីមានសៀវភៅថ្មីជាង ៥០០០ ក្បាល កន្លែងសិក្សាទំនើប និងអ៊ីនធឺណិតល្បឿនលឿន។",
    imageUrl: "/campus-hero.png",
  },
];

function SkeletonCard() {
  return (
    <div className="border rounded-sm overflow-hidden bg-white flex flex-col animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-6 space-y-3 flex-1">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export default function News() {
  const { t, lang } = useI18n();
  const { data, isLoading } = useListNews({ limit: 12, offset: 0 });

  const newsItems = data?.data && data.data.length > 0 ? data.data : STATIC_NEWS;

  const getTitle = (item: { titleEn: string; titleKh: string }) =>
    lang === "kh" ? item.titleKh : item.titleEn;
  const getExcerpt = (item: { contentEn: string; contentKh: string }) =>
    lang === "kh" ? item.contentKh : item.contentEn;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === "kh" ? "km-KH" : "en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full flex flex-col pb-20">
      <div className="bg-primary pt-16 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-khmer">
            {t("Latest News", "ព័ត៌មានថ្មីៗ")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("News", "ព័ត៌មាន")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : newsItems.map((news) => (
              <div key={news.id} className="border rounded-sm overflow-hidden bg-white hover:shadow-xl transition-shadow group flex flex-col">
                <div className="aspect-video bg-gray-200 overflow-hidden relative">
                  <img
                    src={news.imageUrl || "/campus-hero.png"}
                    alt={getTitle(news)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm">
                    {t(news.category, news.category)}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar size={14} />
                    <span>{formatDate(news.publishedAt)}</span>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-primary transition-colors line-clamp-2 font-khmer">
                    {getTitle(news)}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {getExcerpt(news)}
                  </p>
                  <Link href="/news" className="text-primary font-semibold text-sm hover:text-secondary inline-flex items-center gap-1 mt-auto">
                    {t("Read Full Article", "អានអត្ថបទពេញ")} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
        </div>

        {!isLoading && (data?.total ?? 0) > 12 && (
          <div className="flex justify-center mt-16 gap-2">
            <button className="w-10 h-10 bg-primary text-white font-bold flex items-center justify-center rounded-sm">1</button>
            <button className="w-10 h-10 border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold flex items-center justify-center rounded-sm transition-colors">2</button>
            <button className="w-10 h-10 border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center rounded-sm transition-colors"><ArrowRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
