/**
 * Test script to debug leave request API
 * Run: node test_leave_api.mjs
 */
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../../.env') });

// ========================
// CONFIG - Fill in manually
// ========================
const API_BASE = "https://phlov-meas-secondary-school-api.vercel.app/api"; // Change if different
const TEACHER_USERNAME = "ratha";   // from the screenshot user
const TEACHER_PASSWORD = "";        // fill in password

async function run() {
  console.log("🔍 Testing leave request API...\n");

  // 1. Login to get token
  console.log("1️⃣  Logging in as teacher...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: TEACHER_USERNAME, password: TEACHER_PASSWORD }),
  });
  const loginData = await loginRes.json();
  console.log(`   Status: ${loginRes.status}`);
  console.log(`   Response:`, JSON.stringify(loginData, null, 2));

  if (!loginRes.ok || !loginData.accessToken) {
    console.error("❌ Login failed. Check username/password.");
    return;
  }

  const token = loginData.accessToken;
  const user = loginData.user;
  console.log(`   ✅ Logged in as ${user.role} ID=${user.id}\n`);

  // 2. Test POST leave-request
  console.log("2️⃣  Submitting leave request...");
  const payload = {
    leaveType: "ANNUAL",
    startDate: "2026-06-15",
    endDate: "2026-06-17",
    totalDays: "3",
    reason: "ជាប់រល់",
    addressDuringLeave: "សៀមរាប",
    attachmentUrl: "",
    signatureUrl: "",
  };
  console.log("   Payload:", JSON.stringify(payload));

  const leaveRes = await fetch(`${API_BASE}/leave-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const leaveData = await leaveRes.json();
  console.log(`   Status: ${leaveRes.status}`);
  console.log(`   Response:`, JSON.stringify(leaveData, null, 2));

  if (leaveRes.ok) {
    console.log("\n✅ Leave request submitted successfully!");
  } else {
    console.log("\n❌ Failed. See response above for details.");
  }
}

run().catch(console.error);
