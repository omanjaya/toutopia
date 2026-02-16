# Toutopia — System Planning Document

> Comprehensive technical planning for a paid online examination/try-out platform
> supporting UTBK, CPNS, BUMN, Kedinasan, and other Indonesian standardized tests.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Name Candidates](#2-name-candidates)
3. [User Roles & Personas](#3-user-roles--personas)
4. [Feature Specification](#4-feature-specification)
5. [System Architecture](#5-system-architecture)
6. [Tech Stack](#6-tech-stack)
7. [Project Structure](#7-project-structure)
8. [Database Schema](#8-database-schema)
9. [API Design](#9-api-design)
10. [UI/UX Guidelines](#10-uiux-guidelines)
11. [Security by Design](#11-security-by-design)
12. [Payment System](#12-payment-system)
13. [SEO Strategy](#13-seo-strategy)
14. [Teacher Marketplace](#14-teacher-marketplace)
15. [Anti-Cheat System](#15-anti-cheat-system)
16. [Notification & Reminder System](#16-notification--reminder-system)
17. [Deployment (Docker on VPS)](#17-deployment-docker-on-vps)
18. [Performance & Scalability](#18-performance--scalability)
19. [Monitoring & Logging](#19-monitoring--logging)
20. [Development Phases](#20-development-phases)

---

## 1. Platform Overview

### Vision
A premium, all-in-one online examination platform for Indonesian standardized tests.
Students practice with realistic simulations. Teachers earn money by contributing quality questions.
The platform provides honest scoring, detailed analytics, and study planning tools.

### Supported Exam Categories
| Category | Sub-categories |
|----------|---------------|
| UTBK-SNBT | TPS (Penalaran Umum, Pengetahuan Kuantitatif, Penalaran Matematika, Literasi Bahasa Indonesia, Literasi Bahasa Inggris), TKA (Saintek, Soshum) |
| CPNS | TWK (Tes Wawasan Kebangsaan), TIU (Tes Intelegensia Umum), TKP (Tes Karakteristik Pribadi) |
| BUMN | TKD (Tes Kemampuan Dasar), Core Values BUMN, English, Managerial |
| Kedinasan | STAN, STIS, IPDN, SSG, STIN — each with their own sub-tests |
| PPPK | Kompetensi Teknis, Manajerial, Sosio-Kultural |

### Business Model
- Freemium: new users receive free credits to try limited packages
- Per-package purchase (single try out)
- Bundle purchase (multiple packages at discount)
- Monthly/yearly subscription for unlimited access
- Teacher revenue sharing from question contributions

---

## 2. Name Candidates

| Name | Domain Target | Rationale |
|------|--------------|-----------|
| TryNesia | trynesia.id | Tryout + Indonesia. Modern, brandable, broad scope. |
| Toutopia | toutopia.id | Tryout + Utopia. Premium feel, aspirational. |
| SkorUp | skorup.id | Score Up. Motivational, action-oriented. |
| TestLab | testlab.id | Professional, tech-savvy, trusted. |
| DrillTest | drilltest.id | Intense practice vibe, focused. |
| UjianKu | ujianku.id | Personal ownership, relatable. |
| LatihanID | latihan.id | Descriptive, strong SEO signal. |

Decision: **Toutopia** (toutopia.id)

---

## 3. User Roles & Personas

### Role Hierarchy
```
SUPER_ADMIN
  |-- ADMIN
  |-- TEACHER (verified contributor)
  |-- STUDENT (free / premium)
  |-- GUEST (unauthenticated)
```

### Persona Details

**Student (Siswa)**
- Age: 16-35
- Goal: pass UTBK/CPNS/BUMN with high score
- Needs: realistic simulation, score analytics, study plan, affordable pricing
- Behavior: mobile-first, price-sensitive, social-proof driven

**Teacher (Pengajar)**
- Age: 25-50
- Goal: earn supplemental income by contributing questions
- Needs: easy question editor, earnings dashboard, recognition
- Behavior: quality-driven, wants clear payout terms

**Admin**
- Goal: manage platform, moderate content, view analytics
- Needs: admin dashboard, user management, financial reports

---

## 4. Feature Specification

### 4.1 Authentication & Authorization
- Email/password registration with email verification
- Google OAuth login
- Phone OTP login (optional, phase 2)
- Role-based access control (RBAC)
- Session management with refresh token rotation
- Account recovery via email
- Teacher registration with verification flow

### 4.2 Exam System (Core)
- Browse exam categories and packages
- Purchase or use free credits to access packages
- Exam session with:
  - Configurable timer per section
  - Question navigation panel (numbered grid)
  - Mark/flag questions for review
  - Auto-save answers every 30 seconds
  - Anti tab-switch detection (toggleable per package)
  - Fullscreen enforcement mode (toggleable)
  - Warning system for violations
- Submit exam manually or auto-submit on timeout
- Server-side time validation (prevent client-side manipulation)
- Instant scoring after submission
- Detailed result page:
  - Total score and per-section scores
  - Correct/incorrect/unanswered breakdown
  - Time spent per question
  - Percentile rank among all participants
  - Per-topic weakness analysis
- Review mode: view all questions with explanations after submission

### 4.3 Question Bank & Admin Panel
- Question editor with rich text (math formulas via KaTeX, images, tables)
- Question types:
  - Single correct answer (radio)
  - Multiple correct answers (checkbox)
  - True/False
  - Numeric input
  - Essay (manually graded, phase 2)
- Bulk import via CSV/Excel template
- Question metadata: difficulty (1-5), topic, subtopic, source, year
- Question review/approval workflow:
  - Teacher submits -> Admin reviews -> Approved/Rejected
  - Revision requests with comments
- Question usage statistics (how many attempts, success rate)
- Duplicate detection (basic similarity check)

### 4.4 Dashboard — Student
- Overview: recent scores, upcoming reminders, study streak
- Exam history: all attempts with scores, date, duration
- Analytics:
  - Score trend chart over time
  - Per-category performance radar chart
  - Weakest topics list with recommended practice
  - Time management analysis
- Bookmarked questions
- Credit/subscription balance

### 4.5 Dashboard — Teacher
- Question submission panel
- Submission status tracker (pending/approved/rejected)
- Earnings dashboard:
  - Total earnings
  - Per-question earnings (based on usage)
  - Payout history
  - Request payout
- Profile: bio, specialization, stats (questions contributed, avg rating)

### 4.6 Dashboard — Admin
- User management (list, search, ban, role change)
- Question moderation queue
- Exam package management (create, edit, publish, archive)
- Financial overview:
  - Revenue reports (daily/weekly/monthly)
  - Teacher payout management
  - Transaction log
- Platform analytics:
  - Active users, new registrations
  - Popular packages
  - Completion rates
- Content management (articles/blog posts)
- System settings

### 4.7 Schedule Planner
- Calendar view (month/week/day)
- Create study tasks with:
  - Title, description
  - Linked exam category
  - Date, time, duration
  - Repeat (daily/weekly/custom)
  - Priority level
- Drag and drop to reschedule
- Mark tasks as complete
- Progress bar (weekly completion rate)
- Templates: pre-built study plans per exam type (e.g., "3-month UTBK prep")

### 4.8 Reminder & Notification System
- In-app notifications (bell icon with badge)
- Email notifications (configurable)
- Browser push notifications (Web Push API)
- Notification types:
  - Study reminder (from schedule planner)
  - Exam registration deadline alerts (UTBK, CPNS dates)
  - New package available
  - Score/ranking updates
  - Payment confirmation
  - Teacher: question approval status
- User preferences: toggle each notification type on/off per channel

### 4.9 Leaderboard & Social
- Per-package leaderboard (top scores)
- Weekly/monthly global leaderboard per exam category
- User profile with public stats (optional privacy toggle)
- Share score to social media (generate image card)

### 4.10 Blog / Article System
- SEO-optimized article pages
- Categories: tips, jadwal ujian, strategi, pengumuman
- Admin-authored (phase 1), teacher-authored (phase 2)
- Related articles suggestions
- Table of contents auto-generation

### 4.11 Landing Pages
- Homepage with value proposition, categories, testimonials, CTA
- Per-category landing page (`/tryout-utbk`, `/tryout-cpns`, etc.)
- Pricing page
- About page
- FAQ page
- Contact page

---

## 5. System Architecture

### High-Level Architecture
```
                          [Nginx Reverse Proxy]
                           |              |
                    [Next.js App]    [Static Assets / CDN]
                           |
              +------------+------------+
              |            |            |
        [PostgreSQL]   [Redis]     [MinIO]
              |            |            |
         Data Store    Cache/       File Storage
                       Sessions     (images, docs)
              |
        [Midtrans API]  (external)
        [Email Service]  (external)
```

### Layered Architecture (Clean Architecture)
```
+--------------------------------------------------+
|                  Presentation Layer               |
|  Next.js Pages, React Components, API Routes     |
+--------------------------------------------------+
|                  Application Layer                |
|  Use Cases, DTOs, Validators, Mappers             |
+--------------------------------------------------+
|                    Domain Layer                   |
|  Entities, Value Objects, Domain Events,          |
|  Repository Interfaces, Business Rules            |
+--------------------------------------------------+
|                Infrastructure Layer               |
|  Prisma Repositories, Redis Cache, MinIO Client,  |
|  Midtrans Client, Email Client, Push Service      |
+--------------------------------------------------+
```

### Data Flow (Exam Attempt Example)
```
Student clicks "Start Exam"
  -> API: POST /api/exam/start
  -> Use Case: StartExamUseCase
    -> Validate: user has access (credit/subscription)
    -> Validate: no active attempt exists
    -> Create ExamAttempt record (status: IN_PROGRESS)
    -> Generate server-side start timestamp
    -> Return: attempt_id, questions (without answers), time_limit
  -> Client renders exam interface

Student submits answer
  -> API: POST /api/exam/answer
  -> Use Case: SaveAnswerUseCase
    -> Validate: attempt is active and not expired
    -> Validate: time spent is within bounds (server-side check)
    -> Upsert answer record
    -> Return: confirmation

Student finishes exam
  -> API: POST /api/exam/submit
  -> Use Case: SubmitExamUseCase
    -> Validate: attempt is active
    -> Mark attempt as COMPLETED
    -> Calculate scores per section and total
    -> Calculate percentile rank
    -> Generate topic analysis
    -> Return: result summary

Student views result
  -> API: GET /api/exam/result/:attemptId
  -> Return: full result with analytics
```

---

## 6. Tech Stack

### Core
| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Runtime | Node.js | 20 LTS | Stable, long-term support |
| Framework | Next.js | 15+ (App Router) | SSR for SEO, API routes, RSC |
| Language | TypeScript | 5.x | Type safety, better DX |
| ORM | Prisma | 6.x | Type-safe DB access, migrations |
| Database | PostgreSQL | 16 | Reliable, feature-rich relational DB |
| Cache | Redis | 7.x | Session store, caching, rate limiting |
| File Storage | MinIO | Latest | S3-compatible, self-hosted |

### Frontend
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Styling | Tailwind CSS 4 | Utility-first, fast development |
| UI Components | shadcn/ui | Accessible, customizable, no lock-in |
| Icons | Lucide Icons | Clean, consistent, premium look |
| Charts | Recharts | Composable, React-native charts |
| Rich Text Editor | Tiptap | Extensible, supports math (KaTeX) |
| Calendar | react-day-picker | Lightweight, accessible |
| DnD | @dnd-kit | Modern drag-and-drop |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| State | Zustand | Lightweight, simple global state |
| Data Fetching | TanStack Query | Cache, retry, optimistic updates |
| Math Rendering | KaTeX | Fast LaTeX rendering for formulas |
| Date | date-fns | Lightweight date utilities |

### Backend / Infrastructure
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| API Validation | Zod | Schema validation, shared with frontend |
| Auth | NextAuth.js v5 | Flexible, supports multiple providers |
| Payment | Midtrans (Server SDK) | Indonesian payment gateway, QRIS/VA/ewallet |
| Email | Resend or Nodemailer | Transactional emails |
| Push Notifications | web-push (VAPID) | Browser push notifications |
| Rate Limiting | upstash/ratelimit or custom Redis | Prevent abuse |
| Logging | Pino | Fast, structured JSON logging |
| Job Queue | BullMQ (Redis-backed) | Background jobs (email, scoring, payouts) |

### DevOps
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Containerization | Docker + Docker Compose | Consistent environments |
| Reverse Proxy | Nginx | SSL termination, static files, rate limiting |
| SSL | Let's Encrypt (Certbot) | Free SSL certificates |
| CI/CD | GitHub Actions | Automated build, test, deploy |
| Monitoring | Prometheus + Grafana | Metrics and dashboards |
| Log Aggregation | Loki | Lightweight log management |
| Backup | pg_dump + cron + MinIO | Automated database backups |

---

## 7. Project Structure

```
/
+-- docker-compose.yml
+-- docker-compose.prod.yml
+-- Dockerfile
+-- nginx/
|   +-- nginx.conf
|   +-- ssl/
+-- docs/
|   +-- PLANNING.md
+-- CLAUDE.md
+-- src/
|   +-- app/                           # Next.js App Router
|   |   +-- (public)/                  # Public pages (no auth required)
|   |   |   +-- page.tsx               # Homepage
|   |   |   +-- login/page.tsx
|   |   |   +-- register/page.tsx
|   |   |   +-- tryout-utbk/page.tsx   # SEO landing
|   |   |   +-- tryout-cpns/page.tsx   # SEO landing
|   |   |   +-- tryout-bumn/page.tsx   # SEO landing
|   |   |   +-- pricing/page.tsx
|   |   |   +-- blog/
|   |   |   |   +-- page.tsx
|   |   |   |   +-- [slug]/page.tsx
|   |   |   +-- faq/page.tsx
|   |   +-- (authenticated)/           # Requires login
|   |   |   +-- dashboard/
|   |   |   |   +-- page.tsx           # Student dashboard
|   |   |   |   +-- analytics/page.tsx
|   |   |   |   +-- history/page.tsx
|   |   |   |   +-- bookmarks/page.tsx
|   |   |   +-- packages/
|   |   |   |   +-- page.tsx           # Browse packages
|   |   |   |   +-- [id]/page.tsx      # Package detail
|   |   |   +-- exam/
|   |   |   |   +-- [attemptId]/page.tsx   # Exam session
|   |   |   |   +-- result/[attemptId]/page.tsx
|   |   |   +-- planner/
|   |   |   |   +-- page.tsx           # Schedule planner
|   |   |   +-- profile/
|   |   |   |   +-- page.tsx
|   |   |   |   +-- settings/page.tsx
|   |   |   +-- payment/
|   |   |       +-- page.tsx           # Payment/checkout
|   |   |       +-- history/page.tsx
|   |   +-- (teacher)/                 # Teacher panel
|   |   |   +-- teacher/
|   |   |       +-- dashboard/page.tsx
|   |   |       +-- questions/
|   |   |       |   +-- page.tsx       # My questions
|   |   |       |   +-- new/page.tsx   # Create question
|   |   |       |   +-- [id]/edit/page.tsx
|   |   |       +-- earnings/page.tsx
|   |   |       +-- profile/page.tsx
|   |   +-- (admin)/                   # Admin panel
|   |   |   +-- admin/
|   |   |       +-- dashboard/page.tsx
|   |   |       +-- users/page.tsx
|   |   |       +-- questions/
|   |   |       |   +-- page.tsx       # Moderation queue
|   |   |       |   +-- [id]/review/page.tsx
|   |   |       +-- packages/
|   |   |       |   +-- page.tsx
|   |   |       |   +-- new/page.tsx
|   |   |       |   +-- [id]/edit/page.tsx
|   |   |       +-- transactions/page.tsx
|   |   |       +-- payouts/page.tsx
|   |   |       +-- articles/
|   |   |       |   +-- page.tsx
|   |   |       |   +-- new/page.tsx
|   |   |       +-- settings/page.tsx
|   |   +-- api/                       # API Routes
|   |   |   +-- auth/[...nextauth]/route.ts
|   |   |   +-- exam/
|   |   |   |   +-- start/route.ts
|   |   |   |   +-- answer/route.ts
|   |   |   |   +-- submit/route.ts
|   |   |   |   +-- result/[attemptId]/route.ts
|   |   |   +-- packages/route.ts
|   |   |   +-- questions/route.ts
|   |   |   +-- payment/
|   |   |   |   +-- create/route.ts
|   |   |   |   +-- webhook/route.ts
|   |   |   +-- planner/route.ts
|   |   |   +-- notifications/route.ts
|   |   |   +-- leaderboard/route.ts
|   |   |   +-- teacher/
|   |   |   |   +-- questions/route.ts
|   |   |   |   +-- earnings/route.ts
|   |   |   |   +-- payout/route.ts
|   |   |   +-- admin/
|   |   |       +-- users/route.ts
|   |   |       +-- questions/route.ts
|   |   |       +-- packages/route.ts
|   |   |       +-- analytics/route.ts
|   |   |       +-- payouts/route.ts
|   |   +-- layout.tsx
|   |   +-- globals.css
|   +-- core/                          # Domain Layer
|   |   +-- entities/
|   |   |   +-- user.entity.ts
|   |   |   +-- question.entity.ts
|   |   |   +-- exam-package.entity.ts
|   |   |   +-- exam-attempt.entity.ts
|   |   |   +-- transaction.entity.ts
|   |   |   +-- study-plan.entity.ts
|   |   |   +-- article.entity.ts
|   |   +-- use-cases/
|   |   |   +-- auth/
|   |   |   |   +-- register.use-case.ts
|   |   |   |   +-- login.use-case.ts
|   |   |   +-- exam/
|   |   |   |   +-- start-exam.use-case.ts
|   |   |   |   +-- save-answer.use-case.ts
|   |   |   |   +-- submit-exam.use-case.ts
|   |   |   |   +-- calculate-score.use-case.ts
|   |   |   |   +-- get-leaderboard.use-case.ts
|   |   |   +-- question/
|   |   |   |   +-- create-question.use-case.ts
|   |   |   |   +-- review-question.use-case.ts
|   |   |   |   +-- import-questions.use-case.ts
|   |   |   +-- payment/
|   |   |   |   +-- create-transaction.use-case.ts
|   |   |   |   +-- handle-webhook.use-case.ts
|   |   |   |   +-- check-access.use-case.ts
|   |   |   +-- planner/
|   |   |   |   +-- create-plan.use-case.ts
|   |   |   |   +-- manage-tasks.use-case.ts
|   |   |   +-- teacher/
|   |   |   |   +-- calculate-earnings.use-case.ts
|   |   |   |   +-- request-payout.use-case.ts
|   |   |   +-- notification/
|   |   |       +-- send-reminder.use-case.ts
|   |   |       +-- send-push.use-case.ts
|   |   +-- interfaces/                # Repository contracts
|   |   |   +-- user.repository.ts
|   |   |   +-- question.repository.ts
|   |   |   +-- exam.repository.ts
|   |   |   +-- transaction.repository.ts
|   |   |   +-- planner.repository.ts
|   |   |   +-- notification.repository.ts
|   |   +-- value-objects/
|   |   |   +-- score.vo.ts
|   |   |   +-- money.vo.ts
|   |   |   +-- email.vo.ts
|   |   +-- errors/
|   |       +-- domain-error.ts
|   |       +-- exam-errors.ts
|   |       +-- payment-errors.ts
|   |       +-- auth-errors.ts
|   +-- infrastructure/                # Infrastructure Layer
|   |   +-- database/
|   |   |   +-- prisma/
|   |   |   |   +-- schema.prisma
|   |   |   |   +-- migrations/
|   |   |   |   +-- seed.ts
|   |   |   +-- repositories/
|   |   |       +-- user.repository.impl.ts
|   |   |       +-- question.repository.impl.ts
|   |   |       +-- exam.repository.impl.ts
|   |   |       +-- transaction.repository.impl.ts
|   |   |       +-- planner.repository.impl.ts
|   |   |       +-- notification.repository.impl.ts
|   |   +-- cache/
|   |   |   +-- redis.client.ts
|   |   |   +-- cache.service.ts
|   |   +-- storage/
|   |   |   +-- minio.client.ts
|   |   |   +-- storage.service.ts
|   |   +-- payment/
|   |   |   +-- midtrans.client.ts
|   |   |   +-- payment.service.ts
|   |   +-- email/
|   |   |   +-- email.service.ts
|   |   |   +-- templates/
|   |   |       +-- welcome.template.ts
|   |   |       +-- payment-success.template.ts
|   |   |       +-- reminder.template.ts
|   |   +-- push/
|   |   |   +-- web-push.service.ts
|   |   +-- queue/
|   |       +-- bull.config.ts
|   |       +-- workers/
|   |           +-- email.worker.ts
|   |           +-- scoring.worker.ts
|   |           +-- payout.worker.ts
|   +-- shared/                        # Shared Layer
|   |   +-- components/
|   |   |   +-- ui/                    # Base UI (shadcn)
|   |   |   |   +-- button.tsx
|   |   |   |   +-- input.tsx
|   |   |   |   +-- dialog.tsx
|   |   |   |   +-- card.tsx
|   |   |   |   +-- table.tsx
|   |   |   |   +-- badge.tsx
|   |   |   |   +-- skeleton.tsx
|   |   |   |   +-- toast.tsx
|   |   |   |   +-- dropdown-menu.tsx
|   |   |   |   +-- tabs.tsx
|   |   |   |   +-- ... (other shadcn components)
|   |   |   +-- layout/
|   |   |   |   +-- header.tsx
|   |   |   |   +-- footer.tsx
|   |   |   |   +-- sidebar.tsx
|   |   |   |   +-- mobile-nav.tsx
|   |   |   |   +-- breadcrumb.tsx
|   |   |   +-- exam/
|   |   |   |   +-- question-card.tsx
|   |   |   |   +-- question-nav.tsx
|   |   |   |   +-- timer.tsx
|   |   |   |   +-- answer-option.tsx
|   |   |   |   +-- score-card.tsx
|   |   |   |   +-- result-chart.tsx
|   |   |   |   +-- anti-cheat-wrapper.tsx
|   |   |   +-- planner/
|   |   |   |   +-- calendar-view.tsx
|   |   |   |   +-- task-card.tsx
|   |   |   |   +-- plan-progress.tsx
|   |   |   +-- dashboard/
|   |   |   |   +-- stat-card.tsx
|   |   |   |   +-- score-chart.tsx
|   |   |   |   +-- radar-chart.tsx
|   |   |   |   +-- activity-feed.tsx
|   |   |   +-- payment/
|   |   |   |   +-- pricing-card.tsx
|   |   |   |   +-- payment-method-selector.tsx
|   |   |   +-- shared/
|   |   |       +-- data-table.tsx
|   |   |       +-- empty-state.tsx
|   |   |       +-- loading-state.tsx
|   |   |       +-- error-boundary.tsx
|   |   |       +-- confirm-dialog.tsx
|   |   |       +-- rich-text-editor.tsx
|   |   |       +-- math-renderer.tsx
|   |   |       +-- image-upload.tsx
|   |   +-- hooks/
|   |   |   +-- use-auth.ts
|   |   |   +-- use-exam-session.ts
|   |   |   +-- use-timer.ts
|   |   |   +-- use-anti-cheat.ts
|   |   |   +-- use-notifications.ts
|   |   |   +-- use-debounce.ts
|   |   |   +-- use-media-query.ts
|   |   +-- lib/
|   |   |   +-- prisma.ts              # Prisma client singleton
|   |   |   +-- redis.ts               # Redis client singleton
|   |   |   +-- auth.ts                # NextAuth config
|   |   |   +-- api-response.ts        # Standardized API responses
|   |   |   +-- api-error.ts           # API error handler
|   |   |   +-- rate-limit.ts          # Rate limiting utility
|   |   |   +-- validators.ts          # Shared Zod schemas
|   |   |   +-- constants.ts           # App-wide constants
|   |   |   +-- utils.ts               # General utilities (cn, formatDate, etc.)
|   |   |   +-- scoring.ts             # Score calculation utilities
|   |   +-- types/
|   |       +-- api.types.ts           # API request/response types
|   |       +-- exam.types.ts
|   |       +-- user.types.ts
|   |       +-- payment.types.ts
|   |       +-- planner.types.ts
|   +-- config/
|       +-- site.config.ts             # Site metadata, URLs
|       +-- exam-categories.config.ts  # Category definitions
|       +-- navigation.config.ts       # Menu/nav structure
+-- prisma/
|   +-- schema.prisma                  # (symlink or copy from src)
+-- public/
|   +-- images/
|   +-- icons/
|   +-- manifest.json                  # PWA manifest
|   +-- sw.js                          # Service worker (push notifications)
+-- tests/
|   +-- unit/
|   +-- integration/
|   +-- e2e/
+-- scripts/
|   +-- seed.ts
|   +-- backup.sh
+-- .env.example
+-- .env.local
+-- .gitignore
+-- package.json
+-- tsconfig.json
+-- tailwind.config.ts
+-- next.config.ts
```

---

## 8. Database Schema

### Entity Relationship Overview
```
User ---< ExamAttempt >--- ExamPackage ---< ExamSection >--- ExamSectionQuestion --- Question
 |                              |
 |--- UserCredit               |--- Transaction
 |--- StudyPlan ---< StudyTask
 |--- Notification
 |--- TeacherProfile ---< TeacherEarning ---< PayoutRequest
 |
 +--- PushSubscription

ExamCategory ---< ExamSubCategory ---< Subject ---< Topic ---< Question
```

### Full Schema (Prisma)

```prisma
// ============================================================
// ENUMS
// ============================================================

enum UserRole {
  SUPER_ADMIN
  ADMIN
  TEACHER
  STUDENT
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  TRUE_FALSE
  NUMERIC
}

enum QuestionStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
}

enum QuestionDifficulty {
  VERY_EASY
  EASY
  MEDIUM
  HARD
  VERY_HARD
}

enum ExamPackageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum AttemptStatus {
  IN_PROGRESS
  COMPLETED
  TIMED_OUT
  ABANDONED
}

enum TransactionStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
  REFUNDED
}

enum PaymentMethod {
  QRIS
  BANK_TRANSFER
  EWALLET
  CREDIT_CARD
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
}

enum NotificationType {
  STUDY_REMINDER
  EXAM_DEADLINE
  SCORE_UPDATE
  PAYMENT_SUCCESS
  PACKAGE_NEW
  QUESTION_STATUS
  SYSTEM
}

enum NotificationChannel {
  IN_APP
  EMAIL
  PUSH
}

enum CreditType {
  FREE_SIGNUP
  PURCHASE
  REFUND
  USAGE
  BONUS
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ============================================================
// USER & AUTH
// ============================================================

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  emailVerified  DateTime?
  passwordHash   String?
  name           String
  avatar         String?
  phone          String?      @unique
  role           UserRole     @default(STUDENT)
  status         UserStatus   @default(ACTIVE)
  lastLoginAt    DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Relations
  accounts       Account[]
  sessions       Session[]
  profile        UserProfile?
  teacherProfile TeacherProfile?
  attempts       ExamAttempt[]
  transactions   Transaction[]
  credits        UserCredit?
  creditHistory  CreditHistory[]
  studyPlans     StudyPlan[]
  notifications  Notification[]
  pushSubs       PushSubscription[]
  articles       Article[]
  bookmarks      QuestionBookmark[]
  auditLogs      AuditLog[]

  @@index([email])
  @@index([role])
  @@index([status])
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refreshToken      String?
  accessToken       String?
  expiresAt         Int?
  tokenType         String?
  scope             String?
  idToken           String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model UserProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  school       String?
  city         String?
  birthDate    DateTime?
  targetExam   String?
  bio          String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

// ============================================================
// TEACHER
// ============================================================

model TeacherProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  education       String
  specialization  String[]
  institution     String?
  bio             String?
  isVerified      Boolean   @default(false)
  verifiedAt      DateTime?
  bankName        String?
  bankAccount     String?
  bankHolder      String?
  totalEarnings   Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  earnings TeacherEarning[]
  payouts  PayoutRequest[]

  @@map("teacher_profiles")
}

model TeacherEarning {
  id               String   @id @default(cuid())
  teacherProfileId String
  questionId       String
  amount           Int
  attemptCount     Int
  period           String
  createdAt        DateTime @default(now())

  teacherProfile TeacherProfile @relation(fields: [teacherProfileId], references: [id])
  question       Question       @relation(fields: [questionId], references: [id])

  @@unique([teacherProfileId, questionId, period])
  @@map("teacher_earnings")
}

model PayoutRequest {
  id               String       @id @default(cuid())
  teacherProfileId String
  amount           Int
  bankName         String
  bankAccount      String
  bankHolder       String
  status           PayoutStatus @default(PENDING)
  processedAt      DateTime?
  processedBy      String?
  rejectionReason  String?
  createdAt        DateTime     @default(now())

  teacherProfile TeacherProfile @relation(fields: [teacherProfileId], references: [id])

  @@index([status])
  @@map("payout_requests")
}

// ============================================================
// EXAM CATEGORIES
// ============================================================

model ExamCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subCategories ExamSubCategory[]
  packages      ExamPackage[]
  studyPlans    StudyPlan[]

  @@map("exam_categories")
}

model ExamSubCategory {
  id         String   @id @default(cuid())
  categoryId String
  name       String
  slug       String
  order      Int      @default(0)
  createdAt  DateTime @default(now())

  category ExamCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  subjects Subject[]

  @@unique([categoryId, slug])
  @@map("exam_sub_categories")
}

model Subject {
  id              String   @id @default(cuid())
  subCategoryId   String
  name            String
  slug            String
  order           Int      @default(0)
  createdAt       DateTime @default(now())

  subCategory ExamSubCategory @relation(fields: [subCategoryId], references: [id], onDelete: Cascade)
  topics      Topic[]
  sections    ExamSection[]

  @@unique([subCategoryId, slug])
  @@map("subjects")
}

model Topic {
  id        String   @id @default(cuid())
  subjectId String
  name      String
  slug      String
  order     Int      @default(0)
  createdAt DateTime @default(now())

  subject   Subject    @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  questions Question[]

  @@unique([subjectId, slug])
  @@map("topics")
}

// ============================================================
// QUESTIONS
// ============================================================

model Question {
  id          String             @id @default(cuid())
  topicId     String
  createdById String
  type        QuestionType       @default(SINGLE_CHOICE)
  status      QuestionStatus     @default(DRAFT)
  difficulty  QuestionDifficulty @default(MEDIUM)
  content     String
  explanation String?
  source      String?
  year        Int?
  imageUrl    String?
  metadata    Json?
  usageCount  Int                @default(0)
  correctRate Float              @default(0)
  reviewedBy  String?
  reviewedAt  DateTime?
  reviewNote  String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  topic           Topic                 @relation(fields: [topicId], references: [id])
  options         QuestionOption[]
  sectionItems    ExamSectionQuestion[]
  answers         ExamAnswer[]
  bookmarks       QuestionBookmark[]
  teacherEarnings TeacherEarning[]

  @@index([topicId])
  @@index([status])
  @@index([createdById])
  @@index([type, difficulty])
  @@map("questions")
}

model QuestionOption {
  id         String  @id @default(cuid())
  questionId String
  label      String
  content    String
  imageUrl   String?
  isCorrect  Boolean @default(false)
  order      Int     @default(0)

  question Question     @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answers  ExamAnswer[]

  @@map("question_options")
}

model QuestionBookmark {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  createdAt  DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@map("question_bookmarks")
}

// ============================================================
// EXAM PACKAGES
// ============================================================

model ExamPackage {
  id              String            @id @default(cuid())
  categoryId      String
  title           String
  slug            String            @unique
  description     String?
  price           Int               @default(0)
  discountPrice   Int?
  durationMinutes Int
  totalQuestions  Int
  passingScore    Int?
  isFree          Boolean           @default(false)
  isAntiCheat     Boolean           @default(true)
  status          ExamPackageStatus @default(DRAFT)
  startDate       DateTime?
  endDate         DateTime?
  maxAttempts     Int               @default(1)
  createdById     String
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  category     ExamCategory   @relation(fields: [categoryId], references: [id])
  sections     ExamSection[]
  attempts     ExamAttempt[]
  transactions Transaction[]
  leaderboard  LeaderboardEntry[]

  @@index([categoryId])
  @@index([status])
  @@index([isFree])
  @@map("exam_packages")
}

model ExamSection {
  id              String @id @default(cuid())
  packageId       String
  subjectId       String
  title           String
  durationMinutes Int
  totalQuestions  Int
  order           Int    @default(0)

  package   ExamPackage           @relation(fields: [packageId], references: [id], onDelete: Cascade)
  subject   Subject               @relation(fields: [subjectId], references: [id])
  questions ExamSectionQuestion[]

  @@map("exam_sections")
}

model ExamSectionQuestion {
  id         String @id @default(cuid())
  sectionId  String
  questionId String
  order      Int    @default(0)

  section  ExamSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id])

  @@unique([sectionId, questionId])
  @@index([sectionId, order])
  @@map("exam_section_questions")
}

// ============================================================
// EXAM ATTEMPTS & ANSWERS
// ============================================================

model ExamAttempt {
  id              String        @id @default(cuid())
  userId          String
  packageId       String
  status          AttemptStatus @default(IN_PROGRESS)
  score           Float?
  totalCorrect    Int?
  totalIncorrect  Int?
  totalUnanswered Int?
  percentile      Float?
  startedAt       DateTime      @default(now())
  finishedAt      DateTime?
  serverStartedAt DateTime      @default(now())
  serverDeadline  DateTime
  violations      Int           @default(0)
  metadata        Json?

  user        User               @relation(fields: [userId], references: [id])
  package     ExamPackage        @relation(fields: [packageId], references: [id])
  answers     ExamAnswer[]
  tabEvents   TabViolationEvent[]
  leaderboard LeaderboardEntry?

  @@index([userId])
  @@index([packageId])
  @@index([status])
  @@index([userId, packageId])
  @@map("exam_attempts")
}

model ExamAnswer {
  id               String   @id @default(cuid())
  attemptId        String
  questionId       String
  selectedOptionId String?
  selectedOptions  String[]
  numericAnswer    Float?
  isCorrect        Boolean?
  timeSpentSeconds Int      @default(0)
  isFlagged        Boolean  @default(false)
  answeredAt       DateTime @default(now())

  attempt  ExamAttempt     @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question        @relation(fields: [questionId], references: [id])
  option   QuestionOption? @relation(fields: [selectedOptionId], references: [id])

  @@unique([attemptId, questionId])
  @@map("exam_answers")
}

model TabViolationEvent {
  id        String   @id @default(cuid())
  attemptId String
  type      String
  timestamp DateTime @default(now())
  details   String?

  attempt ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)

  @@map("tab_violation_events")
}

// ============================================================
// LEADERBOARD
// ============================================================

model LeaderboardEntry {
  id        String   @id @default(cuid())
  packageId String
  userId    String
  attemptId String   @unique
  score     Float
  rank      Int?
  createdAt DateTime @default(now())

  package ExamPackage @relation(fields: [packageId], references: [id])
  user    User        @relation(fields: [userId], references: [id])
  attempt ExamAttempt @relation(fields: [attemptId], references: [id])

  @@unique([packageId, userId])
  @@index([packageId, score(sort: Desc)])
  @@map("leaderboard_entries")
}

// ============================================================
// PAYMENTS & CREDITS
// ============================================================

model Transaction {
  id            String            @id @default(cuid())
  userId        String
  packageId     String?
  amount        Int
  paymentMethod PaymentMethod?
  status        TransactionStatus @default(PENDING)
  midtransId    String?           @unique
  midtransUrl   String?
  snapToken     String?
  paidAt        DateTime?
  expiredAt     DateTime?
  metadata      Json?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  user    User         @relation(fields: [userId], references: [id])
  package ExamPackage? @relation(fields: [packageId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([midtransId])
  @@map("transactions")
}

model UserCredit {
  id          String   @id @default(cuid())
  userId      String   @unique
  balance     Int      @default(0)
  freeCredits Int      @default(0)
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_credits")
}

model CreditHistory {
  id          String     @id @default(cuid())
  userId      String
  amount      Int
  type        CreditType
  description String?
  referenceId String?
  createdAt   DateTime   @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("credit_history")
}

// ============================================================
// SCHEDULE PLANNER
// ============================================================

model StudyPlan {
  id             String    @id @default(cuid())
  userId         String
  categoryId     String?
  title          String
  description    String?
  targetDate     DateTime?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  category ExamCategory? @relation(fields: [categoryId], references: [id])
  tasks    StudyTask[]

  @@index([userId])
  @@map("study_plans")
}

model StudyTask {
  id          String    @id @default(cuid())
  planId      String
  title       String
  description String?
  date        DateTime
  startTime   String?
  duration    Int?
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  priority    Int       @default(0)
  repeatRule  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  plan StudyPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([planId, date])
  @@map("study_tasks")
}

// ============================================================
// NOTIFICATIONS
// ============================================================

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  channel   NotificationChannel @default(IN_APP)
  title     String
  message   String
  data      Json?
  isRead    Boolean          @default(false)
  readAt    DateTime?
  sentAt    DateTime         @default(now())
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, type])
  @@map("notifications")
}

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("push_subscriptions")
}

// ============================================================
// BLOG / ARTICLES
// ============================================================

model Article {
  id          String        @id @default(cuid())
  authorId    String
  title       String
  slug        String        @unique
  content     String
  excerpt     String?
  coverImage  String?
  category    String?
  tags        String[]
  status      ArticleStatus @default(DRAFT)
  publishedAt DateTime?
  viewCount   Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  author User @relation(fields: [authorId], references: [id])

  @@index([status, publishedAt])
  @@index([slug])
  @@map("articles")
}

// ============================================================
// AUDIT LOG
// ============================================================

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String
  entityId  String?
  oldData   Json?
  newData   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 9. API Design

### API Conventions
- All API routes under `/api/`
- RESTful naming: `GET /api/packages`, `POST /api/exam/start`
- Standardized response format:
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}

// Error
{
  "success": false,
  "error": {
    "code": "EXAM_NOT_FOUND",
    "message": "Exam package not found",
    "details": {}
  }
}
```

### API Endpoint Map

#### Auth
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/[...nextauth] | NextAuth handlers | No |
| GET | /api/auth/me | Get current user | Yes |

#### Exam Packages
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/packages | List packages (with filters) | No |
| GET | /api/packages/:id | Package detail | No |
| POST | /api/packages | Create package | Admin |
| PUT | /api/packages/:id | Update package | Admin |
| DELETE | /api/packages/:id | Archive package | Admin |

#### Exam Session
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/exam/start | Start exam attempt | Student |
| POST | /api/exam/answer | Save/update answer | Student |
| POST | /api/exam/flag | Flag question | Student |
| POST | /api/exam/submit | Submit exam | Student |
| GET | /api/exam/result/:attemptId | Get result | Student |
| POST | /api/exam/violation | Report tab violation | Student |

#### Leaderboard
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/leaderboard/:packageId | Package leaderboard | No |
| GET | /api/leaderboard/global | Global leaderboard | No |

#### Questions (Teacher)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/teacher/questions | My questions | Teacher |
| POST | /api/teacher/questions | Submit question | Teacher |
| PUT | /api/teacher/questions/:id | Edit question | Teacher |
| DELETE | /api/teacher/questions/:id | Delete draft | Teacher |

#### Questions (Admin)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/admin/questions | Moderation queue | Admin |
| POST | /api/admin/questions/:id/review | Approve/reject | Admin |
| POST | /api/admin/questions/import | Bulk import | Admin |

#### Teacher Earnings
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/teacher/earnings | Earnings summary | Teacher |
| POST | /api/teacher/payout | Request payout | Teacher |

#### Admin Payouts
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/admin/payouts | Payout requests | Admin |
| POST | /api/admin/payouts/:id/process | Process payout | Admin |

#### Payment
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/payment/create | Create transaction | Student |
| POST | /api/payment/webhook | Midtrans webhook | No (verified) |
| GET | /api/payment/history | Payment history | Student |

#### Planner
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/planner/plans | List study plans | Student |
| POST | /api/planner/plans | Create plan | Student |
| PUT | /api/planner/plans/:id | Update plan | Student |
| DELETE | /api/planner/plans/:id | Delete plan | Student |
| GET | /api/planner/tasks | List tasks (by date range) | Student |
| POST | /api/planner/tasks | Create task | Student |
| PUT | /api/planner/tasks/:id | Update task | Student |
| PATCH | /api/planner/tasks/:id/complete | Toggle complete | Student |

#### Notifications
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/notifications | List notifications | Yes |
| PATCH | /api/notifications/:id/read | Mark as read | Yes |
| POST | /api/notifications/push/subscribe | Subscribe push | Yes |
| PUT | /api/notifications/preferences | Update prefs | Yes |

#### Blog
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/articles | List articles | No |
| GET | /api/articles/:slug | Article detail | No |
| POST | /api/admin/articles | Create article | Admin |
| PUT | /api/admin/articles/:id | Update article | Admin |

#### Admin Analytics
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/admin/analytics/overview | Dashboard stats | Admin |
| GET | /api/admin/analytics/revenue | Revenue report | Admin |
| GET | /api/admin/analytics/users | User stats | Admin |

---

## 10. UI/UX Guidelines

### Design Principles
1. **Clean and minimal** — no visual clutter, generous whitespace
2. **Professional** — trustworthy, premium feel (users are paying)
3. **No emoji in UI** — use Lucide icons (premium, consistent)
4. **Mobile-first** — majority of users are on mobile
5. **Accessible** — WCAG 2.1 AA compliance
6. **Fast** — skeleton loaders, optimistic UI, minimal layout shifts

### Color System
```
Primary:     Blue (#2563EB)      — trust, education, professionalism
Secondary:   Slate (#475569)     — neutral, clean
Accent:      Amber (#F59E0B)     — CTAs, highlights, urgency
Success:     Emerald (#10B981)   — correct answers, positive feedback
Danger:      Rose (#F43F5E)      — wrong answers, errors, warnings
Background:  White (#FFFFFF)     — clean, minimal
Surface:     Slate-50 (#F8FAFC)  — cards, sections
Text:        Slate-900 (#0F172A) — primary text
Text Muted:  Slate-500 (#64748B) — secondary text
Border:      Slate-200 (#E2E8F0) — subtle borders
```

### Typography
```
Font Family:  Inter (headings + body) — clean, modern, excellent readability
Mono:         JetBrains Mono (code/numbers in scores)
Scale:
  - h1: 2.25rem (36px), font-bold
  - h2: 1.875rem (30px), font-semibold
  - h3: 1.5rem (24px), font-semibold
  - h4: 1.25rem (20px), font-medium
  - body: 1rem (16px), font-normal
  - small: 0.875rem (14px), font-normal
  - caption: 0.75rem (12px), font-medium
```

### Icon System
- **Library:** Lucide Icons (https://lucide.dev)
- Consistent stroke width: 1.5px
- Size variants: 16px (inline), 20px (default), 24px (large), 32px (hero)
- Never use emoji as icons

### Spacing System
- Base unit: 4px
- Spacing scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 (Tailwind default)
- Card padding: 24px (p-6)
- Section gap: 32px (gap-8)
- Page max-width: 1280px (max-w-7xl)

### Component Patterns

**Cards**: rounded-xl, border, shadow-sm, hover:shadow-md transition
**Buttons**: rounded-lg, font-medium, clear hierarchy (primary/secondary/ghost)
**Inputs**: rounded-lg, border, focus:ring-2, clear labels
**Tables**: clean lines, alternating row colors on hover
**Modals**: centered, overlay blur, max-w-lg
**Toast**: bottom-right, auto-dismiss 5s, icon + message

### Page Layouts

**Public Pages (Marketing)**
```
+----------------------------------------------+
| Header: Logo | Nav | Login/Register          |
+----------------------------------------------+
| Hero Section                                  |
+----------------------------------------------+
| Content Sections                              |
+----------------------------------------------+
| Footer: Links | Legal | Social               |
+----------------------------------------------+
```

**Dashboard Pages (Authenticated)**
```
+------+---------------------------------------+
|      |  Topbar: Breadcrumb | Notif | Avatar  |
| Side |---------------------------------------+
| bar  |  Page Content                         |
|      |                                       |
| Nav  |  [Cards / Tables / Charts]            |
|      |                                       |
+------+---------------------------------------+
```
- Sidebar collapses to bottom nav on mobile
- Sidebar width: 280px (expanded), 64px (collapsed)

**Exam Session (Fullscreen)**
```
+----------------------------------------------+
| Timer | Package Title | Question X of Y | End|
+----------------------------------------------+
| Question Content          | Question Nav     |
|                           | [1][2][3][4]...  |
| [A] Option text           | [answered]       |
| [B] Option text           | [flagged]        |
| [C] Option text           | [current]        |
| [D] Option text           | [unanswered]     |
|                           |                  |
| [Flag] [Prev] [Next]     | [Submit]         |
+----------------------------------------------+
```
- Question nav: colored indicators (green=answered, yellow=flagged, gray=unanswered, blue=current)
- On mobile: question nav becomes a collapsible bottom sheet

---

## 11. Security by Design

### Authentication Security
- Password hashing: Argon2id (memory-hard, resistant to GPU attacks)
- Password requirements: minimum 8 chars, at least 1 uppercase, 1 number
- Account lockout: 5 failed attempts -> 15min lockout (progressive)
- Session tokens: cryptographically random, stored in httpOnly secure cookies
- Refresh token rotation: new refresh token on every use, old one invalidated
- JWT access tokens: short-lived (15 minutes), signed with RS256
- CSRF protection: double-submit cookie pattern
- OAuth state parameter validation

### Authorization Security
- Role-Based Access Control (RBAC) enforced at API layer
- Middleware-based auth checks on all protected routes
- Resource-level authorization (users can only access their own data)
- Admin actions require re-authentication for sensitive operations
- API route protection pattern:
```typescript
// Every protected route uses this pattern
export async function POST(req: Request) {
  const session = await requireAuth(req);          // throws 401
  requireRole(session, [UserRole.ADMIN]);           // throws 403
  // ... handler logic
}
```

### Input Validation & Sanitization
- All inputs validated with Zod schemas (server-side, always)
- Client-side validation mirrors server-side (for UX only, never trusted)
- HTML content sanitized with DOMPurify before storage and rendering
- SQL injection: impossible via Prisma parameterized queries
- File uploads: type validation, size limits, virus scanning (ClamAV, phase 2)
- Rich text content: whitelist allowed HTML tags/attributes

### XSS Prevention
- React auto-escapes by default (JSX)
- Content Security Policy (CSP) headers
- No `dangerouslySetInnerHTML` without sanitization
- HttpOnly cookies (inaccessible to JavaScript)
- Strict CSP: `script-src 'self'; style-src 'self' 'unsafe-inline'`

### API Security
- Rate limiting per endpoint:
  - Auth endpoints: 5 requests/minute per IP
  - General API: 100 requests/minute per user
  - Exam submission: 1 request/5 seconds per user
  - Payment webhook: IP whitelist (Midtrans IPs only)
- Request size limits: 1MB default, 10MB for file uploads
- CORS: strict origin whitelist
- Helmet.js security headers
- API versioning via URL prefix (future-proofing)

### Exam Anti-Cheat Security (Server-Side)
- Server-side time tracking (client timer is display only)
- Server deadline stored in DB at exam start
- Auto-submit triggered by server if deadline passes
- Answer timestamp validation (reject answers after deadline)
- Tab violation events logged server-side
- Rate limit on answer submissions (prevent automated answering)
- Question order randomization per attempt
- Option order randomization per question
- No correct answers sent to client during exam
- Exam session bound to single device (session fingerprint)

### Payment Security
- Midtrans webhook signature verification (SHA-512)
- Webhook endpoint IP whitelist
- Idempotent payment processing (prevent double-charge)
- Transaction amount validation server-side
- No client-side price manipulation possible
- Payment status verified via Midtrans API (not just webhook)

### Data Security
- Sensitive data encrypted at rest (passwords, payment tokens)
- PII fields identified and handled per Indonesian data protection laws
- Database connection over SSL
- MinIO access with pre-signed URLs (time-limited)
- Environment variables for all secrets (never in code)
- `.env` files in `.gitignore`
- Audit log for all admin actions

### Infrastructure Security
- Docker containers run as non-root user
- Network isolation: only Nginx exposed to public
- PostgreSQL: no public access, internal Docker network only
- Redis: password-protected, internal network only
- MinIO: internal network only, accessed via pre-signed URLs
- Regular dependency updates (npm audit)
- Security headers via Nginx:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Backup & Recovery
- Automated daily PostgreSQL backups (pg_dump)
- Backup stored in MinIO (separate bucket) and optionally offsite
- Point-in-time recovery capability via WAL archiving
- Backup restoration tested monthly
- Retention: 30 daily backups, 12 monthly backups

---

## 12. Payment System

### Flow Overview
```
Student selects package
  -> POST /api/payment/create
    -> Validate package exists, user authenticated
    -> Check if user already has access (prevent duplicate purchase)
    -> Create Transaction record (status: PENDING)
    -> Call Midtrans Snap API -> get snap_token + redirect_url
    -> Return snap_token to client

Client opens Midtrans Snap payment popup
  -> User completes payment

Midtrans sends webhook
  -> POST /api/payment/webhook
    -> Verify signature (SHA-512 with server key)
    -> Verify IP whitelist
    -> Find transaction by midtrans_id
    -> Idempotency check (skip if already processed)
    -> Update transaction status
    -> If PAID: grant access (add credit or unlock package)
    -> Send confirmation email (via BullMQ job)
    -> Send in-app notification
```

### Pricing Structure
| Tier | Price | Access |
|------|-------|--------|
| Free (signup bonus) | Rp 0 | 2 free try-outs (any category) |
| Single Package | Rp 25,000 - 50,000 | 1 try-out attempt |
| Bundle (5 packages) | Rp 99,000 | 5 try-outs (any mix) |
| Bundle (10 packages) | Rp 179,000 | 10 try-outs (any mix) |
| Monthly Unlimited | Rp 149,000/month | Unlimited all categories |
| Yearly Unlimited | Rp 999,000/year | Unlimited all categories |

### Credit System
- New user signup: +2 free credits
- Each free try-out costs 1 credit
- Purchased packages: direct access (no credit deduction)
- Subscription: bypass credit system entirely
- Referral bonus: +1 credit per successful referral (phase 2)

---

## 13. SEO Strategy

### Technical SEO
- Server-side rendering (Next.js SSR) for all public pages
- Dynamic sitemap.xml generation
- robots.txt configuration
- Canonical URLs on all pages
- Open Graph + Twitter Card meta tags
- JSON-LD structured data (Course, FAQ, Article schemas)
- Image optimization (Next.js Image component)
- Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Clean URL structure (no query params for main content)

### URL Structure
```
/                           -> Homepage
/tryout-utbk                -> UTBK landing page
/tryout-cpns                -> CPNS landing page
/tryout-bumn                -> BUMN landing page
/tryout-kedinasan           -> Kedinasan landing page
/tryout-pppk                -> PPPK landing page
/packages                   -> All packages listing
/packages/[slug]            -> Package detail
/blog                       -> Blog listing
/blog/[slug]                -> Article
/pricing                    -> Pricing page
/faq                        -> FAQ page
/about                      -> About page
/leaderboard                -> Public leaderboard
```

### Target Keywords
| Primary | Secondary |
|---------|-----------|
| tryout utbk online | simulasi utbk 2026 gratis |
| latihan soal cpns | tryout cat cpns online |
| tryout bumn online | latihan tes bumn |
| tryout kedinasan | soal stan online |
| simulasi ujian online | latihan soal gratis |

### Content Strategy
- Weekly blog posts: tips, strategi, jadwal ujian, info pendaftaran
- Landing page per exam category with unique, valuable content
- FAQ page with schema markup
- User testimonials and score improvements
- Exam calendar/schedule page (high search volume)

---

## 14. Teacher Marketplace

### Teacher Onboarding Flow
```
Teacher registers
  -> Fill profile: education, specialization, institution
  -> Submit verification documents (KTP, ijazah, sertifikat)
  -> Admin reviews and verifies (manual, phase 1)
  -> Once verified: can submit questions
```

### Revenue Sharing Model
- Base rate: Rp 500 per question per student attempt
- Quality bonus: +20% if question rating > 4.5/5
- Volume bonus: +10% after 100 approved questions
- Payment threshold: minimum Rp 100,000 for payout
- Payout schedule: monthly (1st week of each month)
- Payout method: bank transfer

### Question Submission Workflow
```
Teacher creates question
  -> Status: DRAFT (can edit freely)
  -> Teacher submits for review -> Status: PENDING_REVIEW
  -> Admin reviews:
    -> APPROVED: question enters the pool, starts earning
    -> REJECTED: with feedback notes, teacher can revise and resubmit
```

### Teacher Dashboard Metrics
- Total questions submitted / approved / rejected
- Total earnings (all time / this month)
- Average question rating
- Most popular questions (by attempt count)
- Earnings per question breakdown

---

## 15. Anti-Cheat System

### Client-Side Detection (JavaScript)
```
Features (all toggleable per package):
1. Fullscreen enforcement (Fullscreen API)
   - Request fullscreen on exam start
   - Detect fullscreen exit -> warning + log event
   - After 3 exits: auto-submit exam

2. Tab switch detection (Page Visibility API)
   - document.visibilitychange event
   - Detect tab switch or window blur
   - Log each event with timestamp
   - Warning overlay on return
   - Configurable max violations before auto-submit

3. Copy-paste prevention
   - Disable right-click context menu on exam page
   - Disable Ctrl+C, Ctrl+V, Ctrl+A
   - Disable text selection on question content

4. DevTools detection
   - Detect window resize patterns (devtools open)
   - Console.log tricks (toString override)
   - Disabled by default, opt-in per package

5. Screenshot prevention (best-effort)
   - CSS: user-select: none
   - Print media query: hide content
```

### Server-Side Validation
```
1. Time integrity
   - Server records start time and calculates deadline
   - All answer timestamps validated against server time
   - Client timer is cosmetic only
   - Reject answers submitted after server deadline

2. Session binding
   - One active attempt per user per package
   - Attempt bound to session (prevent sharing)
   - Concurrent session detection

3. Answer pattern analysis (phase 2)
   - Detect impossibly fast answer sequences
   - Detect identical answer patterns between users
   - Flag suspicious attempts for review

4. Rate limiting
   - Max 1 answer save per 2 seconds
   - Max 1 exam start per 10 seconds
```

### Violation Handling
| Violation Count | Action |
|----------------|--------|
| 1 | Warning overlay with "Return to exam" |
| 2 | Second warning with violation count displayed |
| 3 | Final warning: "Next violation will end your exam" |
| 4+ | Auto-submit exam, mark as violation in results |

---

## 16. Notification & Reminder System

### Channels
| Channel | Technology | Use Case |
|---------|-----------|----------|
| In-App | Database + WebSocket (phase 2) / polling | All notifications |
| Email | Resend API / Nodemailer | Payment, reminders, weekly digest |
| Push | Web Push API (VAPID) | Study reminders, score updates |

### Notification Types & Default Channels
| Type | In-App | Email | Push |
|------|--------|-------|------|
| Study Reminder | yes | no | yes |
| Exam Registration Deadline | yes | yes | yes |
| Score/Ranking Update | yes | no | yes |
| Payment Confirmation | yes | yes | no |
| New Package Available | yes | no | no |
| Teacher: Question Status | yes | yes | no |
| Weekly Digest | no | yes | no |
| System Announcement | yes | yes | no |

### Reminder Scheduling
- BullMQ scheduled jobs for recurring reminders
- User sets reminder time in schedule planner
- System generates jobs based on user timezone
- Exam deadline reminders: auto-generated from exam calendar data
  - 30 days before, 7 days before, 1 day before

---

## 17. Deployment (Docker on VPS)

### Docker Compose Stack
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres, redis, minio]
    networks: [internal]
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: examplatform
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    networks: [internal]
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes: ["redisdata:/data"]
    networks: [internal]
    restart: unless-stopped

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes: ["miniodata:/data"]
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    networks: [internal]
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - certbot-data:/var/www/certbot
    depends_on: [app]
    networks: [internal]
    restart: unless-stopped

  # Background job worker (same app image, different command)
  worker:
    build: .
    command: node dist/worker.js
    env_file: .env
    depends_on: [postgres, redis]
    networks: [internal]
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
  miniodata:
  certbot-data:

networks:
  internal:
    driver: bridge
```

### Dockerfile
```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Deployment Commands
```bash
# Initial setup on VPS
git clone <repo> /opt/examplatform
cd /opt/examplatform
cp .env.example .env   # Edit with production values

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose exec app npx prisma migrate deploy

# Seed initial data (exam categories, admin user)
docker compose exec app npx prisma db seed

# SSL setup with Certbot
docker run --rm -v certbot-data:/var/www/certbot \
  -v ./nginx/ssl:/etc/letsencrypt \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot -d toutopia.id

# View logs
docker compose logs -f app

# Backup database
docker compose exec postgres pg_dump -U $DB_USER examplatform > backup.sql
```

---

## 18. Performance & Scalability

### Caching Strategy
| Data | Cache Location | TTL | Invalidation |
|------|---------------|-----|-------------|
| Exam categories | Redis | 24h | On admin update |
| Package listings | Redis | 1h | On publish/archive |
| Leaderboard | Redis sorted set | 5min | On new score |
| User session | Redis | 24h | On logout |
| Static pages | Nginx | 1h | On deploy |
| Question content | Redis | 6h | On edit |

### Database Optimization
- Indexed columns: all foreign keys, status fields, frequently filtered columns
- Pagination: cursor-based for large datasets (leaderboard, questions)
- Query optimization: select only needed fields, avoid N+1
- Connection pooling: Prisma connection pool (default 10, configurable)
- Read replicas (phase 3, if needed)

### Frontend Performance
- Next.js static generation for public pages
- Dynamic imports for heavy components (charts, editor)
- Image optimization via Next.js Image
- Font optimization: `next/font` with Inter
- Bundle analysis and code splitting
- Service worker for offline capability (PWA)

---

## 19. Monitoring & Logging

### Stack
- **Prometheus**: metrics collection (Node.js + custom metrics)
- **Grafana**: dashboards and alerting
- **Loki**: log aggregation
- **Pino**: structured JSON logging in application

### Key Metrics
- Request count and latency (p50, p95, p99)
- Error rate by endpoint
- Active exam sessions
- Payment success/failure rate
- Database query performance
- Redis hit/miss ratio
- Container resource usage (CPU, memory)

### Alerts
- Error rate > 5% for 5 minutes
- Response time p95 > 2 seconds
- Database connection pool exhausted
- Redis memory > 80%
- Disk usage > 85%
- Payment webhook failures
- SSL certificate expiring in < 14 days

### Application Logging
```
Levels: error, warn, info, debug
Format: JSON (structured)
Fields: timestamp, level, message, requestId, userId, action, duration, error
Retention: 30 days in Loki, 7 days in container logs
```

---

## 20. Development Phases

### Phase 1 — Foundation (Week 1-4)
- [ ] Project setup: Next.js, TypeScript, Tailwind, Docker
- [ ] Database schema, Prisma setup, migrations
- [ ] Authentication: email/password, Google OAuth
- [ ] User roles and RBAC middleware
- [ ] Basic UI: layout, navigation, shadcn components
- [ ] Landing page (homepage)
- [ ] Exam categories and package listing
- [ ] Admin panel: user management, exam category management

### Phase 2 — Core Exam System (Week 5-8)
- [ ] Question model and admin CRUD
- [ ] Question editor (rich text + KaTeX)
- [ ] Exam package creation (admin)
- [ ] Exam session: start, answer, submit
- [ ] Anti-cheat: tab detection, fullscreen mode
- [ ] Server-side time validation
- [ ] Scoring engine
- [ ] Result page with breakdown
- [ ] Leaderboard

### Phase 3 — Payment & Access Control (Week 9-10)
- [ ] Midtrans integration (Snap API)
- [ ] Payment webhook handler
- [ ] Credit system (free signup credits)
- [ ] Package access validation
- [ ] Payment history page
- [ ] Admin: transaction management

### Phase 4 — Teacher Marketplace (Week 11-12)
- [ ] Teacher registration and verification flow
- [ ] Teacher question submission
- [ ] Admin moderation queue
- [ ] Teacher earnings calculation
- [ ] Payout request system
- [ ] Teacher dashboard

### Phase 5 — Planner & Notifications (Week 13-14)
- [ ] Schedule planner: calendar, tasks, drag-and-drop
- [ ] Study plan templates
- [ ] In-app notification system
- [ ] Email notifications (Resend)
- [ ] Web push notifications
- [ ] Reminder scheduling (BullMQ)

### Phase 6 — Analytics & SEO (Week 15-16)
- [ ] Student analytics: score trends, radar chart, weakness analysis
- [ ] Admin analytics: revenue, user growth, popular packages
- [ ] SEO landing pages per category
- [ ] Blog/article system
- [ ] Sitemap, robots.txt, structured data
- [ ] Open Graph images

### Phase 7 — Polish & Launch (Week 17-18)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Bug fixes and edge cases
- [ ] Monitoring setup (Prometheus + Grafana)
- [ ] Backup automation
- [ ] Production deployment
- [ ] Soft launch (beta testers)

### Phase 8 — Post-Launch
- [ ] User feedback collection
- [ ] Question import (bulk CSV)
- [ ] Mobile optimization (PWA)
- [ ] Referral system
- [ ] Advanced anti-cheat (pattern analysis)
- [ ] Video explanations
- [ ] AI-powered recommendations

---

## Appendix: Environment Variables

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://toutopia.id
NEXTAUTH_SECRET=<random-64-chars>
NEXTAUTH_URL=https://toutopia.id

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/examplatform

# Redis
REDIS_URL=redis://:password@redis:6379

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=<key>
MINIO_SECRET_KEY=<secret>
MINIO_BUCKET=uploads

# Google OAuth
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>

# Midtrans
MIDTRANS_SERVER_KEY=<key>
MIDTRANS_CLIENT_KEY=<key>
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_WEBHOOK_IP_WHITELIST=<ips>

# Email
RESEND_API_KEY=<key>
EMAIL_FROM=noreply@toutopia.id

# Push Notifications
VAPID_PUBLIC_KEY=<key>
VAPID_PRIVATE_KEY=<key>
VAPID_SUBJECT=mailto:admin@toutopia.id

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```
