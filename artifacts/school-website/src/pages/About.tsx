import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

export default function About() {
  const { t } = useI18n();

  return (
    <div className="w-full flex flex-col pb-20">
      {/* Page Header */}
      <div className="bg-primary pt-16 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-khmer">
            {t("About Us", "អំពីយើង")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("About", "អំពីយើង")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6 font-khmer">
              {t("Our History & Legacy", "ប្រវត្តិសាស្រ្តរបស់យើង")}
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
              <p>
                {t(
                  "Treng Secondary School has been a beacon of educational excellence in the community. Born from a vision of community leaders who believed in the power of education to transform lives, our school has grown into a comprehensive educational institution.",
                  "អនុវិទ្យាល័យត្រែង គឺជាបង្គោលភ្លើងនៃឧត្តមភាពអប់រំនៅក្នុងសហគមន៍។ កើតចេញពីចក្ខុវិស័យរបស់មេដឹកនាំសហគមន៍ដែលជឿជាក់លើថាមពលនៃការអប់រំក្នុងការផ្លាស់ប្តូរជីវិត សាលារបស់យើងបានរីកចម្រើនដល់ស្ថាប័នអប់រំដ៏ទូលំទូលាយមួយ។"
                )}
              </p>
              <p>
                {t(
                  "Over the decades, we have continuously adapted our curriculum and facilities to meet the changing needs of our society, ensuring our graduates are well-equipped for university and professional careers.",
                  "ក្នុងរយៈពេលជាច្រើនទសវត្សរ៍កន្លងមកនេះ យើងបានបន្តកែសម្រួលកម្មវិធីសិក្សា និងបរិក្ខាររបស់យើង ដើម្បីបំពេញតម្រូវការដែលផ្លាស់ប្តូរនៃសង្គមរបស់យើង ដោយធានាថាអ្នកបញ្ចប់ការសិក្សារបស់យើងត្រូវបានបំពាក់យ៉ាងល្អសម្រាប់អាជីពនៅសាកលវិទ្យាល័យ និងវិជ្ជាជីវៈ។"
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="/campus-hero.png" alt="School Campus" className="w-full h-64 object-cover rounded-sm shadow-md" />
            <img src="/campus-gate.png" alt="School Gate" className="w-full h-64 object-cover rounded-sm shadow-md translate-y-8" />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24">
          <div className="bg-gray-50 p-10 border-t-4 border-primary shadow-sm">
            <h3 className="text-2xl font-bold text-primary mb-4 font-khmer">
              {t("Our Mission", "បេសកកម្មរបស់យើង")}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {t(
                "To provide high-quality education that empowers students with knowledge, critical thinking skills, and moral values necessary to become responsible citizens and leaders in a rapidly changing world.",
                "ដើម្បីផ្តល់នូវការអប់រំប្រកបដោយគុណភាពខ្ពស់ ដែលផ្តល់អំណាចដល់សិស្សានុសិស្សនូវចំណេះដឹង ជំនាញគិតស៊ីជម្រៅ និងគុណតម្លៃសីលធម៌ដែលចាំបាច់ ដើម្បីក្លាយជាពលរដ្ឋដែលមានការទទួលខុសត្រូវ និងជាអ្នកដឹកនាំក្នុងពិភពលោកដែលផ្លាស់ប្តូរយ៉ាងឆាប់រហ័ស។"
              )}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                t("Academic Excellence", "ឧត្តមភាពសិក្សា"),
                t("Character Development", "ការអភិវឌ្ឍន៍អត្តចរិត"),
                t("Community Engagement", "ការចូលរួមក្នុងសង្គម")
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-800 font-medium">
                  <CheckCircle2 className="text-secondary shrink-0" size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-50 p-10 border-t-4 border-secondary shadow-sm">
            <h3 className="text-2xl font-bold text-primary mb-4 font-khmer">
              {t("Our Vision", "ចក្ខុវិស័យរបស់យើង")}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {t(
                "To be the premier educational institution in the region, recognized for academic excellence, innovative teaching, and producing graduates who contribute positively to the development of Cambodia and the global community.",
                "ដើម្បីក្លាយជាស្ថាប័នអប់រំឈានមុខគេនៅក្នុងតំបន់ ដែលទទួលស្គាល់សម្រាប់ឧត្តមភាពសិក្សា ការបង្រៀនប្រកបដោយភាពច្នៃប្រឌិត និងការផលិតនិស្សិតបញ្ចប់ការសិក្សាដែលរួមចំណែកជាវិជ្ជមានដល់ការអភិវឌ្ឍន៍ប្រទេសកម្ពុជា និងសហគមន៍សកល។"
              )}
            </p>
          </div>
        </div>

        {/* Leadership */}
        <div className="mt-24 text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4 font-khmer">
            {t("School Leadership", "ថ្នាក់ដឹកនាំសាលា")}
          </h2>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: t("Mr. Sok Chea", "លោក សុខ ជា"),
              title: t("School Principal", "នាយកសាលា"),
              desc: t("Over 20 years of experience in educational leadership.", "មានបទពិសោធន៍ជាង ២០ ឆ្នាំក្នុងការដឹកនាំវិស័យអប់រំ។")
            },
            {
              name: t("Mrs. Chan Vanna", "អ្នកស្រី ចាន់ វណ្ណា"),
              title: t("Vice Principal (Academic)", "នាយករង (ការសិក្សា)"),
              desc: t("Specializes in curriculum development and teacher training.", "ឯកទេសខាងការអភិវឌ្ឍន៍កម្មវិធីសិក្សា និងការបណ្តុះបណ្តាលគ្រូ។")
            },
            {
              name: t("Mr. Meas Rithy", "លោក មាស រិទ្ធី"),
              title: t("Vice Principal (Discipline)", "នាយករង (វិន័យ)"),
              desc: t("Dedicated to maintaining a safe and productive environment.", "ឧទ្ទិសដល់ការរក្សាបរិយាកាសសុវត្ថិភាព និងផលិតភាព។")
            }
          ].map((person, i) => (
            <div key={i} className="bg-white border rounded-sm overflow-hidden text-center group hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-gray-200 overflow-hidden relative">
                <img src={`/staff1.png`} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-primary mb-1">{person.name}</h3>
                <p className="text-secondary font-semibold text-sm mb-4 uppercase tracking-wider">{person.title}</p>
                <p className="text-gray-600 text-sm">{person.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
