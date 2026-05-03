import { Router } from "express";
import { db, siteSettings } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

const DEFAULTS: Record<string, unknown> = {
  stats: {
    studentsCount: "1,500+",
    teachersCount: "120+",
    programsCount: "15",
    yearsExcellence: "25+",
    graduationRate: "98%",
    commitmentLabel: "100%",
  },
  hero: {
    enrollmentBannerEn: "ENROLLMENT OPEN 2024-2025",
    enrollmentBannerKh: "បើកទទួលចុះឈ្មោះចូលរៀនឆ្នាំ ២០២៤-២០២៥",
    subtitleEn: "Empowering the next generation of Cambodian leaders through academic excellence, character development, and community engagement.",
    subtitleKh: "ពង្រឹងសមត្ថភាពអ្នកដឹកនាំកម្ពុជាជំនាន់ក្រោយ តាមរយៈឧត្តមភាពសិក្សា ការអភិវឌ្ឍន៍អត្តចរិត និងការចូលរួមក្នុងសង្គម។",
  },
  mission: {
    textEn: "To provide high-quality education that empowers students with knowledge, critical thinking skills, and moral values necessary to become responsible citizens and leaders in a rapidly changing world.",
    textKh: "ដើម្បីផ្តល់នូវការអប់រំប្រកបដោយគុណភាពខ្ពស់ ដែលផ្តល់អំណាចដល់សិស្សានុសិស្សនូវចំណេះដឹង ជំនាញគិតស៊ីជម្រៅ និងគុណតម្លៃសីលធម៌ដែលចាំបាច់ ដើម្បីក្លាយជាពលរដ្ឋដែលមានការទទួលខុសត្រូវ និងជាអ្នកដឹកនាំក្នុងពិភពលោកដែលផ្លាស់ប្តូរយ៉ាងឆាប់រហ័ស។",
  },
  vision: {
    textEn: "To be the premier educational institution in the region, recognized for academic excellence, innovative teaching, and producing graduates who contribute positively to the development of Cambodia and the global community.",
    textKh: "ដើម្បីក្លាយជាស្ថាប័នអប់រំឈានមុខគេនៅក្នុងតំបន់ ដែលទទួលស្គាល់សម្រាប់ឧត្តមភាពសិក្សា ការបង្រៀនប្រកបដោយភាពច្នៃប្រឌិត និងការផលិតនិស្សិតបញ្ចប់ការសិក្សាដែលរួមចំណែកជាវិជ្ជមានដល់ការអភិវឌ្ឍន៍ប្រទេសកម្ពុជា និងសហគមន៍សកល។",
  },
  about_history: {
    paragraph1En: "Treng Secondary School has been a beacon of educational excellence in the community. Born from a vision of community leaders who believed in the power of education to transform lives, our school has grown into a comprehensive educational institution.",
    paragraph1Kh: "អនុវិទ្យាល័យត្រែង គឺជាបង្គោលភ្លើងនៃឧត្តមភាពអប់រំនៅក្នុងសហគមន៍។ កើតចេញពីចក្ខុវិស័យរបស់មេដឹកនាំសហគមន៍ដែលជឿជាក់លើថាមពលនៃការអប់រំក្នុងការផ្លាស់ប្តូរជីវិត សាលារបស់យើងបានរីកចម្រើនដល់ស្ថាប័នអប់រំដ៏ទូលំទូលាយមួយ។",
    paragraph2En: "Over the decades, we have continuously adapted our curriculum and facilities to meet the changing needs of our society, ensuring our graduates are well-equipped for university and professional careers.",
    paragraph2Kh: "ក្នុងរយៈពេលជាច្រើនទសវត្សរ៍កន្លងមកនេះ យើងបានបន្តកែសម្រួលកម្មវិធីសិក្សា និងបរិក្ខាររបស់យើង ដើម្បីបំពេញតម្រូវការដែលផ្លាស់ប្តូរនៃសង្គមរបស់យើង ដោយធានាថាអ្នកបញ្ចប់ការសិក្សារបស់យើងត្រូវបានបំពាក់យ៉ាងល្អសម្រាប់អាជីពនៅសាកលវិទ្យាល័យ និងវិជ្ជាជីវៈ។",
  },
  leadership: JSON.stringify([
    {
      nameEn: "Mr. Sok Chea", nameKh: "លោក សុខ ជា",
      titleEn: "School Principal", titleKh: "នាយកសាលា",
      descEn: "Over 20 years of experience in educational leadership.", descKh: "មានបទពិសោធន៍ជាង ២០ ឆ្នាំក្នុងការដឹកនាំវិស័យអប់រំ។",
      photoUrl: "",
    },
    {
      nameEn: "Mrs. Chan Vanna", nameKh: "អ្នកស្រី ចាន់ វណ្ណា",
      titleEn: "Vice Principal (Academic)", titleKh: "នាយករង (ការសិក្សា)",
      descEn: "Specializes in curriculum development and teacher training.", descKh: "ឯកទេសខាងការអភិវឌ្ឍន៍កម្មវិធីសិក្សា និងការបណ្តុះបណ្តាលគ្រូ។",
      photoUrl: "",
    },
    {
      nameEn: "Mr. Meas Rithy", nameKh: "លោក មាស រិទ្ធី",
      titleEn: "Vice Principal (Discipline)", titleKh: "នាយករង (វិន័យ)",
      descEn: "Dedicated to maintaining a safe and productive environment.", descKh: "ឧទ្ទិសដល់ការរក្សាបរិយាកាសសុវត្ថិភាព និងផលិតភាព។",
      photoUrl: "",
    },
  ]),
  clubs: JSON.stringify([
    { titleEn: "Sports Club", titleKh: "ក្លឹបកីឡា", descEn: "Football, volleyball, basketball and traditional Khmer sports competitions.", descKh: "បាល់ទាត់ បាល់ទះ បាល់បោះ និងការប្រកួតកីឡាប្រពៃណីខ្មែរ។", color: "bg-blue-50 text-blue-700" },
    { titleEn: "Arts & Culture", titleKh: "សិល្បៈ និងវប្បធម៌", descEn: "Traditional Khmer dance, drawing, painting and cultural heritage preservation.", descKh: "របាំប្រពៃណីខ្មែរ គំនូរ ការគូរ និងការអភិរក្សបេតិកភណ្ឌវប្បធម៌។", color: "bg-pink-50 text-pink-700" },
    { titleEn: "Debate Club", titleKh: "ក្លឹបជជែកដេញដោល", descEn: "Public speaking, critical thinking and leadership development activities.", descKh: "ការនិយាយជាសាធារណៈ ការគិតស៊ីជម្រៅ និងសកម្មភាពអភិវឌ្ឍភាពជាអ្នកដឹកនាំ។", color: "bg-amber-50 text-amber-700" },
    { titleEn: "Music Band", titleKh: "ក្រុមតន្ត្រី", descEn: "Modern and traditional Khmer instrument training and school performances.", descKh: "ការបណ្តុះបណ្តាលឧបករណ៍តន្ត្រីទំនើប និងប្រពៃណីខ្មែរ និងការសម្តែងក្នុងសាលា។", color: "bg-purple-50 text-purple-700" },
    { titleEn: "IT & Computer Club", titleKh: "ក្លឹបព័ត៌មានវិទ្យា", descEn: "Computer skills, programming basics, and digital literacy for the modern world.", descKh: "ជំនាញកុំព្យូទ័រ មូលដ្ឋានការសរសេរកូដ និងការប្រើប្រាស់បច្ចេកវិទ្យាឌីជីថល។", color: "bg-green-50 text-green-700" },
    { titleEn: "Environment Club", titleKh: "ក្លឹបបរិស្ថាន", descEn: "Tree planting, school cleaning campaigns and environmental awareness.", descKh: "ការដាំដើមឈើ យុទ្ធនាការសំអាតសាលា និងការដឹងដល់បរិស្ថាន។", color: "bg-teal-50 text-teal-700" },
  ]),
  academic_programs: JSON.stringify([
    { titleEn: "Science Track", titleKh: "ថ្នាក់វិទ្យាសាស្ត្រពិត", descEn: "Intensive focus on Mathematics, Physics, Chemistry, and Biology.", descKh: "ផ្តោតសំខាន់លើគណិតវិទ្យា រូបវិទ្យា គីមីវិទ្យា និងជីវវិទ្យា។" },
    { titleEn: "Social Science Track", titleKh: "ថ្នាក់វិទ្យាសាស្ត្រសង្គម", descEn: "Emphasizes History, Geography, Literature, and Moral Civics.", descKh: "សង្កត់ធ្ងន់លើប្រវត្តិវិទ្យា ភូមិវិទ្យា អក្សរសាស្ត្រ និងសីលធម៌ពលរដ្ឋ។" },
    { titleEn: "Computer Science", titleKh: "វិទ្យាសាស្ត្រកុំព្យូទ័រ", descEn: "Modern IT skills, basic programming, and digital literacy.", descKh: "ជំនាញព័ត៌មានវិទ្យាទំនើប ការសរសេរកម្មវិធីមូលដ្ឋាន និងចំណេះដឹងឌីជីថល។" },
    { titleEn: "Languages", titleKh: "ភាសាបរទេស", descEn: "English and French language programs with native speakers.", descKh: "កម្មវិធីភាសាអង់គ្លេស និងបារាំងជាមួយអ្នកនិយាយដើម។" },
  ]),
  contact_info: {
    phone: "012 345 678",
    email: "treng.school@gmail.com",
    addressEn: "Treng District, Stung Treng Province, Cambodia",
    addressKh: "ស្រុកត្រែង ខេត្តស្ទឹងត្រែង កម្ពុជា",
    facebookUrl: "https://www.facebook.com",
  },
};

function ensureString(val: unknown): string {
  if (typeof val === "string") return val;
  return JSON.stringify(val);
}

router.get("/settings", async (_req, res) => {
  const rows = await db.select().from(siteSettings);
  const map: Record<string, string> = {};
  const dbKeys = new Set(rows.map(r => r.key));

  for (const [k, v] of Object.entries(DEFAULTS)) {
    if (!dbKeys.has(k)) {
      map[k] = ensureString(v);
    }
  }
  for (const row of rows) {
    map[row.key] = row.value;
  }
  res.json(map);
});

router.put("/settings", requireAuth, async (req, res) => {
  const { key, value } = req.body as { key: string; value: string };
  if (!key || value === undefined) {
    res.status(400).json({ error: "key and value are required" });
    return;
  }
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  if (existing.length > 0) {
    await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
  res.json({ key, value });
});

export default router;
