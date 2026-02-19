# LMS Platform — Complete Project Implementation Plan
> **Stack:** MERN (MongoDB, Express, React, Node.js)
> **Phase:** MVP Development
> **Timeline:** 8-12 weeks for full MVP
> **Status:** Ready to Start

---

## Executive Summary

This project plan outlines the complete implementation of a Learning Management System (LMS) platform similar to Udemy/Coursera. The platform supports three user roles (Student, Instructor, Admin) with manual offline payment processing for MVP.

**Key Assets Available:**
- ✅ Complete technical specifications in `CLAUDE.md`
- ✅ 22 pre-built UI designs in `stitch/` folder (HTML + Tailwind CSS)
- ✅ UI design guide in `Google_Stitch_Prompts_LMS.md`

**Core MVP Features:**
- User authentication (JWT + Google OAuth)
- Course creation with video uploads (Cloudinary)
- Student enrollment request system (offline payment)
- Admin approval workflow
- Email notifications (SendGrid)
- Video streaming and progress tracking

---

## Project Structure Overview

```
/lms-platform
├── /client                    # React frontend (Vite + Tailwind)
├── /server                    # Express backend (Node.js + MongoDB)
├── /stitch                    # Pre-built UI components (HTML/Tailwind)
├── CLAUDE.md                  # Complete technical specifications
├── Google_Stitch_Prompts_LMS.md   # UI design guide
└── PROJECT_PLAN.md            # This file
```

---

## Phase 1: Project Setup & Infrastructure (Week 1)

### 1.1 Backend Setup
**Goal:** Create server foundation with database connection

**Tasks:**
- [ ] Initialize Node.js project in `/server` folder
- [ ] Install all backend dependencies (see CLAUDE.md Section 12)
- [ ] Set up `.env` file with environment variables
- [ ] Create `server.js` entry point with Express server
- [ ] Configure MongoDB connection in `config/db.js`
- [ ] Set up middleware (cors, cookie-parser, json parser)
- [ ] Test server health check endpoint (`GET /api/health`)

**Deliverable:** Running Express server connected to MongoDB Atlas

---

### 1.2 Frontend Setup
**Goal:** Create React application with routing and styling

**Tasks:**
- [ ] Initialize Vite React project in `/client` folder
- [ ] Install frontend dependencies (see CLAUDE.md Section 13)
- [ ] Configure Tailwind CSS
- [ ] Set up React Router v6
- [ ] Create `.env` file with API URL and Google OAuth client ID
- [ ] Create basic folder structure (components, pages, hooks, services, store)
- [ ] Set up Axios instance in `services/api.js`
- [ ] Configure httpOnly cookie handling

**Deliverable:** Running React app with routing and API connection

---

### 1.3 Third-Party Service Setup
**Goal:** Configure external services

**Tasks:**
- [ ] Create MongoDB Atlas cluster (M0 free tier for MVP)
- [ ] Create Cloudinary account and configure API keys
- [ ] Set up SendGrid account and verify sender email
- [ ] Configure Google OAuth 2.0 credentials
- [ ] Test all API keys and connections

**Deliverable:** All external services configured and tested

---

## Phase 2: Backend Core Development (Weeks 2-4)

### 2.1 Authentication System (Week 2)
**Build Order:** Steps 2-4 from CLAUDE.md Section 14

**Tasks:**

**Step 2 - Mongoose Models:**
- [ ] Create `User.js` model with schema (see CLAUDE.md Section 4)
  - Fields: name, email, password, role, avatar, googleId, bio
  - Pre-save hook for password hashing (bcrypt, 12 rounds)
  - `comparePassword` instance method
- [ ] Test User model with sample data

**Step 3 - Auth Controller & Routes:**
- [ ] Create `authController.js` with functions:
  - `register` - Create new user, send welcome email
  - `login` - Validate credentials, generate JWT, set httpOnly cookie
  - `logout` - Clear cookie
  - `getMe` - Get current user profile
  - `updateMe` - Update user profile
  - `forgotPassword` - Generate reset token, send email
  - `resetPassword` - Validate token, update password
  - `googleOAuth` - Google OAuth redirect handler
  - `googleOAuthCallback` - Handle Google OAuth callback
- [ ] Create `authRoutes.js` with all endpoints (see CLAUDE.md Section 5)
- [ ] Test all auth endpoints with Postman/Thunder Client

**Step 4 - Auth & Role Middleware:**
- [ ] Create `authMiddleware.js`:
  - `verifyToken` - Validate JWT from cookie or Authorization header
  - Extract user from token, attach to `req.user`
- [ ] Create `roleMiddleware.js`:
  - `requireRole(...roles)` - Check if user has required role
  - Return 403 if unauthorized
- [ ] Test middleware with protected routes

**Deliverable:** Complete authentication system with JWT + OAuth

---

### 2.2 Course Management System (Week 3)
**Build Order:** Steps 5-7 from CLAUDE.md Section 14

**Tasks:**

**Step 5 - Cloudinary Setup:**
- [ ] Create `config/cloudinary.js` with configuration
- [ ] Create video upload storage (folder: lms/videos, max 500MB)
- [ ] Create thumbnail upload storage (folder: lms/thumbnails, max 5MB)
- [ ] Create `uploadMiddleware.js` with multer config
- [ ] Create `cloudinaryService.js` with helper functions:
  - `deleteFromCloudinary(publicId, resourceType)`
- [ ] Test video and image uploads

**Step 2 (continued) - Course Models:**
- [ ] Create `Course.js` model (see CLAUDE.md Section 4)
  - Fields: title, description, instructor, category, level, price, thumbnail, sections, status
  - Text search index on title, description, tags
  - Populate instructor on queries
- [ ] Create `Section.js` model
  - Fields: title, course, lectures, order
  - Reference to Course and Lectures
- [ ] Create `Lecture.js` model
  - Fields: title, description, videoUrl, videoPublicId, duration, isPreview, order, resources
  - Reference to Course and Section
- [ ] Create `Enrollment.js` model
  - Fields: student, course, status, paymentMethod, paymentNote, completedLectures, progress
  - Unique compound index on student + course
- [ ] Test all models with sample data

**Step 6 - Course Controller:**
- [ ] Create `courseController.js` with functions:
  - `getAllCourses` - List published courses with search & filters (see CLAUDE.md Section 17)
    - Support: search, category, level, price range, pagination, sorting
  - `getCourseById` - Get single course with populated sections/lectures
  - `createCourse` - Create new course (instructor only)
  - `updateCourse` - Update course (owner only)
  - `deleteCourse` - Delete course + Cloudinary assets (owner only)
  - `publishCourse` - Toggle course status (owner only)
  - `uploadThumbnail` - Upload course thumbnail to Cloudinary
- [ ] Create `courseRoutes.js` with all endpoints (see CLAUDE.md Section 5)
  - Protect routes with `verifyToken` and `requireRole('instructor')`
  - Add ownership check middleware for edit/delete
- [ ] Test all course endpoints

**Step 7 - Lecture Controller:**
- [ ] Create `lectureController.js` with functions:
  - `getLecturesInSection` - Get all lectures (check enrollment)
  - `createLecture` - Create lecture + upload video to Cloudinary
    - Extract video duration from upload response
    - Update course totalDuration and totalLectures
  - `updateLecture` - Update lecture details
  - `deleteLecture` - Delete lecture + remove video from Cloudinary
    - Update course stats
- [ ] Create `lectureRoutes.js` nested under sections
  - Route pattern: `/api/courses/:courseId/sections/:sectionId/lectures`
  - Protect with enrollment check for GET requests
  - Protect with instructor ownership for POST/PUT/DELETE
- [ ] Test lecture upload and video access

**Deliverable:** Complete course and lecture management system

---

### 2.3 Email Service (Week 3)
**Build Order:** Step 8 from CLAUDE.md Section 14

**Tasks:**
- [ ] Create `config/email.js` with Nodemailer transporter (SendGrid SMTP)
- [ ] Create `services/emailService.js` with all email functions:
  - `sendWelcomeEmail(user)` - Welcome new users
  - `sendEnrollmentRequestEmail(student, course)` - Confirm enrollment request
  - `sendEnrollmentApprovedEmail(student, course)` - Notify approval
  - `sendEnrollmentRejectedEmail(student, course, reason)` - Notify rejection
  - `sendPasswordResetEmail(user, resetUrl)` - Password reset link
  - `sendNewCourseNotificationEmail(students, course, instructor)` - Course announcement
- [ ] Use HTML email templates with proper styling (see CLAUDE.md Section 8)
- [ ] Test each email function with real email addresses
- [ ] Make email sending async (don't block request handlers)

**Deliverable:** Complete email notification system

---

### 2.4 Enrollment & Admin Systems (Week 4)
**Build Order:** Steps 9-11 from CLAUDE.md Section 14

**Tasks:**

**Step 9 - Enrollment Controller:**
- [ ] Create `enrollmentController.js` with functions:
  - `requestEnrollment` - Student requests to enroll
    - Check if already enrolled
    - Create enrollment with status='pending'
    - Send email to student
  - `getMyEnrollments` - Get student's enrollments with course details
  - `getAllEnrollments` - Admin view all enrollments with filters
  - `approveEnrollment` - Admin approves enrollment
    - Update status to 'approved'
    - Set approvedBy and approvedAt
    - Increment course.enrollmentCount
    - Send approval email
  - `rejectEnrollment` - Admin rejects with reason
    - Update status to 'rejected'
    - Send rejection email with reason
  - `updateProgress` - Student marks lecture as complete
    - Add lecture to completedLectures
    - Calculate progress percentage
    - Update lastAccessedAt
- [ ] Create `enrollmentRoutes.js` with all endpoints (see CLAUDE.md Section 5)
  - Protect student routes with `verifyToken` + `requireRole('student')`
  - Protect admin routes with `requireRole('admin')`
- [ ] Implement enrollment access guard for video URLs
- [ ] Test enrollment flow end-to-end

**Step 10 - Admin Controller:**
- [ ] Create `adminController.js` with functions:
  - `getDashboardStats` - Get platform statistics
    - Total users by role
    - Total courses by status
    - Total enrollments by status
    - Revenue placeholder (offline)
  - `getAllUsers` - List all users with filters (role, status, search)
  - `updateUserRole` - Change user's role
  - `toggleUserStatus` - Activate/deactivate user account
- [ ] Create `adminRoutes.js` with all endpoints (see CLAUDE.md Section 5)
  - Protect all routes with `requireRole('admin')`
- [ ] Test admin functions

**Step 11 - Error Middleware:**
- [ ] Create `utils/apiResponse.js` with helper functions:
  - `successResponse(res, data, message, statusCode)`
  - `errorResponse(res, message, statusCode)`
- [ ] Create `middleware/errorMiddleware.js`:
  - `errorHandler(err, req, res, next)` - Global error handler
  - Log errors to console
  - Return consistent error format
- [ ] Add error middleware to server.js (must be last)
- [ ] Test error handling across all routes

**Deliverable:** Complete enrollment workflow and admin system

---

## Phase 3: Frontend Development (Weeks 5-7)

### 3.1 Authentication Pages (Week 5)
**Build Order:** Steps 12-14 from CLAUDE.md Section 14

**UI Components Available:**
- `stitch/learnhub_login_page/` → Login page
- `stitch/learnhub_registration_page/` → Register page
- `stitch/learnhub_forgot_password_-_input/` → Forgot password
- `stitch/learnhub_forgot_password_-_success_state/` → Password reset success

**Tasks:**

**Step 12 - React Setup:**
- [ ] Configure Vite + React Router
- [ ] Set up Tailwind CSS with custom colors from CLAUDE.md Section 2
- [ ] Create basic route structure in `App.jsx`
- [ ] Test hot module reload

**Step 13 - Auth Store & API Service:**
- [ ] Create `store/authStore.js` using Zustand + persist middleware
  - State: user, isAuthenticated
  - Actions: setUser, clearUser
- [ ] Create `services/api.js` - Axios instance with:
  - Base URL from env
  - `withCredentials: true` for cookies
  - Response interceptor (401 → clear auth and redirect to login)
- [ ] Create `services/authService.js` with API functions:
  - register, login, logout, getMe, updateMe, forgotPassword, resetPassword
- [ ] Test auth store and API calls

**Step 14 - Auth Pages:**
- [ ] Convert `stitch/learnhub_login_page/code.html` to React:
  - Create `pages/auth/Login.jsx`
  - Use `react-hook-form` for validation
  - Add Google OAuth button (opens OAuth flow)
  - Show error/success toasts (react-hot-toast)
  - Redirect to home on successful login
- [ ] Convert `stitch/learnhub_registration_page/code.html` to React:
  - Create `pages/auth/Register.jsx`
  - Password strength indicator
  - Role selection (Student/Instructor toggle cards)
  - Send welcome email on registration
- [ ] Convert forgot password pages:
  - Create `pages/auth/ForgotPassword.jsx`
  - Create `pages/auth/ResetPassword.jsx`
  - Two-state UI (input email → success confirmation)
- [ ] Create `components/common/ProtectedRoute.jsx`:
  - Check authentication
  - Check allowed roles
  - Redirect unauthorized users
- [ ] Create `components/common/Navbar.jsx`:
  - Logo, nav links (Home, Courses)
  - Login/Register buttons for guests
  - User avatar dropdown for logged-in users
- [ ] Test entire auth flow (register → login → logout)

**Deliverable:** Complete authentication UI with protected routes

---

### 3.2 Public Course Pages (Week 5-6)
**Build Order:** Steps 15-16 from CLAUDE.md Section 14

**UI Components Available:**
- `stitch/learnhub_homepage_landing_page/` → Home page
- `stitch/learnhub_course_listing_page/` → Course listing
- `stitch/learnhub_course_detail_page/` → Course detail

**Tasks:**

**Step 15 - Home & Course Listing:**
- [ ] Convert `stitch/learnhub_homepage_landing_page/code.html`:
  - Create `pages/student/Home.jsx`
  - Hero section with search bar
  - Categories section (8 cards grid)
  - Featured courses section (fetch from API)
  - How It Works section
  - Footer component
- [ ] Convert `stitch/learnhub_course_listing_page/code.html`:
  - Create `pages/student/CourseListing.jsx`
  - Left sidebar with filters (category, level, price)
  - Course grid (3 columns, responsive)
  - Search bar at top
  - Sort dropdown (newest, popular, rating, price)
  - Pagination component
- [ ] Create `components/course/CourseCard.jsx`:
  - Reusable course card component
  - Thumbnail, title, instructor, rating, price
  - "View Course" button with hover effect
- [ ] Create `services/courseService.js` with API functions:
  - getAllCourses(filters), getCourseById, createCourse, updateCourse, deleteCourse
- [ ] Implement search and filter logic
- [ ] Test course browsing and filtering

**Step 16 - Course Detail Page:**
- [ ] Convert `stitch/learnhub_course_detail_page/code.html`:
  - Create `pages/student/CourseDetail.jsx`
  - Hero section with course info (blue background)
  - Sticky purchase card (right sidebar)
  - Tabs: Overview, Curriculum, Instructor, Reviews
  - "What You'll Learn" section
  - Expandable curriculum sections
  - Instructor bio section
  - Reviews section (placeholder for MVP)
- [ ] Create enrollment request button:
  - Modal or inline form for payment note (optional)
  - Call `enrollmentService.requestEnrollment(courseId)`
  - Show success message
  - Email sent to student
- [ ] Create `services/enrollmentService.js` with API functions:
  - requestEnrollment, getMyEnrollments, updateProgress
- [ ] Test enrollment request flow

**Deliverable:** Complete public-facing course browsing and enrollment

---

### 3.3 Student Learning Interface (Week 6)
**Build Order:** Steps 17, 21 from CLAUDE.md Section 14

**UI Components Available:**
- `stitch/student_my_learning_dashboard/` → My Learning page
- `stitch/learnhub_course_video_player/` → Video player

**Tasks:**

**Step 21 - My Learning Dashboard:**
- [ ] Convert `stitch/student_my_learning_dashboard/code.html`:
  - Create `pages/student/MyLearning.jsx`
  - Greeting header with student name
  - Stats cards (Enrolled, Completed, In Progress)
  - Tab filters (All, In Progress, Completed, Pending)
  - Course progress cards grid
    - Show progress bar (percentage)
    - "Continue Learning" button
    - Show "Pending Approval" state for pending enrollments
  - Fetch enrollments from API
- [ ] Create `hooks/useEnrollment.js`:
  - React Query hook for fetching enrollments
  - Auto-refetch on approval
- [ ] Test My Learning page with different enrollment statuses

**Step 17 - Video Player Page:**
- [ ] Convert `stitch/learnhub_course_video_player/code.html`:
  - Create `pages/student/VideoPlayer.jsx`
  - Two-column layout (70% video, 30% curriculum sidebar)
  - Video player using `react-player` with Cloudinary URL
  - Video controls (play, pause, progress, volume, speed, fullscreen)
  - Current lecture indicator
  - "Mark as Complete" button
  - "Previous" and "Next" buttons
  - Tabs below video (Overview, Resources, Notes)
- [ ] Create curriculum sidebar:
  - Scrollable section/lecture list
  - Expand/collapse sections
  - Highlight current lecture (blue border + background)
  - Show checkmarks for completed lectures (green)
  - Click to navigate between lectures
- [ ] Implement lecture completion logic:
  - Call `enrollmentService.updateProgress(enrollmentId, lectureId)`
  - Update UI immediately
  - Update progress bar in real-time
- [ ] Implement access control:
  - Only show video if enrollment is approved OR lecture.isPreview = true
  - Show "Enroll to continue" message for locked lectures
- [ ] Test video playback and progress tracking

**Deliverable:** Complete student learning interface with video player

---

### 3.4 Instructor Dashboard (Week 6-7)
**Build Order:** Steps 18-19 from CLAUDE.md Section 14

**UI Components Available:**
- `stitch/learnhub_instructor_dashboard/` → Dashboard
- `stitch/learnhub_create_course_-_step_1/` → Create course step 1
- `stitch/learnhub_create_course_-_step_2_media/` → Create course step 2
- `stitch/learnhub_create_course_-_step_3_curriculum/` → Create course step 3
- `stitch/learnhub_instructor_curriculum_management/` → Curriculum management

**Tasks:**

**Step 18 - Instructor Dashboard:**
- [ ] Convert `stitch/learnhub_instructor_dashboard/code.html`:
  - Create `pages/instructor/InstructorDashboard.jsx`
  - Left sidebar navigation (Dashboard, My Courses, Create Course, Students, Analytics, Settings)
  - Stats cards (Total Courses, Total Students, Pending Approvals, Revenue)
  - My Courses table:
    - Columns: Thumbnail, Title, Category, Status, Students, Actions
    - Status badges (Published, Draft, Archived)
    - Edit/View buttons
    - Pagination
  - Recent enrollment requests section
- [ ] Create `components/common/InstructorSidebar.jsx`:
  - Reusable sidebar for instructor pages
  - Active link highlighting
  - Logout button at bottom
- [ ] Test instructor dashboard

**Step 18 (continued) - Create Course Form:**
- [ ] Convert `stitch/learnhub_create_course_-_step_1/code.html`:
  - Create `pages/instructor/CreateCourse.jsx`
  - Multi-step form with progress stepper (4 steps)
  - **Step 1 - Basic Info:**
    - Title, short description, full description (rich text)
    - Category dropdown, Level dropdown
    - Language, Price
    - "What You'll Learn" dynamic list (add/remove items)
    - "Requirements" dynamic list
    - Save Draft | Next buttons
  - **Step 2 - Media:**
    - Thumbnail upload (drag & drop zone)
    - Preview uploaded thumbnail
    - Back | Next buttons
  - **Step 3 - Curriculum:**
    - Add sections (see Step 19 below)
  - **Step 4 - Review & Publish:**
    - Show summary of course details
    - Publish Course button
- [ ] Create `components/forms/CourseForm.jsx`:
  - Use `react-hook-form` for validation
  - Handle multi-step navigation
  - Save draft at each step
- [ ] Test course creation flow

**Step 19 - Curriculum Management:**
- [ ] Convert `stitch/learnhub_instructor_curriculum_management/code.html`:
  - Create `pages/instructor/ManageCurriculum.jsx` (or include in Step 3)
  - "Add Section" row at top
  - Sections list (drag-to-reorder using drag handle)
  - Each section card shows:
    - Drag handle, section title, lecture count & duration
    - Edit/Delete buttons
    - Expand/collapse arrow
    - When expanded, show lecture list (also drag-to-reorder)
  - Each lecture row shows:
    - Drag handle, play icon, title, duration
    - Edit/Delete buttons
    - Upload video button if no video
  - "Add Lecture" button at bottom of each section
  - **Add/Edit Lecture Modal:**
    - Lecture title input
    - Description textarea
    - Video upload dropzone (Cloudinary upload)
    - Show upload progress bar
    - "Is this a free preview?" toggle
    - Cancel | Save buttons
- [ ] Implement drag-and-drop reordering:
  - Use `@dnd-kit/core` or similar library
  - Update section and lecture order fields
  - Save new order to backend
- [ ] Implement video upload with progress:
  - Use Cloudinary upload widget or direct API
  - Show progress percentage during upload
  - Extract video duration from response
  - Save lecture with videoUrl and videoPublicId
- [ ] Test curriculum management and video uploads

**Deliverable:** Complete instructor course creation and management

---

### 3.5 Admin Dashboard (Week 7)
**Build Order:** Step 20 from CLAUDE.md Section 14

**UI Components Available:**
- `stitch/learnhub_admin_management_dashboard/` → Admin dashboard
- `stitch/admin_enrollment_approval_workflow/` → Enrollment approvals
- `stitch/admin_user_management_with_drawer/` → User management

**Tasks:**

**Step 20 - Admin Dashboard:**
- [ ] Convert `stitch/learnhub_admin_management_dashboard/code.html`:
  - Create `pages/admin/AdminDashboard.jsx`
  - Left sidebar navigation (Dashboard, Enrollment Approvals, Users, Courses, Settings)
  - Stats cards (Total Users, Total Courses, Pending Enrollments, Revenue)
  - Pending enrollments table (top 5 recent)
  - Newly registered users list
  - Recent courses table
- [ ] Create `components/common/AdminSidebar.jsx`:
  - Reusable sidebar for admin pages
  - Badge on "Enrollment Approvals" showing pending count
- [ ] Create `services/adminService.js` with API functions:
  - getStats, getAllUsers, updateUserRole, toggleUserStatus, getAllEnrollments, approveEnrollment, rejectEnrollment
- [ ] Test admin dashboard

**Step 20 (continued) - Enrollment Approvals:**
- [ ] Convert `stitch/admin_enrollment_approval_workflow/code.html`:
  - Create `pages/admin/EnrollmentApprovals.jsx`
  - Tab bar: All, Pending, Approved, Rejected (with counts)
  - Filter row: search, date range picker, export button
  - Enrollments table:
    - Columns: #, Student, Course, Requested Date, Payment Note, Status, Actions
    - Status badges (Pending, Approved, Rejected)
    - For pending: Approve (green) + Reject (red) buttons
    - For approved/rejected: View button
  - **Reject Modal:**
    - Show student name and course name
    - Textarea for rejection reason
    - Cancel | Confirm Rejection buttons
    - Send rejection email with reason
  - Pagination
- [ ] Implement approval/rejection flow:
  - Call `adminService.approveEnrollment(enrollmentId)`
  - Call `adminService.rejectEnrollment(enrollmentId, reason)`
  - Update table immediately (optimistic UI)
  - Show success toast
- [ ] Test enrollment approval workflow

**Step 20 (continued) - User Management:**
- [ ] Convert `stitch/admin_user_management_with_drawer/code.html`:
  - Create `pages/admin/UserManagement.jsx`
  - Stats row (Total Users, Students, Instructors, Admins)
  - Filter row: search, role dropdown, status dropdown, export button
  - Users table:
    - Columns: User (avatar + name), Email, Role, Joined, Status, Actions
    - Role badges (Student, Instructor, Admin)
    - Status indicators (Active, Inactive)
    - Edit | Deactivate/Activate buttons
  - **Edit User Drawer (side panel):**
    - User avatar and name
    - Role dropdown (Student/Instructor/Admin)
    - Account status toggle (Active/Inactive)
    - "Send Password Reset Email" button
    - Save Changes | Cancel buttons
- [ ] Implement user management functions:
  - Update user role
  - Activate/deactivate user
  - Trigger password reset email
- [ ] Test user management

**Deliverable:** Complete admin panel with approval and user management

---

## Phase 4: Polish & Testing (Week 8)

### 4.1 Security Implementation
**Reference:** CLAUDE.md Section 15

**Tasks:**
- [ ] Implement rate limiting on auth routes (10 requests per 15 min)
  - Use `express-rate-limit`
- [ ] Add Helmet.js for security headers
- [ ] Add `express-mongo-sanitize` for NoSQL injection prevention
- [ ] Add file type validation on uploads (check MIME types)
- [ ] Enforce file size limits (video: 500MB, image: 5MB)
- [ ] Add ownership check middleware for course edits
- [ ] Verify admin-only routes are protected
- [ ] Test video access control (enrolled students only)
- [ ] Validate password reset token expiration (1 hour)
- [ ] Add input validation on all POST/PUT routes
- [ ] Test all security measures

**Deliverable:** Secure, production-ready application

---

### 4.2 Testing & Bug Fixes
**Tasks:**
- [ ] Test all user flows end-to-end:
  - Student: Register → Browse → Enroll → Get Approved → Watch Videos → Complete Course
  - Instructor: Register → Create Course → Upload Videos → Manage Curriculum → Publish
  - Admin: Login → Approve Enrollments → Manage Users → View Stats
- [ ] Test edge cases:
  - Duplicate enrollments (should fail)
  - Delete course with enrollments (should handle gracefully)
  - Upload large video (test 500MB limit)
  - Invalid file types (should reject)
  - Expired JWT (should redirect to login)
  - Unauthorized access attempts (should return 403)
- [ ] Test all email notifications:
  - Welcome email
  - Enrollment request confirmation
  - Enrollment approval
  - Enrollment rejection
  - Password reset
  - New course announcement
- [ ] Test mobile responsiveness for all pages
- [ ] Fix any bugs found during testing

**Deliverable:** Bug-free, tested application

---

### 4.3 Performance Optimization
**Tasks:**
- [ ] Add MongoDB indexes:
  - User: email (unique), googleId
  - Course: title (text), category, status, instructor
  - Enrollment: student + course (unique compound), status
  - Lecture: course, section
- [ ] Optimize API queries:
  - Use `select()` to limit returned fields
  - Use `populate()` sparingly (only when needed)
  - Add pagination to all list endpoints
  - Use `Promise.all()` for parallel queries
- [ ] Optimize Cloudinary uploads:
  - Compress videos on upload (720p max)
  - Generate thumbnails automatically
  - Use lazy loading for images
- [ ] Add loading states and skeletons to UI
- [ ] Implement error boundaries in React
- [ ] Test page load times and optimize slow queries

**Deliverable:** Fast, optimized application

---

### 4.4 Documentation & Deployment Prep
**Tasks:**
- [ ] Create comprehensive README.md:
  - Project overview
  - Tech stack
  - Installation instructions
  - Environment variables
  - API documentation
  - Deployment guide
- [ ] Create API documentation (Postman collection or Swagger)
- [ ] Document all environment variables
- [ ] Create seed scripts for demo data:
  - Sample users (student, instructor, admin)
  - Sample courses with videos
  - Sample enrollments
- [ ] Prepare for deployment:
  - Update CORS for production domain
  - Set up production MongoDB cluster (M10)
  - Configure production Cloudinary folder
  - Set up production SendGrid sender
- [ ] Create `.gitignore` and clean up repo
- [ ] Final commit and tag v1.0.0-mvp

**Deliverable:** Deployment-ready application with documentation

---

## Phase 5: Deployment (Week 9)

### 5.1 Backend Deployment
**Recommended Platforms:** Railway, Render, or AWS EC2

**Tasks:**
- [ ] Choose hosting platform
- [ ] Set up production environment variables
- [ ] Configure MongoDB Atlas production cluster (M10)
- [ ] Deploy backend to hosting platform
- [ ] Test API health check endpoint
- [ ] Monitor logs for errors

**Deliverable:** Backend deployed and accessible

---

### 5.2 Frontend Deployment
**Recommended Platforms:** Vercel, Netlify, or AWS S3 + CloudFront

**Tasks:**
- [ ] Build production bundle (`npm run build`)
- [ ] Configure production API URL in `.env`
- [ ] Deploy to hosting platform
- [ ] Configure custom domain (optional)
- [ ] Test all pages in production

**Deliverable:** Frontend deployed and accessible

---

### 5.3 Post-Deployment Testing
**Tasks:**
- [ ] Test complete user flows in production
- [ ] Test all email notifications
- [ ] Test video uploads and playback
- [ ] Test Google OAuth in production
- [ ] Monitor error logs and fix issues
- [ ] Set up error monitoring (Sentry or similar)

**Deliverable:** Fully functional production application

---

## Component Mapping: Stitch UI → React Pages

| Stitch Folder | React Page File | Description |
|---------------|-----------------|-------------|
| `learnhub_homepage_landing_page/` | `client/src/pages/student/Home.jsx` | Public homepage |
| `learnhub_course_listing_page/` | `client/src/pages/student/CourseListing.jsx` | Course search/filter |
| `learnhub_course_detail_page/` | `client/src/pages/student/CourseDetail.jsx` | Single course page |
| `learnhub_login_page/` | `client/src/pages/auth/Login.jsx` | Login form |
| `learnhub_registration_page/` | `client/src/pages/auth/Register.jsx` | Registration form |
| `learnhub_forgot_password_-_input/` | `client/src/pages/auth/ForgotPassword.jsx` | Password reset request |
| `learnhub_forgot_password_-_success_state/` | `client/src/pages/auth/ResetPassword.jsx` | Password reset success |
| `student_my_learning_dashboard/` | `client/src/pages/student/MyLearning.jsx` | Student enrolled courses |
| `learnhub_course_video_player/` | `client/src/pages/student/VideoPlayer.jsx` | Video learning interface |
| `learnhub_instructor_dashboard/` | `client/src/pages/instructor/InstructorDashboard.jsx` | Instructor home |
| `learnhub_create_course_-_step_1/` | `client/src/pages/instructor/CreateCourse.jsx` (Step 1) | Course basic info |
| `learnhub_create_course_-_step_2_media/` | `client/src/pages/instructor/CreateCourse.jsx` (Step 2) | Upload thumbnail |
| `learnhub_create_course_-_step_3_curriculum/` | `client/src/pages/instructor/CreateCourse.jsx` (Step 3) | Add sections/lectures |
| `learnhub_instructor_curriculum_management/` | `client/src/pages/instructor/ManageCurriculum.jsx` | Edit curriculum |
| `learnhub_admin_management_dashboard/` | `client/src/pages/admin/AdminDashboard.jsx` | Admin home |
| `admin_enrollment_approval_workflow/` | `client/src/pages/admin/EnrollmentApprovals.jsx` | Approve/reject enrollments |
| `admin_user_management_with_drawer/` | `client/src/pages/admin/UserManagement.jsx` | Manage users |

---

## Success Criteria for MVP

### Functional Requirements
- ✅ Users can register and login (email + Google OAuth)
- ✅ Instructors can create courses and upload videos
- ✅ Students can browse and request enrollment
- ✅ Admin can approve/reject enrollments
- ✅ Enrolled students can watch videos and track progress
- ✅ Email notifications sent for key actions
- ✅ All roles have appropriate dashboards

### Technical Requirements
- ✅ All API endpoints working and secured
- ✅ JWT authentication with httpOnly cookies
- ✅ Video uploads to Cloudinary (max 500MB)
- ✅ Email notifications via SendGrid
- ✅ MongoDB with proper indexes and relationships
- ✅ Mobile-responsive UI
- ✅ Security best practices implemented

### Performance Requirements
- ✅ Page load time < 3 seconds
- ✅ Video playback starts < 5 seconds
- ✅ API response time < 500ms
- ✅ No memory leaks or crashes

---

## Phase 2 Roadmap (Future Enhancements)

**Not included in MVP - implement after Phase 1 is complete:**

### Payment Integration
- Stripe Checkout for online payments
- Stripe Connect for instructor payouts
- Automated enrollment approval on payment success

### Video Platform Upgrade
- Replace Cloudinary with Mux for professional video streaming
- Adaptive bitrate streaming
- DRM protection for premium content

### Advanced Features
- Live sessions with Zoom/WebRTC integration
- Quizzes and assignments
- Certificates of completion
- Course reviews and ratings
- Discussion forums
- Student notes and bookmarks
- Course recommendations (ML-based)
- Mobile apps (React Native)

---

## Key Development Principles

1. **Follow the Build Order:** Stick to the sequence in CLAUDE.md Section 14 to avoid blockers
2. **Test Everything:** Test each feature before moving to the next
3. **Use Pre-Built UI:** Leverage the Stitch components to save 50% of frontend development time
4. **Security First:** Implement all security measures from CLAUDE.md Section 15
5. **Email Async:** Never block request handlers waiting for email delivery
6. **Optimize Queries:** Use Promise.all(), select(), and pagination everywhere
7. **Consistent Responses:** Use apiResponse.js helpers for all endpoints
8. **Error Handling:** Catch and log all errors, never expose internals to users

---

## Development Commands Reference

### Backend (server/)
```bash
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cookie-parser cors dotenv cloudinary multer multer-storage-cloudinary nodemailer passport passport-google-oauth20 passport-jwt crypto express-rate-limit helmet express-mongo-sanitize morgan
npm install -D nodemon

# Start dev server
npm run dev
```

### Frontend (client/)
```bash
npm create vite@latest . -- --template react
npm install react-router-dom axios zustand @tanstack/react-query react-player react-hook-form react-hot-toast lucide-react tailwindcss @headlessui/react date-fns
npm install -D @tailwindcss/forms

# Start dev server
npm run dev
```

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Setup | 1 week | Backend + Frontend scaffolding, services setup |
| Phase 2: Backend Core | 3 weeks | Auth, courses, enrollments, admin, emails |
| Phase 3: Frontend | 3 weeks | All pages, components, state management |
| Phase 4: Polish | 1 week | Security, testing, optimization, docs |
| Phase 5: Deployment | 1 week | Deploy, test, monitor |
| **Total MVP** | **8-10 weeks** | Fully functional LMS platform |

---

## Next Steps

1. **Review this plan** with your team/client
2. **Set up project repository** (Git + GitHub)
3. **Start with Phase 1.1** (Backend Setup)
4. **Follow the build order** exactly as specified
5. **Track progress** using this document as your checklist
6. **Test continuously** at each step

---

## Contact & Support

For questions or guidance on this project plan:
- Refer to `CLAUDE.md` for technical specifications
- Refer to `Google_Stitch_Prompts_LMS.md` for UI design guidance
- Use Claude Code to implement each phase step-by-step

**Ready to build? Let's start with Phase 1.1! 🚀**
