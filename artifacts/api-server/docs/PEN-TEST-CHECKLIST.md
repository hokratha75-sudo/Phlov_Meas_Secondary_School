# Security Hardening & Penetration Testing Checklist

This document provides a comprehensive checklist to verify the security posture of the Phlov Meas Secondary School web application.

## 1. Authentication & Session Management
- [ ] **Brute Force Protection**: Verify that endpoints like `/login` are rate-limited. (Test with automated scripts simulating repeated failed logins).
- [ ] **Password Complexity**: Ensure passwords enforce complexity rules (min length, uppercase, lowercase, numbers, special characters).
- [ ] **JWT Handling**: 
  - Ensure JWTs are not vulnerable to "none" algorithm attacks.
  - Verify that Access Tokens have a short lifespan (e.g., 15 minutes).
  - Verify that Refresh Tokens have a reasonable lifespan and are stored securely.
- [ ] **Session Fixation / Cookie Security**: Check that all cookies (especially `session_id` or JWTs if stored in cookies) use `HttpOnly`, `Secure` (in prod), and `SameSite` flags.

## 2. Access Control (Authorization)
- [ ] **Role-Based Access Control (RBAC)**: Try to access admin endpoints with a standard user account. Ensure robust enforcement on the server-side, not just UI hiding.
- [ ] **Insecure Direct Object Reference (IDOR)**: Try modifying parameters (e.g., user IDs, document IDs) in the URL or body to access data belonging to other users.

## 3. Injection Attacks
- [ ] **SQL Injection (SQLi)**: Attempt basic SQL injection payloads (e.g., `' OR 1=1 --`) on all input fields (login, search, parameter filters). Confirm parameterized queries are used via Drizzle ORM.
- [ ] **Cross-Site Scripting (XSS)**: 
  - Inject malicious payloads like `<script>alert(1)</script>` or `<img src=x onerror=alert(1)>` into forms (e.g., creating documents, user profiles).
  - Verify inputs are sanitized upon storage (Stored XSS) and safely rendered (Reflected XSS).

## 4. Cross-Site Request Forgery (CSRF)
- [ ] **CSRF Verification**: Use an interception proxy (e.g., Burp Suite) to capture a state-changing POST/PUT/DELETE request. Replay it without the `x-csrf-token` header or cookie. The request should be blocked.

## 5. Security Headers & Configurations
- [ ] **Helmet.js Headers**: Inspect the HTTP response headers to ensure they are present:
  - `Content-Security-Policy` (Restricts script execution sources)
  - `Strict-Transport-Security` (HSTS enforces HTTPS)
  - `X-Frame-Options` (DENY prevents clickjacking)
  - `X-XSS-Protection`
  - `X-Content-Type-Options: nosniff`
- [ ] **CORS Misconfiguration**: Try sending an `Origin` header from a malicious domain (`evil.com`). Ensure it is rejected.

## 6. Business Logic & Rate Limiting
- [ ] **Rate Limiting (DDoS mitigation)**: Flood an endpoint (e.g., >100 req/min) to confirm `429 Too Many Requests` is triggered.
- [ ] **Data Validation**: Attempt to bypass Zod/validation schema constraints (e.g., exceedingly long strings, invalid email formats, missing required fields).

## 7. Audit Logging
- [ ] Verify that sensitive actions (successful/failed logins, role changes, bulk deletions) leave an audit trail in the logs with user IDs and timestamps.
