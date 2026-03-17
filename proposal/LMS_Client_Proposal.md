# LearnHub LMS Platform
## Development Proposal & Cost Breakdown

**Prepared for:** Client
**Prepared by:** LearnHub Dev Team
**Date:** February 2026 | **Version:** v1.0

---

## 1. Project Overview

This proposal outlines the complete development of a **Learning Management System (LMS)** platform — similar to Udemy and Coursera — built specifically to your requirements. The platform will support three user types: Students, Instructors, and Admins, delivering a full online learning experience.

| Detail | Information |
|---|---|
| **Project Name** | LearnHub — LMS Platform |
| **Technology Stack** | MongoDB · Express.js · React.js · Node.js (MERN) |
| **Authentication** | JWT Tokens · Google OAuth 2.0 |
| **Video Hosting** | Cloudinary (Phase 1) → Mux (Phase 2) |
| **Email Service** | SendGrid (Transactional Emails) |
| **UI Framework** | React + Tailwind CSS (Fully Responsive) |
| **Total Phases** | 3 Phases |
| **Total Timeline** | ~19 Weeks |

---

## 2. User Roles & Access

| Role | Core Capabilities |
|---|---|
| **Student** | Browse courses · Request enrollment · Watch videos · Track progress |
| **Instructor** | Create courses · Upload videos · Manage curriculum · View students |
| **Admin** | Approve enrollments · Manage users · View platform stats · Full control |

---

## 3. Phase 1 — MVP (Minimum Viable Product)

> **Full Payment: LKR 60,000 | Advance: LKR 20,000** *(Development begins after advance payment received)*

### Duration: 9 Weeks

### What You Get in Phase 1

**Authentication & User System**
- User registration and login
- Google OAuth 2.0 (Sign in with Google)
- JWT secure session management
- Forgot password and password reset via email
- Role-based access control (Student / Instructor / Admin)

**Course Management (Instructor)**
- Create, edit, and delete courses
- Upload video lectures to cloud (Cloudinary)
- Manage course sections and lectures
- Publish / unpublish courses
- Upload course thumbnail images

**Student Features**
- Browse and search all published courses
- Filter courses by category, level, and price
- View full course details and curriculum
- Request enrollment in any course
- Watch approved video lectures
- Track learning progress per course

**Admin Panel**
- Dashboard with platform statistics
- Approve or reject student enrollment requests
- Full user management (view, edit roles, deactivate)
- Monitor all courses and instructors

**Email Notifications (Automated)**
- Welcome email on registration
- Enrollment request confirmation to student
- Enrollment approved notification
- Enrollment rejected notification with reason
- Password reset email with secure link

**Security Implementation**
- Rate limiting to prevent abuse
- Security headers (Helmet.js)
- MongoDB injection prevention
- File type and size validation
- Secure httpOnly cookie authentication

**Deployment**
- Backend deployed and live
- Frontend deployed and live
- Production environment configured

---

### Phase 1 — Payment Breakdown

| | Amount |
|---|---|
| **Advance Payment** *(required to start development)* | **LKR 20,000** |
| **Remaining Balance** *(due on MVP delivery)* | **LKR 40,000** |
| **Phase 1 Full Payment** | **LKR 60,000** |

---

## 4. Phase 2 — Payments, Video & Search Upgrade

> **Full Payment: LKR 50,000**

### Duration: 4–5 Weeks

### What You Get in Phase 2

**Online Payment Integration (Stripe)**
- Students pay online via card to enroll
- Automatic enrollment approval after payment
- Secure Stripe Checkout (no card data stored)
- Instructor payout management (Stripe Connect)
- Payment history and receipts for students

**Professional Video Streaming (Mux)**
- Replace Cloudinary videos with Mux
- Adaptive bitrate streaming (HD quality)
- Faster video load across all devices
- DRM content protection for premium videos
- Professional video delivery infrastructure

**Smart Search (Algolia)**
- Instant search results as you type
- Typo-tolerant course search
- Advanced category and price filters
- Faster and smarter than basic database search

**Analytics & Reporting**
- Revenue reports and charts
- Student enrollment trends
- Course completion rate tracking
- Export reports to CSV

---

### Phase 2 — Payment

| | Amount |
|---|---|
| **Phase 2 Full Payment** | **LKR 50,000** |

---

## 5. Phase 3 — Advanced Features

> **Full Payment: LKR 50,000**

### Duration: 5–6 Weeks

### What You Get in Phase 3

**Live Sessions (Daily.co + Twilio)**
- Instructors host live video classes
- Students join from their browser (no install needed)
- Screen sharing and session recording
- Scheduled class calendar
- SMS alerts via Twilio when a class starts

**Quizzes & Assignments**
- Instructors build quizzes per lecture or course
- Automatic grading and score display
- Retake limits and time restrictions
- Assignment submission by students
- Quiz performance analytics

**Course Certificates**
- Auto-generated PDF certificate on course completion
- Unique certificate ID for verification
- Public certificate verification page
- Downloadable and shareable certificate

**Reviews & Community**
- Star rating system for courses (1–5 stars)
- Written course reviews from students
- Discussion forum per lecture
- Student Q&A section
- Instructor can respond to questions

---

### Phase 3 — Payment

| | Amount |
|---|---|
| **Phase 3 Full Payment** | **LKR 50,000** |

---

## 6. Complete Cost Summary

| Phase | What's Included | Duration | Full Payment | Advance |
|---|---|---|---|---|
| **Phase 1 — MVP** | Core platform, auth, courses, admin, emails, deployment | 9 Weeks | **LKR 60,000** | LKR 20,000 |
| **Phase 2** | Online payment, Mux video, Algolia search, analytics | 4–5 Weeks | **LKR 50,000** | — |
| **Phase 3** | Live sessions, quizzes, certificates, reviews | 5–6 Weeks | **LKR 50,000** | — |
| **Total** | Complete full-featured LMS platform | ~19 Weeks | **LKR 160,000** | |

---

## 7. Monthly Infrastructure Costs

> These are **third-party service fees** paid directly by the client — not included in development costs above.

| Service | Purpose | Free Tier | Paid Plan (approx.) |
|---|---|---|---|
| MongoDB Atlas | Database hosting | Free (M0) | ~LKR 17,000/mo |
| Cloudinary | Video & image storage | Free (25GB) | ~LKR 32,000/mo |
| SendGrid | Email notifications | Free (100/day) | ~LKR 6,500/mo |
| Railway / Render | Backend server hosting | Free tier | ~LKR 1,500/mo |
| Vercel | Frontend hosting | Free | ~LKR 6,500/mo |
| **MVP Estimated Total** | | **LKR 0/mo** | **~LKR 64,000/mo** |

> **Recommendation:** Start with free tiers during MVP. Upgrade only when you have active users generating revenue.

---

## 8. Project Timeline

| Week | Milestone |
|---|---|
| Week 1 | Project setup, database, third-party service configuration |
| Week 2–4 | Backend: Auth, courses, lectures, email, admin system |
| Week 5–7 | Frontend: All pages, dashboards, video player |
| Week 8 | Security hardening, full testing, bug fixes |
| Week 9 | Deployment to production — **Phase 1 Complete** |
| Week 10–14 | Phase 2: Stripe payments, Mux video, Algolia search |
| Week 15–21 | Phase 3: Live sessions, quizzes, certificates, reviews |
| Week 21+ | Full platform live and production-ready |

---

## 9. Payment Terms & Conditions

| # | Term |
|---|---|
| **01** | LKR 20,000 advance payment required before Phase 1 development begins |
| **02** | Remaining Phase 1 balance (LKR 40,000) due upon MVP delivery |
| **03** | Phase 2 and Phase 3 payments due before each phase starts |
| **04** | Each phase includes up to **2 rounds of revisions** at no extra cost |
| **05** | Full source code and ownership transferred to client after final payment |
| **06** | Client must create and maintain third-party service accounts (MongoDB, Cloudinary, SendGrid, etc.) |
| **07** | **2 weeks of free bug-fix support** included after each phase delivery |
| **08** | Post-support maintenance available at **LKR 5,000/month** |

---

## 10. What You Receive

- Full source code (frontend + backend)
- Database schema and sample seed data
- Live deployed application with domain
- Environment configuration documentation
- API endpoint documentation
- Admin account credentials and handover
- 2-week post-launch bug-fix support
- Git repository with full commit history

---

## 11. Why MERN Stack?

| Advantage | Detail |
|---|---|
| **Performance** | React's virtual DOM delivers fast, smooth UI |
| **Scalability** | Node.js handles thousands of concurrent users |
| **Real-time** | WebSocket-ready for live features in Phase 3 |
| **Industry Standard** | Used by Netflix, LinkedIn, Airbnb |
| **Cost Efficient** | Single language (JavaScript) across full stack |
| **Maintainability** | Clean modular code, easy to hand off or extend |

---

> **Ready to start?** Send the advance payment of **LKR 20,000** to begin Phase 1 development immediately.

---

*Proposal prepared by LearnHub Dev Team | February 2026*
*All prices are in Sri Lankan Rupees (LKR)*
*This proposal is valid for 30 days from the date of issue*
