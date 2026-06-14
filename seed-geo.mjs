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

import 'dotenv/config';
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const GEO_DIR = path.join(ROOT_DIR, "data", "cambodia_geo");

const DB_NAME = "highschool_hub";
const DB_URL = process.env.DATABASE_URL || `postgresql://postgres:@localhost:5432/${DB_NAME}`;

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

async function batchInsert(client, tableName, columns, rows, mapRowToValues, chunkSize = 500) {
  let insertedCount = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const placeholders = [];
    const values = [];
    let paramIndex = 1;
    
    for (const row of chunk) {
      const vals = mapRowToValues(row);
      if (!vals) continue;
      
      const chunkPlaceholders = [];
      for (let j = 0; j < vals.length; j++) {
        chunkPlaceholders.push(`$${paramIndex++}`);
        values.push(vals[j]);
      }
      placeholders.push(`(${chunkPlaceholders.join(', ')})`);
      insertedCount++;
    }
    
    if (placeholders.length > 0) {
      const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders.join(', ')} ON CONFLICT (code) DO NOTHING`;
      await client.query(sql, values);
    }
  }
  return insertedCount;
}

async function main() {
  console.log("\n📍 Cambodia Geo Data Seeder (Chunked Batch Insert Mode)");

  if (!fs.existsSync(GEO_DIR)) {
    console.error(`❌ Data directory not found: ${GEO_DIR}`);
    process.exit(1);
  }

  console.log(`Connecting to PostgreSQL Database...`);
  const parsedUrl = new URL(DB_URL);
  console.log(`Host: ${parsedUrl.host}, Database: ${parsedUrl.pathname}`);
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
    const seededProvinces = await batchInsert(
      client,
      "provinces",
      ["code", "name_kh", "name_en"],
      provinces,
      (p) => p.province_code ? [p.province_code, p.province_kh, p.province_en] : null
    );
    console.log(`✅ ${seededProvinces} Provinces seeded.`);

    // --- DISTRICTS ---
    console.log(`⏳ Seeding districts...`);
    const distCsv = fs.readFileSync(path.join(GEO_DIR, "CambodiaDistrictList2025.csv"), "utf8");
    const districts = parseCSV(distCsv);
    const districtSet = new Set(districts.map(d => d.district_code).filter(Boolean));
    const seededDistricts = await batchInsert(
      client,
      "districts",
      ["code", "province_code", "name_kh", "name_en"],
      districts,
      (d) => d.district_code ? [d.district_code, d.province_code, d.district_kh, d.district_en] : null
    );
    console.log(`✅ ${seededDistricts} Districts seeded.`);

    // --- COMMUNES ---
    console.log(`⏳ Seeding communes...`);
    const commCsv = fs.readFileSync(path.join(GEO_DIR, "CambodiaCommuneList2025.csv"), "utf8");
    const communes = parseCSV(commCsv);
    const communeSet = new Set();
    const filteredCommunes = communes.filter(c => {
      if (c.commune_code && districtSet.has(c.district_code)) {
        communeSet.add(c.commune_code);
        return true;
      }
      return false;
    });
    const seededCommunes = await batchInsert(
      client,
      "communes",
      ["code", "district_code", "province_code", "name_kh", "name_en"],
      filteredCommunes,
      (c) => [c.commune_code, c.district_code, c.province_code, c.commune_kh, c.commune_en]
    );
    console.log(`✅ ${seededCommunes} Communes seeded.`);

    // --- VILLAGES ---
    console.log(`⏳ Seeding villages (this may take a moment)...`);
    const villCsv = fs.readFileSync(path.join(GEO_DIR, "CambodiaVillagesList2025.csv"), "utf8");
    const villages = parseCSV(villCsv);
    let missingCommuneCount = 0;
    const filteredVillages = villages.filter(v => {
      if (!v.village_code) return false;
      if (!communeSet.has(v.commune_code)) {
        missingCommuneCount++;
        return false;
      }
      return true;
    });

    const seededVillages = await batchInsert(
      client,
      "villages",
      ["code", "commune_code", "district_code", "province_code", "name_kh", "name_en"],
      filteredVillages,
      (v) => [v.village_code, v.commune_code, v.district_code, v.province_code, v.village_kh, v.village_en]
    );
    console.log(`✅ ${seededVillages} Villages seeded.`);
    if (missingCommuneCount > 0) {
      console.log(`⚠️  Skipped ${missingCommuneCount} villages due to missing communes in the source data.`);
    }

    console.log(`\n🎉 All Geo Data has been successfully imported into the database!\n`);

    const pCheck = await client.query('SELECT COUNT(*) FROM provinces');
    const dCheck = await client.query('SELECT COUNT(*) FROM districts');
    const cCheck = await client.query('SELECT COUNT(*) FROM communes');
    const vCheck = await client.query('SELECT COUNT(*) FROM villages');
    console.log(`Verification counts right after commit:`);
    console.log(`Provinces: ${pCheck.rows[0].count}`);
    console.log(`Districts: ${dCheck.rows[0].count}`);
    console.log(`Communes: ${cCheck.rows[0].count}`);
    console.log(`Villages: ${vCheck.rows[0].count}`);

  } catch (error) {
    console.error(`\n❌ Error seeding data:`, error);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
