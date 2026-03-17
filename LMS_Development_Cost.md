# LearnHub LMS — Development Cost Proposal
**Project:** Full-Featured Learning Management System (MERN Stack)**
**Prepared:** February 2026
**Stack:** MongoDB · Express · React · Node.js

---

## Developer Rate Reference

| Level | Hourly Rate |
|---|---|
| Junior Full-Stack Developer | $25 – $40 / hr |
| Mid-Level Full-Stack Developer | $50 – $80 / hr |
| Senior Full-Stack Developer | $90 – $150 / hr |

> All estimates below use a **Mid-Level rate of $65/hr** as the baseline.

---

## Phase 1 — Project Setup & Infrastructure
**Duration:** 1 Week

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Node.js + Express server setup | 4 | $260 |
| MongoDB Atlas connection & config | 3 | $195 |
| React + Vite + Tailwind setup | 4 | $260 |
| React Router v6 configuration | 2 | $130 |
| Axios instance + environment setup | 2 | $130 |
| Cloudinary account + API config | 2 | $130 |
| SendGrid account + SMTP config | 2 | $130 |
| Google OAuth 2.0 credentials setup | 3 | $195 |
| Git repository + project scaffolding | 2 | $130 |

| | **Total Hours** | **Total Cost** |
|---|---|---|
| | **24 hrs** | **$1,560** |

---

## Phase 2 — Backend Core Development
**Duration:** 3 Weeks

### 2.1 Authentication System

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| User mongoose model + bcrypt hashing | 4 | $260 |
| Register / Login / Logout controllers | 6 | $390 |
| JWT httpOnly cookie implementation | 4 | $260 |
| Auth middleware (verifyToken) | 3 | $195 |
| Role middleware (requireRole) | 2 | $130 |
| Google OAuth passport strategy | 6 | $390 |
| Forgot password + reset token flow | 5 | $325 |
| Profile update endpoint | 3 | $195 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **33 hrs** | **$2,145** |

---

### 2.2 Course & Lecture Management

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Course, Section, Lecture models | 5 | $325 |
| Cloudinary video upload middleware | 5 | $325 |
| Cloudinary thumbnail upload middleware | 3 | $195 |
| Course CRUD (create, read, update, delete) | 8 | $520 |
| Course publish / unpublish toggle | 2 | $130 |
| Course search & filter with pagination | 6 | $390 |
| Lecture CRUD + video upload to Cloudinary | 8 | $520 |
| Delete lecture + remove from Cloudinary | 3 | $195 |
| Instructor ownership check middleware | 3 | $195 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **43 hrs** | **$2,795** |

---

### 2.3 Email Notification Service

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Nodemailer + SendGrid transporter setup | 2 | $130 |
| Welcome email (on register) | 2 | $130 |
| Enrollment request confirmation email | 2 | $130 |
| Enrollment approved email | 2 | $130 |
| Enrollment rejected email | 2 | $130 |
| Password reset email | 2 | $130 |
| New course announcement email (BCC) | 2 | $130 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **14 hrs** | **$910** |

---

### 2.4 Enrollment & Admin System

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Enrollment model + unique index | 3 | $195 |
| Student enrollment request endpoint | 4 | $260 |
| Admin approve enrollment + email trigger | 4 | $260 |
| Admin reject enrollment + email trigger | 3 | $195 |
| Student progress update (mark lecture done) | 4 | $260 |
| Admin dashboard stats (users, courses, enrollments) | 5 | $325 |
| Admin user list with role/status filters | 4 | $260 |
| Admin change user role endpoint | 2 | $130 |
| Admin deactivate/activate user endpoint | 2 | $130 |
| Global error handler middleware | 3 | $195 |
| Standardized API response helpers | 2 | $130 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **36 hrs** | **$2,340** |

---

### Phase 2 Total

| | **Total Hours** | **Total Cost** |
|---|---|---|
| | **126 hrs** | **$8,190** |

---

## Phase 3 — Frontend Development
**Duration:** 3 Weeks

### 3.1 Authentication Pages

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Zustand auth store + persist middleware | 3 | $195 |
| Login page (form + Google OAuth button) | 5 | $325 |
| Register page (role selector + validation) | 6 | $390 |
| Forgot password page | 3 | $195 |
| Password reset page | 3 | $195 |
| Protected route component | 3 | $195 |
| Navbar (guest vs logged-in states) | 5 | $325 |
| Auth services (API calls) | 3 | $195 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **31 hrs** | **$2,015** |

---

### 3.2 Public Course Pages

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Home / Landing page (hero, categories, featured) | 8 | $520 |
| Course listing page (grid + sidebar filters) | 8 | $520 |
| Search bar + sort dropdown | 4 | $260 |
| Pagination component | 3 | $195 |
| Reusable CourseCard component | 3 | $195 |
| Course detail page (tabs, curriculum, info) | 8 | $520 |
| Enrollment request button + modal | 4 | $260 |
| Course services (API calls) | 3 | $195 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **41 hrs** | **$2,665** |

---

### 3.3 Student Learning Interface

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| My Learning dashboard (progress cards, tabs) | 7 | $455 |
| Video player page (react-player + Cloudinary) | 8 | $520 |
| Curriculum sidebar (expand/collapse sections) | 5 | $325 |
| Lecture navigation (prev/next buttons) | 3 | $195 |
| Mark as complete + progress bar update | 4 | $260 |
| Enrollment access guard (locked lectures) | 3 | $195 |
| Enrollment hook (React Query) | 3 | $195 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **33 hrs** | **$2,145** |

---

### 3.4 Instructor Dashboard

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Instructor dashboard (stats, courses table) | 8 | $520 |
| Instructor sidebar navigation | 3 | $195 |
| Create course — Step 1 (basic info form) | 6 | $390 |
| Create course — Step 2 (thumbnail upload) | 4 | $260 |
| Create course — Step 3 (curriculum) | 5 | $325 |
| Create course — Step 4 (review & publish) | 3 | $195 |
| Curriculum management (sections + lectures) | 10 | $650 |
| Lecture upload modal + video progress bar | 6 | $390 |
| Drag-to-reorder sections and lectures | 6 | $390 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **51 hrs** | **$3,315** |

---

### 3.5 Admin Dashboard

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Admin dashboard (stats, pending table) | 7 | $455 |
| Admin sidebar + pending count badge | 3 | $195 |
| Enrollment approvals page (tabs + table) | 8 | $520 |
| Approve / reject buttons + reject modal | 5 | $325 |
| User management page (table + filters) | 7 | $455 |
| Edit user drawer (role, status toggle) | 5 | $325 |
| Admin services (API calls) | 3 | $195 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **38 hrs** | **$2,470** |

---

### Phase 3 Total

| | **Total Hours** | **Total Cost** |
|---|---|---|
| | **194 hrs** | **$12,610** |

---

## Phase 4 — Security, Testing & Polish
**Duration:** 1 Week

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Rate limiting on auth routes (express-rate-limit) | 2 | $130 |
| Helmet.js security headers | 1 | $65 |
| MongoDB injection prevention | 1 | $65 |
| File type + size validation on uploads | 3 | $195 |
| Password reset token expiry (1 hour) | 2 | $130 |
| Input validation on all POST/PUT routes | 4 | $260 |
| End-to-end testing (all 3 user flows) | 8 | $520 |
| Edge case testing (duplicates, large files) | 5 | $325 |
| All email trigger testing | 4 | $260 |
| Mobile responsiveness testing + fixes | 5 | $325 |
| Performance optimization (indexes, queries) | 5 | $325 |
| Loading states + skeletons UI | 4 | $260 |
| Error boundaries in React | 2 | $130 |
| README + API documentation | 4 | $260 |
| Seed scripts (demo data) | 3 | $195 |

| | **Total Hours** | **Total Cost** |
|---|---|---|
| | **53 hrs** | **$3,445** |

---

## Phase 5 — Deployment
**Duration:** 1 Week

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Backend deployment (Railway / AWS EC2) | 4 | $260 |
| Frontend deployment (Vercel / CloudFront) | 3 | $195 |
| Production environment variables setup | 2 | $130 |
| MongoDB Atlas production cluster config | 2 | $130 |
| SSL certificate + custom domain setup | 2 | $130 |
| CORS update for production domain | 1 | $65 |
| Production Google OAuth callback update | 1 | $65 |
| End-to-end production testing | 4 | $260 |
| Error monitoring setup (Sentry) | 2 | $130 |
| Post-deployment bug fixes | 4 | $260 |

| | **Total Hours** | **Total Cost** |
|---|---|---|
| | **25 hrs** | **$1,625** |

---

## Phase 6 — Advanced Features (Post-MVP)
**Duration:** 4–6 Weeks (Future Scope)

### 6.1 Online Payment (Stripe)

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Stripe Checkout integration | 10 | $650 |
| Stripe Connect for instructor payouts | 12 | $780 |
| Webhook handler (auto-approve on payment) | 6 | $390 |
| Payment history page (student) | 5 | $325 |
| Payout dashboard (instructor) | 6 | $390 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **39 hrs** | **$2,535** |

---

### 6.2 Live Sessions (Twilio / Daily.co)

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Daily.co SDK integration | 8 | $520 |
| Live class room creation (instructor) | 8 | $520 |
| Student join live session UI | 6 | $390 |
| Screen sharing + recording | 6 | $390 |
| Twilio SMS notifications for live alerts | 5 | $325 |
| Scheduled sessions calendar | 8 | $520 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **41 hrs** | **$2,665** |

---

### 6.3 Advanced Search (Algolia)

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Algolia account + index setup | 3 | $195 |
| Sync MongoDB courses to Algolia | 5 | $325 |
| Instant search UI (results as you type) | 6 | $390 |
| Typo-tolerant search + faceted filters | 5 | $325 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **19 hrs** | **$1,235** |

---

### 6.4 Quizzes, Certificates & Reviews

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Quiz builder (instructor) | 12 | $780 |
| Quiz attempt + auto grading (student) | 8 | $520 |
| Certificate generation (PDF) | 8 | $520 |
| Course review & star rating system | 8 | $520 |
| Discussion forums per lecture | 12 | $780 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **48 hrs** | **$3,120** |

---

### 6.5 Video Platform Upgrade (Mux)

| Task | Hours | Cost (@ $65/hr) |
|---|---|---|
| Replace Cloudinary with Mux | 10 | $650 |
| Adaptive bitrate streaming setup | 6 | $390 |
| DRM protection for premium content | 8 | $520 |

| | **Subtotal Hours** | **Subtotal Cost** |
|---|---|---|
| | **24 hrs** | **$1,560** |

---

### Phase 6 Total (All Advanced Features)

| | **Total Hours** | **Total Cost** |
|---|---|---|
| | **171 hrs** | **$11,115** |

---

## Monthly Infrastructure Costs

### MVP (Free Tier)

| Service | Plan | Monthly Cost |
|---|---|---|
| MongoDB Atlas | M0 Free | $0 |
| Cloudinary | Free (25GB storage) | $0 |
| SendGrid | Free (100 emails/day) | $0 |
| Railway (Backend) | Starter | $0–$5 |
| Vercel (Frontend) | Hobby | $0 |
| Google OAuth | Free | $0 |
| **Total** | | **$0 – $5/month** |

---

### Production (Paid Tier)

| Service | Plan | Monthly Cost |
|---|---|---|
| MongoDB Atlas | M10 Managed | $57 |
| Cloudinary | Plus (225GB) | $99 |
| SendGrid | Essentials (50K/mo) | $20 |
| AWS EC2 t3.medium (Backend) | On-Demand | $35 |
| AWS CloudFront + S3 (Frontend) | Pay-as-you-go | $5–$15 |
| AWS Route 53 (DNS) | Per zone | $1 |
| Sentry (Error monitoring) | Team | $26 |
| **Total** | | **~$243–$253/month** |

---

### Advanced Features (Phase 6 Add-ons)

| Service | Plan | Monthly Cost |
|---|---|---|
| Stripe | 2.9% + $0.30 per transaction | Variable |
| Daily.co (Live video) | Developer ($0.99/participant/hr) | Variable |
| Twilio (SMS) | $0.0079 per SMS | Variable |
| Algolia | Grow ($50/mo) | $50 |
| Mux (Video streaming) | $0.015/min streamed | Variable |

---

## Project Cost Summary

| Phase | Duration | Hours | Cost |
|---|---|---|---|
| Phase 1 — Setup & Infrastructure | 1 week | 24 hrs | $1,560 |
| Phase 2 — Backend Development | 3 weeks | 126 hrs | $8,190 |
| Phase 3 — Frontend Development | 3 weeks | 194 hrs | $12,610 |
| Phase 4 — Security & Testing | 1 week | 53 hrs | $3,445 |
| Phase 5 — Deployment | 1 week | 25 hrs | $1,625 |
| **MVP Total** | **9 weeks** | **422 hrs** | **$27,430** |

---

| Phase | Duration | Hours | Cost |
|---|---|---|---|
| Phase 6 — Advanced Features (Post-MVP) | 4–6 weeks | 171 hrs | $11,115 |
| **Full Platform Total** | **13–15 weeks** | **593 hrs** | **$38,545** |

---

## Rate-Based Cost Comparison

| Developer Level | Hourly Rate | MVP Cost | Full Platform |
|---|---|---|---|
| Junior | $30/hr | $12,660 | $17,790 |
| Mid-Level | $65/hr | $27,430 | $38,545 |
| Senior | $120/hr | $50,640 | $71,160 |
| Agency (US) | $150–$200/hr | $63,300–$84,400 | $88,950–$118,600 |

---

## Payment Milestones (Recommended)

| Milestone | Deliverable | Payment |
|---|---|---|
| Kickoff | Project setup + DB connected | 25% upfront |
| Backend Complete | All APIs working (Phase 2) | 25% on delivery |
| Frontend Complete | All pages working (Phase 3) | 25% on delivery |
| Launch Ready | Deployed + tested (Phase 4+5) | 25% on launch |

---

*All costs are estimates based on standard industry rates. Final pricing depends on specific requirements, revisions, and developer experience level.*

*Prepared using the LearnHub LMS Technical Specification (CLAUDE.md)*
