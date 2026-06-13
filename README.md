# 🏫 វិទ្យាល័យ ផ្លូវមាស — Phlov Meas Secondary School

> **ប្រព័ន្ធគ្រប់គ្រងសាលារៀនពេញលេញ** | Full-Stack School Management System

A modern, bilingual (Khmer / English) school management platform built for **Phlov Meas Secondary School**. It includes a public-facing school website, a secure admin dashboard, and a REST API backend — all in a single monorepo.

---

## 📦 Monorepo Structure

```
Phlov_Meas_Secondary_School/
├── artifacts/
│   ├── admin/            # Admin dashboard (React + Vite)  :3001
│   ├── api-server/       # REST API backend (Express + TypeScript)  :8080
│   ├── school-website/   # Public school website (React + Vite)  :3000
│   └── mockup-sandbox/   # UI sandbox / prototyping
├── lib/
│   ├── db/               # Drizzle ORM schema & database client
│   ├── api-spec/         # OpenAPI YAML + Orval codegen config
│   ├── api-client-react/ # Auto-generated React Query hooks
│   └── api-zod/          # Auto-generated Zod validators
└── scripts/              # Utility scripts (seed, migrations, etc.)
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.x |
| pnpm | ≥ 9.x |
| PostgreSQL | ≥ 15 |

### 1. Clone & Install

```bash
git clone <repo-url>
cd Phlov_Meas_Secondary_School
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and secrets:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/phlov_meas
JWT_SECRET=your_64_char_random_secret_here
CSRF_SECRET=your_64_char_csrf_secret_here
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### 3. Set Up the Database

```bash
# Run initial setup (creates tables, seeds admin user)
node setup-db.mjs

# Run library-specific migration (adds library_logs table + due_date column)
node lib/db/add_library_columns.mjs
```

### 4. Start Development Servers

```bash
pnpm dev
```

This starts all three services in parallel:

| Service | URL | Description |
|---------|-----|-------------|
| Public Website | http://localhost:3000 | School public site |
| Admin Dashboard | http://localhost:3001 | Staff management portal |
| API Server | http://localhost:8080 | REST API backend |

---

## 🖥️ Applications

### 🌐 Public School Website (`artifacts/school-website`)

The public-facing website for Phlov Meas Secondary School, available in **Khmer and English**.

**Features:**
- School news and announcements
- Extracurricular activities listing
- Teacher directory
- Contact form
- School information and academic programs

**Tech:** React 19, Vite, TailwindCSS, React Query, Wouter

---

### 🔐 Admin Dashboard (`artifacts/admin`)

A secure, role-based management portal for school staff. Accessible at **http://localhost:3001**.

**Default Admin Login:**
```
Username: admin
Password: admin123
```

#### 📋 Admin Modules

| Module | Path | Roles | Description |
|--------|------|-------|-------------|
| **Dashboard** | `/` | Admin, Teacher | Key statistics overview |
| **Students** | `/students` | Admin, Teacher | Student profiles, enrollment, discipline logs |
| **Teachers** | `/teachers` | Admin | Staff directory with full profiles |
| **Classrooms** | `/classrooms` | Admin | Class management and teacher assignments |
| **News** | `/news` | Admin | School news & announcements (Khmer + English) |
| **Activities** | `/activities` | Admin | Events and extracurricular activities |
| **Attendance** | `/administrative/attendance` | Admin, Teacher | Daily student attendance tracking |
| **Grades** | `/administrative/grades` | Admin, Teacher | Monthly score entry per subject |
| **Grade Book** | `/administrative/gradebook` | Admin, Teacher | Full academic transcript per student |
| **Library Log** | `/administrative/library` | Admin | Book borrow & return tracking |
| **Cleaning Schedule** | `/administrative/cleaning` | Admin | Class cleaning roster management |
| **Leave Requests** | `/leave-requests` | Admin, Teacher | Teacher leave application & approval |
| **School Documents** | `/documents` | Admin, Teacher | Document archive with categories |
| **Reports** | `/reports` | Admin, Teacher | Printable academic reports & Excel export |
| **ID Card Studio** | `/administrative/id-cards` | Admin, Teacher | Custom student ID card designer |
| **Site Settings** | `/settings` | Admin | Website content, grading standards, subjects |
| **Contacts** | `/contacts` | Admin | Student/parent contact messages |
| **My Profile** | `/my-profile` | Teacher | Teacher self-service profile view |

#### 🔑 Role System

| Role | Access |
|------|--------|
| `admin` | Full access to all modules |
| `teacher` | Dashboard, Students, Attendance, Grades, Grade Book, Documents, Reports, Leave |

**Tech:** React 19, Vite, TailwindCSS, Radix UI, React Query, Wouter, ExcelJS, react-to-print, Framer Motion

---

### ⚙️ API Server (`artifacts/api-server`)

Secure Express.js REST API running on **port 8080**.

#### Security Features
- **JWT Authentication** (Bearer token, 15-minute access + 7-day refresh)
- **CSRF Protection** (Double-submit cookie pattern via `csrf-csrf`)
- **Rate Limiting** (express-rate-limit, configurable per `.env`)
- **Helmet** (HTTP security headers)
- **XSS Sanitization** (input sanitized via `xss` package)
- **Structured Logging** (pino with request-level logging)
- **Supply-chain defense** (pnpm minimum release age: 1440 minutes)

#### Key API Endpoints

```
POST   /api/auth/login                    # Login (returns JWT)
POST   /api/auth/logout                   # Logout
GET    /api/auth/me                       # Current user

GET    /api/students                      # List students (paginated, filtered)
POST   /api/students                      # Create student
PUT    /api/students/:id                  # Update student
DELETE /api/students/:id                  # Delete student

GET    /api/teachers                      # List teachers
POST   /api/teachers                      # Create teacher
PUT    /api/teachers/:id                  # Update teacher

GET    /api/classrooms                    # List classrooms
GET    /api/library/logs                  # Library borrow logs (search, filter, paginate)
POST   /api/library/logs                  # Record new borrow
PUT    /api/library/logs/:id              # Update / record return
DELETE /api/library/logs/:id              # Delete log

GET    /api/reports/library/export        # Export library report as Excel (.xlsx)
GET    /api/reports/grades/export         # Export grade report as Excel

GET    /api/leave-requests                # List leave requests
POST   /api/leave-requests                # Submit leave request
PUT    /api/leave-requests/:id/approve    # Approve/reject leave

GET    /api/stats                         # Dashboard statistics
```

**Tech:** Express 5, TypeScript, Drizzle ORM, PostgreSQL, ExcelJS, bcryptjs, jsonwebtoken, pino

---

## 🗄️ Database Schema

Managed via **Drizzle ORM** (`lib/db`). All tables use PostgreSQL.

| Table | Description |
|-------|-------------|
| `admin` | Admin and teacher accounts with roles |
| `students` | Student profiles with enrollment info |
| `classrooms` | Class sections with teacher assignments |
| `teachers` | Teacher profiles |
| `library_logs` | Book borrow/return records with due dates |
| `student_attendance` | Daily attendance records per student |
| `student_grades` | Semester grade summaries |
| `student_monthly_scores` | Monthly subject scores per student |
| `teacher_leaves` | Teacher leave request records |
| `teacher_leave_balances` | Leave balance tracking per year |
| `discipline_logs` | Student discipline incident records |
| `documents` | Uploaded school documents |
| `document_categories` | Document classification |
| `news` | School news articles (bilingual) |
| `activities` | School activities and events |
| `contacts` | Public contact form submissions |
| `subjects` | Subject master list |
| `subject_configs` | Subject grading coefficient configs |
| `geo` | Geographic reference data (province/district/commune) |
| `site_settings` | Key-value site configuration |
| `cleaning_schedules` | Classroom cleaning rosters |
| `id_card_templates` | Student ID card design templates |

---

## 🔧 Developer Workflow

### Regenerate API Client (after editing `openapi.yaml`)

```bash
pnpm --filter @workspace/api-spec run codegen
```

This runs **Orval** to regenerate:
- `lib/api-client-react/src/generated/api.ts` — React Query hooks
- `lib/api-client-react/src/generated/api.schemas.ts` — TypeScript types
- `lib/api-zod/src/generated/` — Zod validators

### Typecheck All Packages

```bash
pnpm run typecheck
```

### Build for Production

```bash
pnpm run build
```

---

## 🌏 Bilingual Support

The system is fully bilingual:
- **ភាសាខ្មែរ (Khmer)** — primary language for all admin UI labels, Excel exports, and reports
- **English** — full translation available via the language toggle in the admin sidebar

Excel reports use **Khmer OS Muol Light** and **Khmer OS Battambang** fonts for proper Khmer rendering. The API server generates institutional Excel headers in Khmer following the Ministry of Education format.

---

## 📊 Reports & Exports

| Report | Format | Route |
|--------|--------|-------|
| Library borrow/return log | Excel (.xlsx) | `GET /api/reports/library/export` |
| Student grade report | Excel (.xlsx) | `GET /api/reports/grades/export` |
| Academic transcript | Print (browser) | Grade Book page |
| Student ID cards | Print (browser) | ID Card Studio |
| Leave receipts | Print (browser) | Leave Requests page |

All Excel exports include:
- Khmer institutional header (Ministry of Education / Phlov Meas Secondary School)
- Royal motto: «ជាតិ សាសនា ព្រះមហាក្សត្រ»
- Color-coded status cells
- Formatted date columns
- A4 landscape layout optimized for printing

---

## 🔒 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `CSRF_SECRET` | ✅ | CSRF token signing secret |
| `FRONTEND_URL` | ✅ | Public website URL (for CORS) |
| `ADMIN_URL` | ✅ | Admin dashboard URL (for CORS) |
| `PORT` | ❌ | API server port (default: `8080`) |
| `LOG_LEVEL` | ❌ | Logging level (`info`, `debug`, `warn`, `error`) |
| `ACCESS_TOKEN_EXPIRY` | ❌ | JWT expiry (default: `15m`) |
| `REFRESH_TOKEN_EXPIRY` | ❌ | Refresh token expiry (default: `7d`) |
| `ENABLE_CSRF` | ❌ | Enable CSRF protection (default: `true`) |
| `ENABLE_RATE_LIMITING` | ❌ | Enable rate limiting (default: `true`) |

---

## 🧰 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite 7 |
| Routing | Wouter |
| Styling | TailwindCSS 4 + Radix UI |
| Data Fetching | TanStack React Query v5 |
| API Client | Orval (OpenAPI → React Query codegen) |
| Backend | Express 5 + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Security | Helmet, CSRF-CSRF, express-rate-limit, XSS |
| Logging | Pino + pino-http |
| Excel | ExcelJS |
| Package Manager | pnpm (workspace monorepo) |
| Type Validation | Zod |
| Language | TypeScript (strict mode) |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml) | Full OpenAPI 3.1 specification |
| [`lib/db/src/schema/`](lib/db/src/schema/) | All Drizzle table definitions |
| [`artifacts/api-server/src/routes/`](artifacts/api-server/src/routes/) | All API route handlers |
| [`artifacts/admin/src/pages/`](artifacts/admin/src/pages/) | All admin dashboard pages |
| [`artifacts/admin/src/App.tsx`](artifacts/admin/src/App.tsx) | Admin routing & role guards |
| [`.env.example`](.env.example) | Full environment variable reference |
| [`setup-db.mjs`](setup-db.mjs) | Database initialization script |

---

## 🏷️ Version

**Version:** 0.0.0 (Private — Internal Use)
**School:** វិទ្យាល័យ ផ្លូវមាស | Phlov Meas Secondary School
**Ministry:** ក្រសួងអប់រំ យុវជន និងកីឡា | Ministry of Education, Youth and Sport, Cambodia
