# Classroom Companion

A modular, role-based academic operations platform designed to improve faculty productivity and institutional workflows at SPJIMR.

## Architecture

- **Frontend + Backend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: ShadCN-style (Radix UI + CVA)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with cookie support
- **Authorization**: Backend-driven RBAC with tile-based permissions

### Key Design Decisions

1. **Single App, Multiple Roles** - One shared layout, no role-specific hardcoded dashboards
2. **Tile-Based Dashboard** - Each feature is a tile; tiles rendered dynamically based on backend permissions
3. **Strict RBAC** - `RolePermission` table controls tile access; frontend never hardcodes roles
4. **Service Layer** - Business logic in `/services`, API routes stay thin
5. **AI Extensibility** - `aiService.ts` has placeholder methods ready for Python FastAPI integration

## Project Structure

```
src/
  app/
    api/                    # API routes (14 endpoints)
      auth/login|me|logout  # Authentication
      batches/              # Batch management
      divisions/            # Division management
      timetable/            # Timetable events
      attendance/           # Attendance records
      materials/            # Course materials
      concerns/             # Student concerns
      leaves/               # Leave requests
      sodexo/               # Facility issues
      access/               # Role & access management
      roles/                # Role listing
      audit/                # Audit logs
    dashboard/              # Dashboard pages (9 tiles)
    login/                  # Login page
  components/ui/            # Reusable UI components
  lib/                      # Core utilities
    auth.ts                 # JWT helpers
    prisma.ts               # Prisma client singleton
    constants.ts            # Tile config, role names
    types.ts                # Shared TypeScript types
    utils.ts                # Utility functions
  services/                 # Business logic layer
    attendanceService.ts    # Attendance operations
    timetableService.ts     # Timetable operations
    materialService.ts      # Material operations
    aiService.ts            # AI placeholders (mock)
    auditService.ts         # Audit logging
  middleware.ts             # Auth middleware
prisma/
  schema.prisma             # Database schema (13 models)
  seed.ts                   # Seed script with sample data
```

## Roles & Permissions

| Role | Tiles Accessible |
|------|-----------------|
| Developer | All 9 tiles (full access) |
| Program Office | All 9 tiles (full access) |
| Faculty | Timetable, Attendance, Materials, Concerns, Sodexo |
| TA | Timetable, Attendance, Materials, Concerns |
| Student | Timetable, Attendance, Materials, Concerns, Leaves |
| CoCo | Timetable, Attendance, Materials, Concerns, Leaves, Sodexo |
| Sodexo | Timetable (read), Sodexo Support |
| Exam Cell | Timetable, Attendance (read) |

## Dashboard Tiles

1. **Onboard Batch** - Create and manage academic batches
2. **Manage Batches** - Divisions, specializations, and groups
3. **Timetable & Workload** - Schedule events and monitor workload
4. **Attendance Hub** - View and manage attendance records with analytics
5. **Session Materials** - Centralized course material repository
6. **Student Concerns** - Track and resolve student concerns
7. **Leave Requests** - Manage leave applications
8. **Sodexo Support** - Report AV and facility issues
9. **Change Access** - Admin role and permission management

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### Setup Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd Classroom-Companion-SPJIMR-ML

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and set your DATABASE_URL:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/classroom_companion?schema=public"
# JWT_SECRET="your-secret-key-change-in-production"

# 4. Create database
createdb classroom_companion

# 5. Run migrations
npx prisma migrate dev --name init

# 6. Seed the database
npm run db:seed

# 7. Start development server
npm run dev
```

Open http://localhost:3000 to access the app.

### Test Accounts (password: `password123`)

| Role | Email |
|------|-------|
| Developer | dev@spjimr.edu |
| Program Office | admin@spjimr.edu |
| Faculty | faculty@spjimr.edu |
| TA | ta@spjimr.edu |
| Student | student1@spjimr.edu |
| Student | student2@spjimr.edu |
| CoCo | coco@spjimr.edu |
| Sodexo | sodexo@spjimr.edu |

## Deployment

### Option A: Vercel + Neon/Supabase PostgreSQL

1. Create a PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Push to GitHub and connect to Vercel
3. Add environment variables in Vercel:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - A secure random string
4. Build command: `npx prisma generate && next build`
5. After first deploy, run migrations: `npx prisma migrate deploy`

### Option B: Railway

1. Create a new project on [Railway](https://railway.app)
2. Add PostgreSQL service
3. Connect GitHub repository
4. Set environment variables (`DATABASE_URL`, `JWT_SECRET`)
5. Build command: `npx prisma generate && npx prisma migrate deploy && next build`
6. Start command: `next start`

## AI Extensibility

The `services/aiService.ts` contains placeholder methods ready for future ML integration:

- `detectAttendanceRisk()` - Identify students at risk of low attendance
- `autoCategorizeMaterial()` - Auto-classify uploaded materials
- `detectWorkloadImbalance()` - Flag scheduling anomalies

These currently return mock data. To integrate real AI:
1. Set up a Python FastAPI server
2. Replace mock returns with HTTP calls to the FastAPI endpoints
3. Frontend never calls AI directly - always through the backend service layer

## Database Schema

13 models with proper foreign keys and indexing:

- **Users** & **Roles** & **RolePermissions** - RBAC system
- **Batches**, **Divisions**, **Courses** - Academic structure
- **TimetableEvents** - Class scheduling
- **AttendanceRecords** - Biometric/manual attendance tracking
- **LeaveRequests** - Leave management
- **Concerns** - Student concern tracking
- **Materials** - Course material repository
- **SodexoIssues** - Facility issue reporting
- **AccessChangeRequests** - Role change governance
- **AuditLogs** - Full audit trail
