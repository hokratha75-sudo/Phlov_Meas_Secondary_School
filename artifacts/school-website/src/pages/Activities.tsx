import { useI18n } from "@/lib/i18n";
import { Music, Activity, BookOpen, Palette } from "lucide-react";

export default function Activities() {
  const { t } = useI18n();

  const clubs = [
    {
      title: t("Sports Club", "ក្លឹបកីឡា"),
      icon: <Activity size={24} />,
      desc: t("Football, Volleyball, Basketball and traditional sports.", "បាល់ទាត់ បាល់ទះ បាល់បោះ និងកីឡាប្រពៃណី។")
    },
    {
      title: t("Arts & Culture", "សិល្បៈ និងវប្បធម៌"),
      icon: <Palette size={24} />,
      desc: t("Traditional dance, drawing, and cultural preservation.", "របាំប្រពៃណី គំនូរ និងការអភិរក្សវប្បធម៌។")
    },
    {
      title: t("Debate Club", "ក្លឹបជជែកដេញដោល"),
      icon: <BookOpen size={24} />,
      desc: t("Public speaking and critical thinking development.", "ការនិយាយជាសាធារណៈ និងការអភិវឌ្ឍការគិតស៊ីជម្រៅ។")
    },
    {
      title: t("Music Band", "ក្រុមតន្ត្រី"),
      icon: <Music size={24} />,
      desc: t("Modern and traditional instrument training.", "ការបណ្តុះបណ្តាលឧបករណ៍តន្ត្រីទំនើប និងប្រពៃណី។")
    }
  ];

  return (
    <div className="w-full flex flex-col pb-20">
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
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primary mb-8 font-khmer text-center">
            {t("Clubs & Organizations", "ក្លឹប និងអង្គការ")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubs.map((club, i) => (
              <div key={i} className="bg-white border p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 mx-auto bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                  {club.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{club.title}</h3>
                <p className="text-sm text-gray-600">{club.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-4 font-khmer">
              {t("Events Gallery", "វិចិត្រសាលព្រឹត្តិការណ៍")}
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gallery Placeholders */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 overflow-hidden relative group">
                <img src="/activity1.png" alt={`Gallery Image ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-bold tracking-wider">{t("View Photo", "មើលរូបថត")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
