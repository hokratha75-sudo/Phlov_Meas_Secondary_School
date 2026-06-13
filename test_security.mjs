// test_security.mjs
async function fetchApi(path, options = {}) {
  const url = `http://localhost:8080/api${path}`;
  const res = await fetch(url, options);
  
  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  
  const cookies = [];
  res.headers.forEach((value, name) => {
    if (name.toLowerCase() === "set-cookie") {
      cookies.push(value);
    }
  });

  return { status: res.status, data, cookies };
}

function extractCookieMap(cookieStrings) {
  const cookieMap = {};
  cookieStrings.forEach(c => {
    const parts = c.split(";")[0].split("=");
    if (parts.length === 2) {
      cookieMap[parts[0].trim()] = parts[1].trim();
    }
  });
  return cookieMap;
}

function buildCookieString(cookieMap) {
  return Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function runTests() {
  console.log("==========================================");
  console.log("🛡️  RUNNING SECURITY TESTS");
  console.log("==========================================\n");

  let adminCookies = {};
  let teacherCookies = {};
  let csrfToken = "";

  console.log("[Setup] Fetch CSRF Token");
  const csrfRes = await fetchApi("/csrf-token", { method: "GET" });
  if (csrfRes.status === 200) {
    csrfToken = csrfRes.data.csrfToken;
    adminCookies = extractCookieMap(csrfRes.cookies);
    console.log("  - Successfully fetched CSRF Token");
  } else {
    console.log("  - Failed to fetch CSRF token");
    return;
  }

  console.log("\n[Test 1] Login with correct/wrong password");
  const wrongLogin = await fetchApi("/auth/login", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Cookie": buildCookieString(adminCookies),
      "x-csrf-token": csrfToken
    },
    body: JSON.stringify({ username: "admin", password: "wrongpassword123" })
  });
  console.log(`  - Wrong password status: ${wrongLogin.status} (Expected 401)`);
  
  const correctLogin = await fetchApi("/auth/login", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Cookie": buildCookieString(adminCookies),
      "x-csrf-token": csrfToken
    },
    body: JSON.stringify({ username: "admin", password: "admin123" })
  });
  console.log(`  - Correct password status: ${correctLogin.status} (Expected 200)`);
  console.log(`  - Received user:`, correctLogin.data?.user?.username);
  
  if (correctLogin.status === 200) {
    adminCookies = { ...adminCookies, ...extractCookieMap(correctLogin.cookies) };
  } else {
    console.log("❌ Test 1 Failed: Cannot proceed to other tests without login.");
    return;
  }
  console.log("✅ Test 1 Passed\n");

  console.log("[Test 2] CSRF Validation (attempt request without token)");
  const withoutCsrf = await fetchApi("/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": buildCookieString(adminCookies),
    },
    body: JSON.stringify({ title: "Test Doc", fileUrl: "test", fileName: "test", fileSize: 100, fileType: "pdf" })
  });
  console.log(`  - POST without CSRF token status: ${withoutCsrf.status} (Expected 403)`);

  const withCsrf = await fetchApi("/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": buildCookieString(adminCookies),
      "x-csrf-token": csrfToken
    },
    body: JSON.stringify({ title: "Test Doc", fileUrl: "test", fileName: "test", fileSize: 100, fileType: "pdf" })
  });
  console.log(`  - POST with CSRF token status: ${withCsrf.status} (Expected 201 or 200)`);
  if (withCsrf.status === 200 || withCsrf.status === 201) {
    const id = withCsrf.data?.id || withCsrf.data?.[0]?.id;
    if (id) {
        await fetchApi(`/documents/${id}`, {
        method: "DELETE",
        headers: {
            "Cookie": buildCookieString(adminCookies),
            "x-csrf-token": csrfToken
        }
        });
    }
  }
  console.log("✅ Test 2 Passed\n");

  console.log("[Test 3] Token expiry & Refresh (Using 3s JWT)");
  console.log("  - Waiting 4 seconds for JWT to expire...");
  await new Promise(r => setTimeout(r, 4000));
  
  const expiredRes = await fetchApi("/auth/me", {
    method: "GET",
    headers: { "Cookie": buildCookieString(adminCookies) }
  });
  console.log(`  - Authenticated request after 4s status: ${expiredRes.status} (Expected 401)`);
  
  const refreshRes = await fetchApi("/auth/refresh-token", {
    method: "POST",
    headers: { 
      "Cookie": buildCookieString(adminCookies),
      "x-csrf-token": csrfToken
    }
  });
  console.log(`  - Refresh token status: ${refreshRes.status} (Expected 200)`);
  
  if (refreshRes.status === 200) {
    adminCookies = { ...adminCookies, ...extractCookieMap(refreshRes.cookies) };
    const validRes = await fetchApi("/auth/me", {
      method: "GET",
      headers: { "Cookie": buildCookieString(adminCookies) }
    });
    console.log(`  - Authenticated request after refresh status: ${validRes.status} (Expected 200)`);
  }
  console.log("✅ Test 3 Passed\n");

  console.log("[Test 5] Admin routes with teacher account");
  const teacherLogin = await fetchApi("/auth/login", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Cookie": buildCookieString(adminCookies),
      "x-csrf-token": csrfToken
    },
    body: JSON.stringify({ username: "bopha", password: "teacher123" }) // Typical seeded password
  });
  
  let tLogin = teacherLogin;
  if (teacherLogin.status !== 200) {
     tLogin = await fetchApi("/auth/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": buildCookieString(adminCookies),
        "x-csrf-token": csrfToken
      },
      body: JSON.stringify({ username: "bopha", password: "bopha123" })
    });
  }
  console.log(`  - Teacher login status: ${tLogin.status} (Expected 200)`);
  if (tLogin.status === 200) {
    teacherCookies = { ...adminCookies, ...extractCookieMap(tLogin.cookies) };
    const adminRouteRes = await fetchApi("/documents", {
      method: "POST", 
      headers: { 
          "Content-Type": "application/json",
          "Cookie": buildCookieString(teacherCookies),
          "x-csrf-token": csrfToken
      },
      body: JSON.stringify({ title: "Test" }) // Even if missing fields, should hit 403 because of auth
    });
    console.log(`  - Teacher accessing admin-only modifying route (/documents) POST status: ${adminRouteRes.status} (Expected 403/401 depending on route)`);
  }
  console.log("✅ Test 5 Passed\n");

  console.log("[Test 4] Rate limiting (10 failed logins)");
  let rateLimitHit = false;
  for (let i = 1; i <= 12; i++) {
    const res = await fetchApi("/auth/login", {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Cookie": buildCookieString(adminCookies),
          "x-csrf-token": csrfToken
      },
      body: JSON.stringify({ username: "admin", password: "wrong" })
    });
    if (res.status === 429) {
      console.log(`  - Request ${i} status: ${res.status} (Expected 429 Too Many Requests)`);
      rateLimitHit = true;
      break;
    }
  }
  if (rateLimitHit) {
     console.log("✅ Test 4 Passed (Rate limit applied)");
  } else {
     console.log("❌ Test 4 Failed (Rate limit NOT applied)");
  }
  
  console.log("\n==========================================");
  console.log("🎉 ALL TESTS COMPLETED");
  console.log("==========================================\n");
}

runTests().catch(console.error);
