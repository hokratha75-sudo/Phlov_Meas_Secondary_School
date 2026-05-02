import { useI18n } from "@/lib/i18n";
import { Music, Activity, BookOpen, Palette, Calendar, Users, Heart, Award, Monitor, Leaf } from "lucide-react";
import { SiFacebook } from "react-icons/si";

export default function Activities() {
  const { t } = useI18n();

  const clubs = [
    {
      title: t("Sports Club", "ក្លឹបកីឡា"),
      icon: <Activity size={26} />,
      color: "bg-blue-50 text-blue-700",
      desc: t("Football, volleyball, basketball and traditional Khmer sports competitions.", "បាល់ទាត់ បាល់ទះ បាល់បោះ និងការប្រកួតកីឡាប្រពៃណីខ្មែរ។"),
    },
    {
      title: t("Arts & Culture", "សិល្បៈ និងវប្បធម៌"),
      icon: <Palette size={26} />,
      color: "bg-pink-50 text-pink-700",
      desc: t("Traditional Khmer dance, drawing, painting and cultural heritage preservation.", "របាំប្រពៃណីខ្មែរ គំនូរ ការគូរ និងការអភិរក្សបេតិកភណ្ឌវប្បធម៌។"),
    },
    {
      title: t("Debate Club", "ក្លឹបជជែកដេញដោល"),
      icon: <BookOpen size={26} />,
      color: "bg-amber-50 text-amber-700",
      desc: t("Public speaking, critical thinking and leadership development activities.", "ការនិយាយជាសាធារណៈ ការគិតស៊ីជម្រៅ និងសកម្មភាពអភិវឌ្ឍភាពជាអ្នកដឹកនាំ។"),
    },
    {
      title: t("Music Band", "ក្រុមតន្ត្រី"),
      icon: <Music size={26} />,
      color: "bg-purple-50 text-purple-700",
      desc: t("Modern and traditional Khmer instrument training and school performances.", "ការបណ្តុះបណ្តាលឧបករណ៍តន្ត្រីទំនើប និងប្រពៃណីខ្មែរ និងការសម្តែងក្នុងសាលា។"),
    },
    {
      title: t("IT & Computer Club", "ក្លឹបព័ត៌មានវិទ្យា"),
      icon: <Monitor size={26} />,
      color: "bg-green-50 text-green-700",
      desc: t("Computer skills, programming basics, and digital literacy for the modern world.", "ជំនាញកុំព្យូទ័រ មូលដ្ឋានការសរសេរកូដ និងការប្រើប្រាស់បច្ចេកវិទ្យាឌីជីថល។"),
    },
    {
      title: t("Environment Club", "ក្លឹបបរិស្ថាន"),
      icon: <Leaf size={26} />,
      color: "bg-teal-50 text-teal-700",
      desc: t("Tree planting, school cleaning campaigns and environmental awareness.", "ការដាំដើមឈើ យុទ្ធនាការសំអាតសាលា និងការដឹងដល់បរិស្ថាន។"),
    },
  ];

  const activities = [
    {
      date: t("April 13–15, 2024", "១៣-១៥ មេសា ២០២៤"),
      tag: t("Festival", "ពិធីបុណ្យ"),
      tagColor: "bg-red-600",
      title: t("Khmer New Year Celebration 2024", "ខួបឆ្នាំថ្មីខ្មែរ ២០២៤"),
      desc: t(
        "Students and teachers celebrated Khmer New Year with traditional games, water festivals, Angkor Wat sand castle building, and cultural performances. The school courtyard was filled with joy and laughter as the entire school community came together.",
        "សិស្សានុសិស្ស និងគ្រូបង្រៀនបានប្រារព្ធពិធីបុណ្យឆ្នាំថ្មីខ្មែរ ជាមួយនឹងល្បែងប្រពៃណី ពិធីបោះទឹក ការសាងប្រាសាទខ្សាច់ និងការសម្តែងវប្បធម៌។ ទីធ្លាសាលាពោរពេញទៅដោយក្តីអំណរ និងសំណើច។"
      ),
      img: "/campus-hero.png",
      likes: 214,
      comments: 38,
    },
    {
      date: t("October 5, 2023", "០៥ តុលា ២០២៣"),
      tag: t("Celebration", "ខួបលើកទឹកចិត្ត"),
      tagColor: "bg-primary",
      title: t("Teacher's Day Celebration", "ខួបទិវាគ្រូ"),
      desc: t(
        "Students organized a heartfelt ceremony honoring all teachers at Sdao Sontepheap High School. Students performed traditional dances, gave flowers, and shared gratitude speeches. The event reflected the deep respect Cambodian students have for their educators.",
        "សិស្សានុសិស្សបានរៀបចំពិធីដ៏ស្មោះស្ងួតមួយ ដើម្បីអំណរគុណគ្រូបង្រៀនទាំងអស់នៅវិទ្យាល័យស្ដៅសន្តិភាព។ សិស្សបានសម្តែងរបាំប្រពៃណី ជូនផ្កា និងថ្លែងអំណរគុណ។"
      ),
      img: "/campus-gate.png",
      likes: 178,
      comments: 24,
    },
    {
      date: t("November 9, 2023", "០៩ វិច្ឆិកា ២០២៣"),
      tag: t("National Day", "ទិវាជាតិ"),
      tagColor: "bg-secondary",
      title: t("Independence Day Ceremony", "ពិធីប្រារព្ធទិវាឯករាជ្យ"),
      desc: t(
        "The school held a solemn flag-raising ceremony to mark Cambodia's 70th Independence Day. Students dressed in traditional Khmer outfits gathered in the school courtyard as principal and teachers delivered inspiring speeches about national pride and education.",
        "សាលាបានរៀបចំពិធីប្រារព្ធទិវាជាតិ ការលើកទង់ជាតិ ដើម្បីប្រារព្ធទិវាឯករាជ្យ។ សិស្សស្លៀកពាក់ខោអាវវប្បធម៌ខ្មែរ ប្រមូលផ្តុំគ្នានៅទីធ្លាសាលា។"
      ),
      img: "/campus-hero.png",
      likes: 132,
      comments: 17,
    },
    {
      date: t("February 2024", "កុម្ភៈ ២០២៤"),
      tag: t("Sports", "កីឡា"),
      tagColor: "bg-blue-600",
      title: t("Inter-School Football Tournament", "ការប្រកួតបាល់ទាត់អន្តរសាលា"),
      desc: t(
        "Our school's football team competed in the district inter-school tournament in Rotanak Mondol District. The team showed great sportsmanship and teamwork throughout the competition, making the entire school community proud.",
        "ក្រុមបាល់ទាត់របស់សាលារបស់យើងបានប្រកួតក្នុងការប្រកួតបាល់ទាត់អន្តរសាលានៅស្រុករតនៈមណ្ឌល ក្រុមបង្ហាញពីស្មារតីកីឡាដ៏ល្អ និងការងារជាក្រុម។"
      ),
      img: "/campus-gate.png",
      likes: 96,
      comments: 12,
    },
    {
      date: t("March 8, 2024", "០៨ មីនា ២០២៤"),
      tag: t("Community", "សហគមន៍"),
      tagColor: "bg-teal-600",
      title: t("School Clean-Up & Tree Planting Day", "ថ្ងៃសំអាតសាលា និងដាំដើមឈើ"),
      desc: t(
        "Students and teachers joined together for a school-wide environmental campaign. Over 100 trees were planted around the school grounds, and a thorough cleaning of classrooms and outdoor areas was conducted. A great display of community spirit!",
        "សិស្សានុសិស្ស និងគ្រូបង្រៀនបានចូលរួមជាមួយគ្នាសម្រាប់យុទ្ធនាការបរិស្ថានរបស់សាលា។ ដើមឈើជាង ១០០ ត្រូវបានដាំដុះជុំវិញទីដីសាលា។"
      ),
      img: "/campus-hero.png",
      likes: 153,
      comments: 29,
    },
    {
      date: t("June 2024", "មិថុនា ២០២៤"),
      tag: t("Academics", "ការសិក្សា"),
      tagColor: "bg-primary",
      title: t("National Exam Preparation Sessions", "វគ្គរៀបចំប្រឡងជាតិ"),
      desc: t(
        "Grade 12 students participated in intensive exam preparation classes led by dedicated teachers. The school organized extra study sessions and mock exams to ensure every student is well prepared for the national Baccalaureate examination.",
        "សិស្សថ្នាក់ទី ១២ បានចូលរួមក្នុងថ្នាក់រៀបចំប្រឡងអាក្រក់ ដែលដឹកនាំដោយគ្រូដែលស្ម័គ្រចិត្ត។ សាលាបានរៀបចំវគ្គសិក្សាបន្ថែម និងប្រឡងលំហាត់ ដើម្បីធានាថាសិស្សគ្រប់រូបរៀបចំល្អ។"
      ),
      img: "/campus-gate.png",
      likes: 201,
      comments: 45,
    },
  ];

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

        {/* Clubs Section */}
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
                  {club.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary mb-2">{club.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{club.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facebook-style Activity Feed */}
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
            {activities.map((activity, i) => (
              <div key={i} className="bg-white border rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className="relative overflow-hidden h-52">
                  <img
                    src={activity.img}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className={`absolute top-4 left-4 ${activity.tagColor} text-white text-xs font-bold px-3 py-1 uppercase tracking-wider`}>
                    {activity.tag}
                  </span>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm">
                    <Calendar size={14} />
                    <span>{activity.date}</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-primary mb-3 group-hover:text-secondary transition-colors font-khmer leading-snug">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {activity.desc}
                  </p>
                  <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Heart size={15} className="text-red-400" />
                      <span>{activity.likes} {t("likes", "ចូលចិត្ត")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={15} className="text-primary/60" />
                      <span>{activity.comments} {t("comments", "មតិ")}</span>
                    </div>
                    <a
                      href="https://www.facebook.com/highschool2k15"
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
              { img: "/campus-hero.png", label: t("School Campus", "បរិវេណសាលា") },
              { img: "/campus-gate.png", label: t("School Gate", "ច្រកទ្វារសាលា") },
              { img: "/campus-hero.png", label: t("Khmer New Year", "ឆ្នាំថ្មីខ្មែរ") },
              { img: "/campus-gate.png", label: t("Sports Day", "ថ្ងៃកីឡា") },
              { img: "/campus-hero.png", label: t("Teacher's Day", "ទិវាគ្រូ") },
              { img: "/campus-gate.png", label: t("Independence Day", "ទិវាឯករាជ្យ") },
            ].map((item, i) => (
              <div key={i} className="aspect-square overflow-hidden relative group cursor-pointer">
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <Award className="text-white" size={28} />
                  <span className="text-white font-bold text-sm tracking-wider text-center px-3">{item.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.facebook.com/highschool2k15"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white font-bold px-8 py-3 hover:bg-[#1565C0] transition-colors"
            >
              <SiFacebook size={20} />
              {t("See More Photos on Facebook", "មើលរូបថតបន្ថែមនៅ Facebook")}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
