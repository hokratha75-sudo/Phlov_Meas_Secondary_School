import pg from "pg";

const DB_NAME = "highschool_hub";
const connectionString = `postgresql://postgres:@localhost:5432/${DB_NAME}`;

const subjects = [
  { name_en: "Khmer Literature", name_kh: "ភាសាខ្មែរ", code: "KHM" },
  { name_en: "Mathematics", name_kh: "គណិតវិទ្យា", code: "MAT" },
  { name_en: "Physics", name_kh: "រូបវិទ្យា", code: "PHY" },
  { name_en: "Chemistry", name_kh: "គីមីវិទ្យា", code: "CHE" },
  { name_en: "Biology", name_kh: "ជីវវិទ្យា", code: "BIO" },
  { name_en: "History", name_kh: "ប្រវត្តិវិទ្យា", code: "HIS" },
  { name_en: "Geography", name_kh: "ភូមិវិទ្យា", code: "GEO" },
  { name_en: "Moral-Civics", name_kh: "សីលធម៌-ពលរដ្ឋ", code: "MOR" },
  { name_en: "English", name_kh: "អង់គ្លេស", code: "ENG" },
  { name_en: "ICT", name_kh: "កុំព្យូទ័រ", code: "ICT" },
  { name_en: "Conduct", name_kh: "សីលធម៌-ស្វ័យវិន័យ", code: "CND" },
];

async function seed() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to database.");

    // Check if table exists
    const { rows: tables } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'subjects'
    `);

    if (tables.length === 0) {
      console.error("Table 'subjects' does not exist. Run 'pnpm --filter @workspace/db run push' first.");
      process.exit(1);
    }

    for (const s of subjects) {
      await client.query(
        `INSERT INTO subjects (name_en, name_kh, code, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [s.name_en, s.name_kh, s.code]
      );
    }

    console.log("Subjects seeded successfully.");
  } catch (err) {
    console.error("Error seeding subjects:", err);
  } finally {
    await client.end();
  }
}

seed();
