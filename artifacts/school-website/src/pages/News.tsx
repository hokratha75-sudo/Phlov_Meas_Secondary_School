import { useI18n } from "@/lib/i18n";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function News() {
  const { t } = useI18n();

  const newsItems = [
    {
      id: 1,
      title: t("National High School Examination Results Announced", "លទ្ធផលប្រឡងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិត្រូវបានប្រកាស"),
      date: t("October 15, 2024", "១៥ តុលា ២០២៤"),
      category: t("Academics", "ការសិក្សា"),
      excerpt: t("We are proud to announce that 95% of our students passed the national examination with flying colors. Congratulations to all students and teachers for their hard work.", "យើងមានមោទនភាពសូមប្រកាសថាសិស្សរបស់យើង ៩៥% បានប្រឡងជាប់ថ្នាក់ជាតិដោយជោគជ័យ។ សូមអបអរសាទរដល់សិស្សានុសិស្ស និងលោកគ្រូអ្នកគ្រូទាំងអស់សម្រាប់ការខិតខំប្រឹងប្រែងរបស់ពួកគេ។")
    },
    {
      id: 2,
      title: t("Annual Science Fair Showcases Student Innovations", "ពិព័រណ៍វិទ្យាសាស្ត្រប្រចាំឆ្នាំបង្ហាញពីការច្នៃប្រឌិតរបស់សិស្ស"),
      date: t("September 28, 2024", "២៨ កញ្ញា ២០២៤"),
      category: t("Events", "ព្រឹត្តិការណ៍"),
      excerpt: t("Over 50 projects were presented at this year's Science Fair, demonstrating our students' incredible talent in STEM fields.", "គម្រោងជាង ៥០ ត្រូវបានបង្ហាញនៅក្នុងពិព័រណ៍វិទ្យាសាស្ត្រឆ្នាំនេះ ដែលបង្ហាញពីទេពកោសល្យដ៏អស្ចារ្យរបស់សិស្សយើងក្នុងវិស័យ STEM ។")
    },
    {
      id: 3,
      title: t("School Football Team Wins Provincial Championship", "ក្រុមបាល់ទាត់សាលាឈ្នះជើងឯកថ្នាក់ខេត្ត"),
      date: t("September 10, 2024", "១០ កញ្ញា ២០២៤"),
      category: t("Sports", "កីឡា"),
      excerpt: t("Our school football team defeated the defending champions in a thrilling 2-1 final match to bring home the provincial trophy.", "ក្រុមបាល់ទាត់សាលារបស់យើងបានយកឈ្នះម្ចាស់ការពារតំណែងជើងឯកក្នុងការប្រកួតវគ្គផ្តាច់ព្រ័ត្រ ២-១ ដ៏រំភើប ដើម្បីនាំយកពានរង្វាន់ថ្នាក់ខេត្តមកផ្ទះវិញ។")
    },
    {
      id: 4,
      title: t("New Library Facilities Opened to Students", "សម្ភារៈបណ្ណាល័យថ្មីបើកឲ្យសិស្សានុសិស្សប្រើប្រាស់"),
      date: t("August 05, 2024", "០៥ សីហា ២០២៤"),
      category: t("Campus", "សាលារៀន"),
      excerpt: t("The newly renovated library features over 5,000 new books, modern study pods, and high-speed internet access for research.", "បណ្ណាល័យដែលទើបជួសជុលថ្មីមានសៀវភៅថ្មីជាង ៥០០០ ក្បាល កន្លែងសិក្សាទំនើប និងអ៊ីនធឺណិតល្បឿនលឿនសម្រាប់ការស្រាវជ្រាវ។")
    }
  ];

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
          {newsItems.map((news) => (
            <div key={news.id} className="border rounded-sm overflow-hidden bg-white hover:shadow-xl transition-shadow group flex flex-col">
              <div className="aspect-video bg-gray-200 overflow-hidden relative">
                <img src="/hero.png" alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm">
                  {news.category}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar size={14} /> <span>{news.date}</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-primary transition-colors line-clamp-2 font-khmer">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                  {news.excerpt}
                </p>
                <Link href="#" className="text-primary font-semibold text-sm hover:text-secondary inline-flex items-center gap-1 mt-auto">
                  {t("Read Full Article", "អានអត្ថបទពេញ")} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination placeholder */}
        <div className="flex justify-center mt-16 gap-2">
          <button className="w-10 h-10 bg-primary text-white font-bold flex items-center justify-center rounded-sm">1</button>
          <button className="w-10 h-10 border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold flex items-center justify-center rounded-sm transition-colors">2</button>
          <button className="w-10 h-10 border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold flex items-center justify-center rounded-sm transition-colors">3</button>
          <button className="w-10 h-10 border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center rounded-sm transition-colors"><ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
