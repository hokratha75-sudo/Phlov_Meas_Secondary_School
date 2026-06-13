#!/usr/bin/env node
/**
 * seed-geo.mjs
 * ─────────────────────────────────────────────────────
 * Connects to your PostgreSQL and seeds the Cambodia Geo Data
 * into the database from the CSV files located in data/cambodia_geo/.
 *
 * Make sure you ran: pnpm --filter @workspace/db run push
 * before running this.
 *
 * Run using: node seed-geo.mjs
 * ─────────────────────────────────────────────────────
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const GEO_DIR = path.join(ROOT_DIR, "data", "cambodia_geo");

const DB_NAME = "highschool_hub";
const DB_URL = `postgresql://postgres:@localhost:5432/${DB_NAME}`;

function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  const result = [];
  if (lines.length === 0) return result;

  const headers = lines[0].split(",").map((h) => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const obj = {};
    let currentLine = "";
    let inQuotes = false;
    let colIndex = 0;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        if (colIndex < headers.length) {
          obj[headers[colIndex]] = currentLine.trim();
        }
        currentLine = "";
        colIndex++;
      } else {
        currentLine += char;
      }
    }
    if (colIndex < headers.length) {
      obj[headers[colIndex]] = currentLine.trim();
    }
    result.push(obj);
  }
  return result;
}

async function main() {
  console.log("\n📍 Cambodia Geo Data Seeder");

  if (!fs.existsSync(GEO_DIR)) {
    console.error(`❌ Data directory not found: ${GEO_DIR}`);
    process.exit(1);
  }

  console.log(`Connecting to PostgreSQL Database "${DB_NAME}"...`);
  const client = new pg.Client({ connectionString: DB_URL });

  try {
    await client.connect();
  } catch (err) {
    console.error(`❌ Cannot connect to database. Make sure PostgreSQL is running.`);
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  }

  try {
    // Check if tables exist
    const { rows: existingTables } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'provinces'
    `);
    
    if (existingTables.length === 0) {
      console.log(`⚠️  Table "provinces" not found!`);
      console.log(`   Please run "pnpm --filter @workspace/db run push" first to create the schema, then run this script again.`);
      process.exit(0);
    }

    // --- PROVINCES ---
    console.log(`\n⏳ Seeding provinces...`);
    const provCsv = fs.readFileSync(path.join(GEO_DIR, "CambodiaProvinceList2025.csv"), "utf8");
    const provinces = parseCSV(provCsv);
    for (const p of provinces) {
      if (!p.province_code) continue;
      await client.query(
        `INSERT INTO provinces (code, name_kh, name_en) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING`,
        [p.province_code, p.province_kh, p.province_en]
      );
    }
    console.log(`✅ ${provinces.length} Provinces seeded.`);

    // --- DISTRICTS ---
    console.log(`⏳ Seeding districts...`);
    const distCsv = fs.readFileSync(path.join(GEO_DIR, "CambodiaDistrictList2025.csv"), "utf8");
    const districts = parseCSV(distCsv);
    let distCount = 0;
    const districtSet = new Set();
    for (const d of districts) {
      if (!d.district_code) continue;
      districtSet.add(d.district_code);
      await client.query(
        `INSERT INTO districts (code, province_code, name_kh, name_en) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING`,
        [d.district_code, d.province_code, d.district_kh, d.district_en]
      );
      distCount++;
    }
    console.log(`✅ ${distCount} Districts seeded.`);

    // --- COMMUNES ---
    console.log(`⏳ Seeding communes...`);
    const commCsv = fs.readFileSync(path.join(GEO_DIR, "CambodiaCommuneList2025.csv"), "utf8");
    const communes = parseCSV(commCsv);
    let commCount = 0;
    const communeSet = new Set();
    for (const c of communes) {
      if (!c.commune_code || !districtSet.has(c.district_code)) continue;
      communeSet.add(c.commune_code);
      await client.query(
        `INSERT INTO communes (code, district_code, province_code, name_kh, name_en) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING`,
        [c.commune_code, c.district_code, c.province_code, c.commune_kh, c.commune_en]
      );
      commCount++;
      if (commCount % 500 === 0) process.stdout.write(".");
    }
    console.log(`\n✅ ${commCount} Communes seeded.`);

    // --- VILLAGES ---
    console.log(`⏳ Seeding villages (this may take a moment)...`);
    const villCsv = fs.readFileSync(path.join(GEO_DIR, "CambodiaVillagesList2025.csv"), "utf8");
    const villages = parseCSV(villCsv);
    let villCount = 0;
    let missingCommuneCount = 0;

    // Use transaction for speed
    await client.query("BEGIN");
    for (const v of villages) {
      if (!v.village_code) continue;
      
      // Skip if commune does not exist (Data inconsistency workaround)
      if (!communeSet.has(v.commune_code)) {
        missingCommuneCount++;
        continue;
      }

      await client.query(
        `INSERT INTO villages (code, commune_code, district_code, province_code, name_kh, name_en) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING`,
        [v.village_code, v.commune_code, v.district_code, v.province_code, v.village_kh, v.village_en]
      );
      villCount++;
      if (villCount % 1000 === 0) process.stdout.write(".");
    }
    await client.query("COMMIT");
    console.log(`\n✅ ${villCount} Villages seeded.`);
    if (missingCommuneCount > 0) {
      console.log(`⚠️  Skipped ${missingCommuneCount} villages due to missing communes in the source data.`);
    }

    console.log(`\n🎉 All Geo Data has been successfully imported into the database!\n`);

  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(`\n❌ Error seeding data:`, error);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
