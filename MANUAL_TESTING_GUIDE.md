# 🧪 LMS Platform - Detailed Manual Testing Guide

**Prerequisites:**
- Both servers running (Backend: http://localhost:5000, Frontend: http://localhost:5173)
- Test accounts created (see TESTING.md)
- Browser: Chrome/Firefox (with DevTools ready)
- Clear browser cache before starting

---

## 1️⃣ Authentication & User Management

### 1.1 User Registration
**Steps:**
1. Navigate to http://localhost:5173/register
2. Fill form with:
   - Name: `Test User`
   - Email: `testuser@test.com`
   - Password: `test123456` (minimum 6 characters)
   - Confirm Password: `test123456`
3. Click "Register"

**Verify:**
- ✅ Form validation shows errors for invalid inputs
- ✅ Password mismatch shows error
- ✅ Short password (<6 chars) shows error
- ✅ Success toast appears
- ✅ Redirected to `/courses` or home page
- ✅ User logged in automatically (check navbar for user menu)
- ✅ DevTools → Application → Cookies → `token` cookie exists
- ✅ Welcome email sent (check SendGrid dashboard if configured)

### 1.2 User Login
**Steps:**
1. Logout if logged in
2. Navigate to http://localhost:5173/login
3. Enter credentials:
   - Email: `student@lms.com`
   - Password: `student123`
4. Click "Login"

**Verify:**
- ✅ Form validation works
- ✅ Invalid credentials show error message
- ✅ Success toast appears
- ✅ Redirected to appropriate page based on role
- ✅ Navbar updates with user name/avatar
- ✅ `token` cookie set in browser (httpOnly)

### 1.3 Google OAuth Login
**Steps:**
1. Click "Continue with Google" button
2. Select Google account
3. Grant permissions

**Verify:**
- ✅ Redirected to Google OAuth consent screen
- ✅ After consent, redirected back to app
- ✅ User logged in successfully
- ✅ User data saved in MongoDB (googleId field populated)
- ✅ `token` cookie set

### 1.4 Logout
**Steps:**
1. While logged in, click user menu in navbar
2. Click "Logout"

**Verify:**
- ✅ Success toast appears
- ✅ Redirected to `/login`
- ✅ Navbar shows "Login" button again
- ✅ `token` cookie removed (check DevTools)
- ✅ Protected routes redirect to login if accessed

### 1.5 Password Reset Flow
**Steps:**
1. Go to http://localhost:5173/forgot-password
2. Enter email: `student@lms.com`
3. Click "Send Reset Link"
4. Check email inbox (or SendGrid dashboard)
5. Click reset link in email
6. Enter new password twice
7. Click "Reset Password"

**Verify:**
- ✅ Confirmation message shows after submitting email
- ✅ Email received with reset link
- ✅ Reset link contains token in URL
- ✅ Reset page loads successfully
- ✅ Form validation works (password match, length)
- ✅ Success message shows after reset
- ✅ Redirected to login page after 3 seconds
- ✅ Can login with new password
- ✅ Old password no longer works
- ✅ Reset token expires after 1 hour

### 1.6 Get Current User Profile
**Steps:**
1. Login as any user
2. Open DevTools → Network tab
3. Refresh page

**Verify:**
- ✅ `GET /api/auth/me` request sent automatically
- ✅ Response contains user data (without password)
- ✅ User role included in response

### 1.7 Update User Profile
**Steps:**
1. Login as student
2. Navigate to profile page (if exists) or use API directly
3. Update name, bio, or avatar
4. Save changes

**Verify:**
- ✅ Changes saved to database
- ✅ Success message shown
- ✅ Updated data reflects immediately in UI
- ✅ Avatar uploads to Cloudinary (if changed)

---

## 2️⃣ Course Management (Instructor)

### 2.1 Create New Course
**Steps:**
1. Login as: `instructor@lms.com / instructor123`
2. Navigate to http://localhost:5173/instructor/dashboard
3. Click "Create New Course" button
4. Fill course form:
   - Title: `Complete Web Development Bootcamp`
   - Short Description: `Learn web development from scratch`
   - Description: `Detailed description here...` (at least 50 characters)
   - Category: Select "Web Development"
   - Level: Select "Beginner"
   - Language: `English`
   - Price: `49.99`
   - Tags: `html, css, javascript, react`
   - Requirements: Add 2-3 items (e.g., "Basic computer skills")
   - What You'll Learn: Add 3-5 items
5. Upload thumbnail image (JPG/PNG, <5MB)
6. Click "Create Course"

**Verify:**
- ✅ All required fields show validation errors if empty
- ✅ Thumbnail preview shows before upload
- ✅ Upload progress indicator appears
- ✅ Thumbnail uploaded to Cloudinary
- ✅ Success toast shows
- ✅ Redirected to course edit page
- ✅ Course saved with status "draft"
- ✅ Course visible in instructor dashboard
- ✅ Check MongoDB: `thumbnailPublicId` field populated

### 2.2 Edit Course Details
**Steps:**
1. From instructor dashboard, click "Edit" on a course
2. Modify any field (e.g., change title)
3. Click "Save Changes"

**Verify:**
- ✅ Form pre-populated with existing data
- ✅ Changes saved successfully
- ✅ Success message shown
- ✅ Updated data visible immediately

### 2.3 Upload/Change Course Thumbnail
**Steps:**
1. In course edit page, click "Change Thumbnail"
2. Select new image (test with: JPG, PNG, WEBP)
3. Upload

**Verify:**
- ✅ New thumbnail uploads successfully
- ✅ Old thumbnail deleted from Cloudinary
- ✅ Preview updates immediately
- ✅ File size validation works (reject >5MB)
- ✅ File type validation works (reject non-images)

### 2.4 Manage Curriculum (Sections & Lectures)
**Steps:**
1. From course edit page, click "Manage Curriculum"
2. Or navigate to: http://localhost:5173/instructor/courses/:courseId/curriculum

**Verify:**
- ✅ Page loads curriculum structure
- ✅ Shows existing sections and lectures
- ✅ Empty state shows if no sections

### 2.5 Create Section
**Steps:**
1. In curriculum page, click "Add Section"
2. Enter section title: `Introduction to JavaScript`
3. Click "Save"

**Verify:**
- ✅ Modal/form opens
- ✅ Validation works (title required)
- ✅ Section created and appears in list
- ✅ Section has drag handle for reordering
- ✅ Order field increments automatically

### 2.6 Edit Section
**Steps:**
1. Click "Edit" icon on a section
2. Change title
3. Save

**Verify:**
- ✅ Edit modal opens with existing title
- ✅ Changes saved
- ✅ UI updates immediately

### 2.7 Delete Section
**Steps:**
1. Click "Delete" icon on a section
2. Confirm deletion

**Verify:**
- ✅ Confirmation modal appears
- ✅ Section and ALL its lectures deleted
- ✅ Associated videos deleted from Cloudinary
- ✅ Success message shown

### 2.8 Upload Lecture Video
**Steps:**
1. Click "Add Lecture" in a section
2. Fill form:
   - Title: `Variables and Data Types`
   - Description: `Learn about JS variables`
   - Select video file (MP4, <500MB)
   - Check "Is Preview" if free preview lecture
3. Click "Upload"

**Verify:**
- ✅ File selection works
- ✅ File type validation (reject non-videos)
- ✅ File size validation (reject >500MB)
- ✅ Upload progress bar shows
- ✅ Progress updates in real-time
- ✅ Video uploads to Cloudinary
- ✅ Success message after upload
- ✅ Lecture appears in section
- ✅ Check MongoDB: `videoUrl` and `videoPublicId` saved
- ✅ Video duration captured (if Cloudinary returns it)

### 2.9 Edit Lecture
**Steps:**
1. Click "Edit" icon on a lecture
2. Change title or description
3. Save (without changing video)

**Verify:**
- ✅ Form pre-populated
- ✅ Changes saved
- ✅ Video remains unchanged
- ✅ UI updates

### 2.10 Replace Lecture Video
**Steps:**
1. Edit lecture, upload new video file
2. Save

**Verify:**
- ✅ Old video deleted from Cloudinary
- ✅ New video uploaded
- ✅ `videoUrl` and `videoPublicId` updated

### 2.11 Delete Lecture
**Steps:**
1. Click "Delete" on a lecture
2. Confirm

**Verify:**
- ✅ Confirmation modal appears
- ✅ Lecture deleted from DB
- ✅ Video deleted from Cloudinary
- ✅ Success message shown
- ✅ Course `totalLectures` count updated

### 2.12 Reorder Sections/Lectures
**Steps:**
1. Drag section by drag handle
2. Drop in new position

**Verify:**
- ✅ Section order updates
- ✅ `order` field updated in DB
- ✅ UI reflects new order immediately

### 2.13 Publish Course
**Steps:**
1. Go to course edit page
2. Click "Publish Course" button
3. Confirm

**Verify:**
- ✅ Confirmation modal appears
- ✅ Course status changes to "published"
- ✅ Success message shown
- ✅ Course now visible on public course listing
- ✅ Publish button changes to "Unpublish"

### 2.14 Unpublish Course
**Steps:**
1. Click "Unpublish Course"
2. Confirm

**Verify:**
- ✅ Course status changes to "draft"
- ✅ Course removed from public listing
- ✅ Enrolled students can still access (important!)

### 2.15 Delete Course
**Steps:**
1. From instructor dashboard, click "Delete" on a course
2. Confirm deletion

**Verify:**
- ✅ Confirmation modal with warning
- ✅ Course, sections, lectures all deleted
- ✅ All videos deleted from Cloudinary
- ✅ Thumbnail deleted from Cloudinary
- ✅ Enrollments remain (for record-keeping)
- ✅ Success message shown

---

## 3️⃣ Student Course Browsing & Enrollment

### 3.1 Browse Public Courses
**Steps:**
1. Login as: `student@lms.com / student123`
2. Navigate to http://localhost:5173/courses

**Verify:**
- ✅ Only "published" courses visible
- ✅ Draft courses hidden
- ✅ Course cards show: thumbnail, title, instructor, price, rating
- ✅ Pagination works (if >12 courses)

### 3.2 Search Courses
**Steps:**
1. In courses page, enter search term: `javascript`
2. Press Enter or click search

**Verify:**
- ✅ Results filtered by text search
- ✅ Search in: title, description, tags
- ✅ No results message if nothing found
- ✅ Clear search button appears

### 3.3 Filter by Category
**Steps:**
1. Select category: "Web Development"

**Verify:**
- ✅ Only courses in that category shown
- ✅ Filter badge appears
- ✅ Can clear filter

### 3.4 Filter by Level
**Steps:**
1. Select level: "Beginner"

**Verify:**
- ✅ Only beginner courses shown
- ✅ Can combine with category filter

### 3.5 Filter by Price Range
**Steps:**
1. Set min price: 0, max price: 50
2. Apply filter

**Verify:**
- ✅ Only courses in price range shown
- ✅ Free courses included if min is 0

### 3.6 Sort Courses
**Steps:**
1. Select sort: "Newest First"
2. Try other sorts: Popular, Highest Rated, Price Low-High, Price High-Low

**Verify:**
- ✅ Courses reorder correctly
- ✅ "Newest" sorts by `createdAt` descending
- ✅ "Popular" sorts by `enrollmentCount` descending
- ✅ "Rating" sorts by `rating` descending

### 3.7 View Course Details
**Steps:**
1. Click on a course card
2. View full course detail page

**Verify:**
- ✅ Course info displayed: title, description, instructor
- ✅ Thumbnail/preview image shown
- ✅ Price displayed
- ✅ Category, level, language shown
- ✅ "What You'll Learn" section
- ✅ Requirements section
- ✅ Curriculum preview (sections and lecture titles)
- ✅ Free preview lectures marked
- ✅ Instructor bio/avatar
- ✅ "Enroll" button visible (if not enrolled)
- ✅ "Go to Course" button if already enrolled

### 3.8 Watch Free Preview Lecture
**Steps:**
1. In course details, find lecture marked "Preview"
2. Click to watch

**Verify:**
- ✅ Video player opens
- ✅ Video plays without enrollment
- ✅ Non-preview lectures locked/hidden

### 3.9 Request Enrollment
**Steps:**
1. In course details, click "Enroll Now"
2. Confirm enrollment request

**Verify:**
- ✅ Confirmation modal appears
- ✅ `POST /api/enrollments` request sent
- ✅ Enrollment created with status "pending"
- ✅ Success toast: "Enrollment request submitted"
- ✅ Enrollment request email sent to student
- ✅ Button changes to "Pending Approval"
- ✅ Check MongoDB: enrollment document created

### 3.10 View My Learning (Student Dashboard)
**Steps:**
1. Navigate to http://localhost:5173/my-learning

**Verify:**
- ✅ Shows all enrolled courses
- ✅ Status badges: Pending, Approved, Rejected
- ✅ Progress bar for approved courses
- ✅ "Continue Learning" button for approved
- ✅ "Pending" courses show waiting message
- ✅ "Rejected" courses show rejection reason

### 3.11 Access Approved Course
**Steps:**
1. In My Learning, click "Continue Learning" on approved course

**Verify:**
- ✅ Redirected to video player page: `/learn/:courseId`
- ✅ Course curriculum visible

### 3.12 Attempt Access Without Enrollment
**Steps:**
1. Logout, login as different student
2. Try to access: http://localhost:5173/learn/:courseId (of course not enrolled in)

**Verify:**
- ✅ Access denied message
- ✅ Redirected to course details page
- ✅ "Enroll" button shown

---

## 4️⃣ Video Player & Progress Tracking

### 4.1 Video Player Interface
**Steps:**
1. Login as student with approved enrollment
2. Navigate to `/learn/:courseId`

**Verify:**
- ✅ Video player loads (ReactPlayer component)
- ✅ Curriculum sidebar visible on right/bottom
- ✅ Current lecture highlighted
- ✅ Play button works
- ✅ Pause button works
- ✅ Volume control works
- ✅ Fullscreen button works
- ✅ Seek bar works
- ✅ Video quality adapts (if Cloudinary adaptive streaming enabled)

### 4.2 Navigate Between Lectures
**Steps:**
1. Click "Next Lecture" button
2. Click "Previous Lecture" button
3. Click any lecture in sidebar

**Verify:**
- ✅ Video switches to selected lecture
- ✅ Video URL updates
- ✅ Lecture title updates
- ✅ Current lecture highlighted in sidebar
- ✅ Video starts from beginning

### 4.3 Mark Lecture as Complete
**Steps:**
1. Watch a lecture
2. Click "Mark as Complete" checkbox

**Verify:**
- ✅ `PUT /api/enrollments/:id/progress` request sent
- ✅ Lecture added to `completedLectures` array
- ✅ Progress percentage updated
- ✅ Checkmark appears on lecture in sidebar
- ✅ Success toast shown

### 4.4 Progress Persistence
**Steps:**
1. Mark 2-3 lectures complete
2. Navigate away, come back

**Verify:**
- ✅ Completed lectures still marked
- ✅ Progress bar shows correct percentage
- ✅ Last accessed lecture loads first

### 4.5 Download Resources (if implemented)
**Steps:**
1. In video player, check for resources section
2. Click download link

**Verify:**
- ✅ Resource file downloads
- ✅ Link opens in new tab

### 4.6 Video Playback Speed
**Steps:**
1. Right-click player → Playback speed
2. Set to 1.5x or 2x

**Verify:**
- ✅ Speed changes work
- ✅ Audio pitch correction works

### 4.7 Video Controls Protection
**Steps:**
1. Right-click on video

**Verify:**
- ✅ Download option disabled (`controlsList="nodownload"`)
- ✅ Context menu restricted (if implemented)

---

## 5️⃣ Admin Panel

### 5.1 Access Admin Dashboard
**Steps:**
1. Login as: `admin@lms.com / admin123`
2. Navigate to http://localhost:5173/admin/dashboard

**Verify:**
- ✅ Dashboard loads
- ✅ Non-admin users cannot access (403 error)
- ✅ Stats cards display correctly

### 5.2 View Dashboard Statistics
**Steps:**
1. Check each stat card

**Verify:**
- ✅ Total Users count correct
- ✅ Total Courses count correct
- ✅ Total Enrollments count correct
- ✅ Total Revenue calculated correctly (sum of approved enrollment prices)
- ✅ Published Courses count
- ✅ Pending Enrollments count
- ✅ Active Users count

### 5.3 View Recent Activity
**Steps:**
1. Scroll down on dashboard

**Verify:**
- ✅ Recent enrollments table shows last 10
- ✅ Recent users list shows last 10
- ✅ User distribution by role (pie chart or stats)

### 5.4 Enrollment Approvals Page
**Steps:**
1. Navigate to http://localhost:5173/admin/enrollments

**Verify:**
- ✅ Page loads enrollment list
- ✅ Tabs: All, Pending, Approved, Rejected
- ✅ Each enrollment shows: student name, course title, date, status

### 5.5 Filter Enrollments by Status
**Steps:**
1. Click "Pending" tab

**Verify:**
- ✅ Only pending enrollments shown
- ✅ Approve/Reject buttons visible

### 5.6 Search Enrollments
**Steps:**
1. Enter student name or course title in search

**Verify:**
- ✅ Results filtered in real-time
- ✅ Search works across student and course names

### 5.7 Approve Enrollment
**Steps:**
1. Find pending enrollment
2. Click "Approve" button
3. Confirm

**Verify:**
- ✅ Confirmation modal appears
- ✅ `PUT /api/enrollments/:id/approve` request sent
- ✅ Status changes to "approved"
- ✅ `approvedBy` field set to admin's ID
- ✅ `approvedAt` timestamp set
- ✅ Course `enrollmentCount` increments
- ✅ Success toast shown
- ✅ Approval email sent to student
- ✅ Enrollment moves to "Approved" tab

### 5.8 Reject Enrollment
**Steps:**
1. Find pending enrollment
2. Click "Reject" button
3. Enter rejection reason: `Payment not verified`
4. Confirm

**Verify:**
- ✅ Rejection reason modal appears
- ✅ Reason required (validation)
- ✅ `PUT /api/enrollments/:id/reject` request sent
- ✅ Status changes to "rejected"
- ✅ `rejectedReason` field saved
- ✅ Rejection email sent with reason
- ✅ Success toast shown
- ✅ Enrollment moves to "Rejected" tab

### 5.9 User Management Page
**Steps:**
1. Navigate to http://localhost:5173/admin/users

**Verify:**
- ✅ Page loads user list
- ✅ Table shows: name, email, role, status, join date
- ✅ Search bar present
- ✅ Filter by role dropdown
- ✅ Filter by status (active/inactive)

### 5.10 Search Users
**Steps:**
1. Enter name or email in search

**Verify:**
- ✅ Results filtered
- ✅ Debouncing works (not instant, ~300ms delay)

### 5.11 Filter Users by Role
**Steps:**
1. Select "Instructor" from role filter

**Verify:**
- ✅ Only instructors shown
- ✅ Can combine with search

### 5.12 View User Details
**Steps:**
1. Click on a user row or "Edit" button

**Verify:**
- ✅ User detail modal/drawer opens
- ✅ Shows: name, email, role, join date, enrolled courses count
- ✅ Role dropdown available

### 5.13 Change User Role
**Steps:**
1. Open user detail
2. Change role from "student" to "instructor"
3. Save

**Verify:**
- ✅ Confirmation modal appears
- ✅ `PUT /api/admin/users/:id/role` request sent
- ✅ User role updated in DB
- ✅ Success message shown
- ✅ User can now access instructor features

### 5.14 Deactivate User Account
**Steps:**
1. Open user detail
2. Toggle "Account Status" switch to inactive
3. Confirm

**Verify:**
- ✅ Confirmation modal appears
- ✅ `PUT /api/admin/users/:id/deactivate` request sent
- ✅ `isActive` field set to false
- ✅ User cannot login anymore
- ✅ Existing sessions invalidated (on next request)
- ✅ Success message shown

### 5.15 Reactivate User Account
**Steps:**
1. Find inactive user
2. Toggle status back to active
3. Save

**Verify:**
- ✅ `isActive` set to true
- ✅ User can login again

---

## 6️⃣ Security Testing

### 6.1 JWT Authentication
**Steps:**
1. Login, note token in cookies
2. Open DevTools → Application → Cookies
3. Check token properties

**Verify:**
- ✅ Cookie name is "token"
- ✅ `HttpOnly` flag enabled (cannot access via JavaScript)
- ✅ `Secure` flag enabled in production
- ✅ `SameSite` set to "Strict"
- ✅ Expiry set to 7 days from now

### 6.2 Unauthorized Access Protection
**Steps:**
1. Logout completely
2. Try accessing: http://localhost:5173/admin/dashboard

**Verify:**
- ✅ Redirected to `/login`
- ✅ Error message shown

### 6.3 Role-Based Access Control
**Steps:**
1. Login as student
2. Try accessing: http://localhost:5173/instructor/dashboard

**Verify:**
- ✅ Access denied
- ✅ Redirected to home or 403 page
- ✅ Error message shown

### 6.4 Protected API Routes
**Steps:**
1. Logout
2. Open DevTools → Network tab
3. Try: `curl http://localhost:5000/api/courses` (should work - public)
4. Try: `curl http://localhost:5000/api/enrollments` (should fail)

**Verify:**
- ✅ Public routes accessible without token
- ✅ Protected routes return 401 Unauthorized
- ✅ Admin routes return 403 Forbidden for non-admins

### 6.5 CSRF Protection
**Steps:**
1. Try making API request from external site (e.g., Postman without proper origin)

**Verify:**
- ✅ CORS blocks requests from unauthorized origins
- ✅ Only CLIENT_URL allowed

### 6.6 File Upload Validation - Video
**Steps:**
1. Login as instructor
2. Try uploading non-video file (e.g., PDF) as lecture video

**Verify:**
- ✅ Upload rejected with error message
- ✅ Only MP4, MOV, AVI, MKV allowed

### 6.7 File Upload Validation - Image
**Steps:**
1. Try uploading non-image file as course thumbnail

**Verify:**
- ✅ Upload rejected
- ✅ Only JPG, PNG, WEBP allowed

### 6.8 File Size Validation - Video
**Steps:**
1. Try uploading video >500MB

**Verify:**
- ✅ Upload rejected before processing
- ✅ Error message shows size limit
- ✅ No server resources wasted

### 6.9 File Size Validation - Image
**Steps:**
1. Try uploading image >5MB

**Verify:**
- ✅ Upload rejected
- ✅ Error message clear

### 6.10 SQL Injection Protection
**Steps:**
1. Try entering: `admin@lms.com' OR '1'='1` in login email field
2. Submit

**Verify:**
- ✅ Login fails (no SQL injection vulnerability)
- ✅ Mongoose handles sanitization

### 6.11 XSS Protection
**Steps:**
1. Try entering: `<script>alert('XSS')</script>` in course title
2. Save and view course

**Verify:**
- ✅ Script not executed
- ✅ Displayed as plain text or sanitized
- ✅ React escapes by default

### 6.12 Rate Limiting
**Steps:**
1. Make 15 rapid login attempts with wrong password

**Verify:**
- ✅ After 10 attempts, rate limit triggered
- ✅ 429 Too Many Requests response
- ✅ Error message: "Too many attempts, try again later"
- ✅ Limit resets after 15 minutes

### 6.13 Password Security
**Steps:**
1. Create user, check MongoDB

**Verify:**
- ✅ Password hashed (not plain text)
- ✅ Bcrypt used with 12 salt rounds
- ✅ Password never returned in API responses

### 6.14 Token Expiration
**Steps:**
1. Login, note token
2. Manually set token expiry to past time (edit cookie)
3. Make API request

**Verify:**
- ✅ 401 Unauthorized response
- ✅ "Token expired" error message
- ✅ User logged out automatically

### 6.15 Instructor Course Ownership
**Steps:**
1. Login as instructor1, note course ID
2. Logout, login as instructor2
3. Try editing instructor1's course via API or direct URL

**Verify:**
- ✅ 403 Forbidden response
- ✅ "Not authorized" error
- ✅ Edit blocked in backend

---

## 7️⃣ Email Testing (If SendGrid Configured)

### 7.1 Welcome Email
**Steps:**
1. Register new user
2. Check email inbox

**Verify:**
- ✅ Email received within 1 minute
- ✅ Subject: "Welcome to YourLMS, [Name]!"
- ✅ Contains user's name
- ✅ "Browse Courses" link works
- ✅ Email formatted correctly (HTML)

### 7.2 Enrollment Request Email (to Student)
**Steps:**
1. Student requests enrollment
2. Check student's email

**Verify:**
- ✅ Email received
- ✅ Subject contains course title
- ✅ Mentions "pending" status
- ✅ Instructions for offline payment

### 7.3 Enrollment Approved Email
**Steps:**
1. Admin approves enrollment
2. Check student's email

**Verify:**
- ✅ Email received
- ✅ Subject: "Enrollment Approved - [Course Title]"
- ✅ Congratulatory message
- ✅ "Start Learning" link works

### 7.4 Enrollment Rejected Email
**Steps:**
1. Admin rejects enrollment with reason
2. Check student's email

**Verify:**
- ✅ Email received
- ✅ Rejection reason included
- ✅ Polite tone
- ✅ Contact information provided

### 7.5 Password Reset Email
**Steps:**
1. Request password reset
2. Check email

**Verify:**
- ✅ Email received within 30 seconds
- ✅ Reset link present
- ✅ Link contains valid token
- ✅ Expiry warning (1 hour)

### 7.6 New Course Notification (Optional)
**Steps:**
1. Instructor publishes new course
2. Check student emails (if feature enabled)

**Verify:**
- ✅ BCC used (student emails hidden)
- ✅ Course title and description included
- ✅ "View Course" link works

---

## 8️⃣ UI/UX Testing

### 8.1 Responsive Design - Mobile (390px)
**Steps:**
1. Open DevTools → Toggle device toolbar
2. Set width to 390px (iPhone 12 Pro)
3. Navigate through all pages

**Verify:**
- ✅ All pages readable
- ✅ Navigation menu collapses to hamburger
- ✅ Forms usable (no horizontal scroll)
- ✅ Buttons tappable (min 44x44px)
- ✅ Video player adapts
- ✅ Cards stack vertically

### 8.2 Responsive Design - Tablet (768px)
**Steps:**
1. Set width to 768px (iPad)
2. Test all pages

**Verify:**
- ✅ 2-column layouts work
- ✅ Sidebar behavior appropriate
- ✅ Tables scroll if needed

### 8.3 Responsive Design - Desktop (1920px)
**Steps:**
1. Set width to 1920px
2. Test all pages

**Verify:**
- ✅ Content centered, not stretched edge-to-edge
- ✅ Max-width constraints applied
- ✅ Images scale properly

### 8.4 Loading States
**Steps:**
1. Slow down network: DevTools → Network → Slow 3G
2. Navigate to courses page

**Verify:**
- ✅ Loading spinner shows during API calls
- ✅ Skeleton loaders (if implemented)
- ✅ No layout shift when data loads

### 8.5 Error Messages
**Steps:**
1. Force 404 error (invalid course ID)
2. Force 500 error (temporarily break backend)

**Verify:**
- ✅ Error messages clear and helpful
- ✅ Not showing stack traces in production
- ✅ "Try again" or "Go back" buttons provided

### 8.6 Form Validation Messages
**Steps:**
1. Submit forms with invalid data

**Verify:**
- ✅ Validation messages appear near fields
- ✅ Messages clear (not generic)
- ✅ Color-coded (red for errors)
- ✅ Success states shown (green checkmark)

### 8.7 Toast Notifications
**Steps:**
1. Trigger success and error toasts

**Verify:**
- ✅ Toasts appear in consistent location (top-right)
- ✅ Auto-dismiss after 3-5 seconds
- ✅ Can manually dismiss
- ✅ Multiple toasts stack

### 8.8 Navigation Flow
**Steps:**
1. Navigate entire app without refreshing

**Verify:**
- ✅ React Router handles all navigation
- ✅ No full page reloads
- ✅ Browser back button works
- ✅ Breadcrumbs present where needed

### 8.9 Accessibility - Keyboard Navigation
**Steps:**
1. Unplug mouse
2. Navigate using Tab, Enter, Arrow keys

**Verify:**
- ✅ All interactive elements focusable
- ✅ Focus order logical
- ✅ Focus indicator visible
- ✅ Can submit forms with Enter
- ✅ Can close modals with Escape

### 8.10 Accessibility - Screen Reader (Optional)
**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate app

**Verify:**
- ✅ Semantic HTML used
- ✅ Images have alt text
- ✅ Buttons have labels
- ✅ Form fields have labels
- ✅ ARIA attributes where needed

---

## 9️⃣ Performance Testing

### 9.1 Page Load Time
**Steps:**
1. Open DevTools → Network tab
2. Hard refresh home page (Ctrl+Shift+R)
3. Check "Load" time in Network tab

**Verify:**
- ✅ Page loads in <3 seconds
- ✅ First Contentful Paint <1.5s
- ✅ Time to Interactive <3s

### 9.2 API Response Time
**Steps:**
1. Open Network tab
2. Make API request (e.g., GET /api/courses)
3. Check response time

**Verify:**
- ✅ Most API calls respond in <500ms
- ✅ Search queries <1s
- ✅ File uploads excluded (expected to be slower)

### 9.3 Video Start Time
**Steps:**
1. Click play on video
2. Measure time until video starts

**Verify:**
- ✅ Video starts in <5 seconds
- ✅ Buffering indicator shown if needed

### 9.4 Pagination Performance
**Steps:**
1. Navigate to courses page
2. Click through pagination

**Verify:**
- ✅ Each page load fast (<500ms)
- ✅ No full re-render of page
- ✅ Scroll to top on page change

### 9.5 Image Optimization
**Steps:**
1. Check course thumbnails
2. Open image in new tab, check size

**Verify:**
- ✅ Images served from Cloudinary
- ✅ Cloudinary transformations applied (resize, compress)
- ✅ Images <500KB each
- ✅ Lazy loading (images below fold load on scroll)

### 9.6 Video Streaming
**Steps:**
1. Play long video (>10 minutes)
2. Seek to middle

**Verify:**
- ✅ Video doesn't download entire file upfront
- ✅ Seeking works instantly (Cloudinary HLS/DASH)
- ✅ Quality adapts to network speed

---

## 🔟 Data Integrity Testing

### 10.1 Enrollment Count Accuracy
**Steps:**
1. Note course enrollment count
2. Admin approves new enrollment
3. Check count again

**Verify:**
- ✅ Count increments by 1
- ✅ Rejects/cancels don't increment count

### 10.2 Progress Calculation
**Steps:**
1. Course has 10 lectures
2. Student completes 5 lectures
3. Check progress

**Verify:**
- ✅ Progress shows 50%
- ✅ Formula: (completedLectures.length / totalLectures) * 100

### 10.3 Course Duration Calculation
**Steps:**
1. Add 3 lectures with durations: 300s, 600s, 400s
2. Check course `totalDuration`

**Verify:**
- ✅ Total duration = 1300s (sum of all lectures)
- ✅ Updates when lectures added/removed

### 10.4 Soft Delete vs Hard Delete
**Steps:**
1. Check if course deletion removes data or marks as deleted

**Verify:**
- ✅ Hard delete used (for MVP)
- ✅ Enrollments preserved for records
- ✅ Videos removed from Cloudinary

### 10.5 Duplicate Enrollment Prevention
**Steps:**
1. Student enrolls in course
2. Try enrolling again

**Verify:**
- ✅ Error: "Already enrolled"
- ✅ Unique index on `{ student, course }` in DB

---

## ✅ Final Checklist

After completing all tests, verify:

- [ ] All user roles work (student, instructor, admin)
- [ ] Authentication flow complete (register, login, logout, reset)
- [ ] Courses CRUD operations work
- [ ] Video upload and streaming work
- [ ] Enrollment workflow complete (request → approve → access)
- [ ] Admin panel functional
- [ ] Security measures in place
- [ ] Emails sending (if configured)
- [ ] Responsive on all devices
- [ ] Performance acceptable
- [ ] No console errors in browser
- [ ] No server errors in terminal

---

## 📊 Test Results Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅/❌ |  |
| Course Creation | ✅/❌ |  |
| Video Upload | ✅/❌ |  |
| Enrollment Flow | ✅/❌ |  |
| Admin Approval | ✅/❌ |  |
| Video Playback | ✅/❌ |  |
| Progress Tracking | ✅/❌ |  |
| Security | ✅/❌ |  |
| Responsive Design | ✅/❌ |  |
| Performance | ✅/❌ |  |

Overall MVP Status: ✅ Ready / ⚠️ Needs Work / ❌ Not Ready
```

---

**End of Manual Testing Guide**

For quick testing, see: QUICK_TEST.md
For automated tests (Phase 2), see: TEST_PLAN.md (to be created)
