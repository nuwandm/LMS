# Google Stitch Prompts — LMS Platform MVP Pages
> Copy each prompt directly into stitch.withgoogle.com to generate your UI designs.
> Use **Experimental Mode (Gemini 3 Pro)** for best quality results.

---

## How to Use This Guide

1. Go to **https://stitch.withgoogle.com** and sign in with your Google account
2. Select **Experimental Mode** (Gemini 3 Pro) for high-fidelity output
3. Copy the **Global Design System** prompt first and save the output as your style reference
4. For each page, paste the prompt → generate → refine with follow-up prompts
5. Export to **Figma** (Copy to Figma button) or grab **HTML/CSS code** (View Code button)
6. Hand the exported HTML/Tailwind code to Claude Code to integrate into your React components

---

## Global Design System (Run This First)

> Use this as a reference prompt for every page to keep UI consistent.

```
Design a web UI design system for an online Learning Management System (LMS) platform
similar to Udemy. Use the following brand guidelines consistently across all pages:

COLOR PALETTE:
- Primary: Deep Blue #1E3A5F (navbar, primary buttons, headings)
- Accent: Bright Blue #2E86C1 (links, hover states, active elements)
- Success: Green #1E8449 (approved, enrolled, completed states)
- Warning: Orange #D35400 (pending states, prices, alerts)
- Danger: Red #922B21 (rejected, error states)
- Background: Light Gray #F8F9FA (page background)
- Card Background: White #FFFFFF
- Text Primary: #1A1A2E
- Text Secondary: #6C757D
- Border: #E0E0E0

TYPOGRAPHY:
- Font: Inter (Google Fonts)
- Headings: Bold, dark, clear hierarchy (H1: 32px, H2: 24px, H3: 18px)
- Body: 16px, line height 1.6
- Small/labels: 13px

COMPONENTS:
- Navbar: White background, Deep Blue logo, clean nav links, Login/Register buttons top right
- Cards: White, rounded corners (12px), subtle shadow, hover lift effect
- Buttons: Primary = Deep Blue with white text, Secondary = outlined, Danger = Red
- Form inputs: Rounded (8px border radius), subtle border, focus ring in Accent Blue
- Badges: Pill-shaped, color-coded (green=approved, orange=pending, red=rejected)
- Spacing: Generous padding, clean whitespace, 8px base grid

STYLE:
- Clean, modern, professional
- Inspired by Udemy and Coursera
- Mobile responsive layout
- Sidebar navigation for dashboard pages
- Full-width hero sections on public pages
```

---

## Page 1 — Home Page (Public)

```
Design a web homepage for an LMS platform called "LearnHub". This is the public landing page
for non-logged-in visitors.

LAYOUT (top to bottom):
1. NAVBAR: White background with "LearnHub" logo on left (Deep Blue #1E3A5F). Center nav links:
   Home, Courses, Categories. Right side: Login button (outlined) and Register button
   (Deep Blue filled). Sticky on scroll.

2. HERO SECTION: Full-width, Deep Blue (#1E3A5F) gradient background. Left side has:
   - Large white heading: "Learn Without Limits"
   - Subheading in light blue: "Expert-led courses in development, design, business and more"
   - A search bar with white background, placeholder "Search for anything..." and a blue
     Search button
   - Two stats below: "500+ Courses" and "10,000+ Students"
   Right side: An illustration of a student learning on a laptop.

3. CATEGORIES SECTION: White background. Section title "Browse by Category".
   Show 8 category cards in a 4-column grid. Each card has an icon, category name,
   and course count. Categories: Web Development, Mobile Dev, Data Science, Design,
   Business, Marketing, Photography, Music.

4. FEATURED COURSES SECTION: Light gray background. Title "Featured Courses".
   Show 4 course cards in a row. Each card has:
   - Course thumbnail image (placeholder)
   - Category badge (pill, blue)
   - Course title (bold)
   - Instructor name with small avatar
   - Star rating (4.5 stars) with review count
   - Price in bold orange
   - "Enroll Now" button

5. HOW IT WORKS SECTION: White background. Title "How It Works".
   3 steps side by side with icons: 1) Browse Courses, 2) Request Enrollment,
   3) Start Learning.

6. FOOTER: Deep Blue background, white text. Logo left, links center (About, Courses,
   Contact, Privacy), social icons right.

Use Inter font, clean modern design similar to Udemy. Mobile responsive.
```

---

## Page 2 — Course Listing Page

```
Design a web course listing/search page for an LMS platform called "LearnHub".

LAYOUT:
1. NAVBAR: Same as homepage — white, "LearnHub" logo left, nav links center, Login/Register right.

2. PAGE HEADER: Light gray background. Title "All Courses" with subtitle showing
   "Showing 48 results". Include a search bar pre-filled with search text.

3. MAIN CONTENT: Two-column layout.

   LEFT SIDEBAR (280px wide, white card):
   - "Filters" heading with a "Clear All" link
   - CATEGORY filter: checkboxes for Web Development, Mobile Dev, Data Science,
     Design, Business, Marketing, Photography, Music
   - LEVEL filter: checkboxes for Beginner, Intermediate, Advanced
   - PRICE filter: checkboxes for Free, Paid, with a price range slider ($0 - $200)
   - Apply Filters button (Deep Blue)

   RIGHT CONTENT (remaining width):
   - Sort bar at top: "Sort by" dropdown (Newest, Most Popular, Highest Rated,
     Price Low-High, Price High-Low) and view toggle (grid/list icons)
   - COURSE GRID: 3-column grid of course cards. Each card:
     * Thumbnail image with category badge overlay
     * Course title (2 lines max, bold)
     * Instructor name (small, gray)
     * Star rating + review count
     * Total lectures count and duration
     * Price (bold orange) or "Free" badge in green
     * "View Course" button on hover
   - PAGINATION: Page numbers at bottom (1 2 3 ... 10), Previous/Next buttons

Use Inter font, clean card design, subtle shadows on cards, hover effects.
```

---

## Page 3 — Course Detail Page

```
Design a web course detail page for an LMS platform. This page shows full details
of a single course before a student enrolls.

LAYOUT:
1. NAVBAR: Same standard navbar.

2. COURSE HERO: Deep Blue (#1E3A5F) full-width background. Two-column layout:
   LEFT: 
   - Breadcrumb: Home > Courses > Web Development
   - Course title in large white text: "Complete React Developer Bootcamp 2024"
   - Short description in light gray: "Master React from scratch with hooks, Redux..."
   - Rating row: 4.8 stars (yellow), (1,234 ratings), 5,678 students enrolled
   - Instructor: Small avatar + "Created by John Smith"
   - Last updated: "Last updated November 2024" and language "English"
   RIGHT (sticky card, white background, rounded corners):
   - Course thumbnail image
   - Price: "$49.99" in large bold orange text
   - "Request Enrollment" button (large, green, full width)
   - "This course includes:" list with icons:
     * 42 hours of video content
     * 15 sections, 120 lectures
     * Full lifetime access
     * Certificate of completion

3. COURSE TABS: White sticky tab bar: Overview | Curriculum | Instructor | Reviews

4. WHAT YOU WILL LEARN: White card with a 2-column checklist grid of 8 learning outcomes.
   Green checkmark icons.

5. COURSE CURRICULUM: White card. Title "Course Content".
   Show 5 expandable section accordions. First section is expanded showing:
   - Section title with lecture count and duration
   - List of lectures with play icon, title, preview badge (if free preview), duration
   Other sections are collapsed.

6. INSTRUCTOR SECTION: White card. Instructor avatar (large), name, title, bio, rating stats.

7. REVIEWS SECTION: White card. Overall rating (4.8/5), rating breakdown bars,
   3 student review cards with avatar, name, stars, date, and review text.

Use Inter font. Clean professional design.
```

---

## Page 4 — Login Page

```
Design a clean, minimal login page for an LMS platform called "LearnHub".

LAYOUT:
- White page background
- Centered card (max 440px wide) with subtle shadow and 12px border radius
- LearnHub logo at top center (Deep Blue)
- Heading: "Welcome back" (bold, dark)
- Subheading: "Sign in to continue learning"

FORM ELEMENTS inside the card:
1. Email input field (full width, rounded, label "Email address")
2. Password input field with show/hide toggle icon
3. Row with "Remember me" checkbox on left and "Forgot password?" link (blue) on right
4. "Sign In" button (full width, Deep Blue background, white text, rounded)
5. Divider line with "OR" text in the center
6. "Continue with Google" button (white background, Google colored G icon, gray border,
   full width, rounded)
7. Bottom text: "Don't have an account? Register here" with Register as a blue link

ADDITIONAL DETAILS:
- Show a subtle error state example on the email field (red border + "Invalid email" message)
- Form validation icons on valid fields (green checkmark)
- Clean Inter font, generous padding inside card
- Soft gray background outside card

Mobile responsive — card takes full width on small screens.
```

---

## Page 5 — Register Page

```
Design a clean registration page for an LMS platform called "LearnHub".

LAYOUT:
- White/light gray page background
- Centered card (max 500px wide), subtle shadow, 12px rounded corners
- LearnHub logo centered at top
- Heading: "Create your account"
- Subheading: "Join thousands of learners today"

FORM ELEMENTS:
1. Two-column row: First Name input | Last Name input
2. Email address input (full width)
3. Password input with strength indicator bar below
   (show: Weak in red → Fair in orange → Strong in green)
4. Confirm Password input
5. Role selector: Two large toggle cards side by side
   - "I want to Learn" card (student icon, selected state = Deep Blue border + light blue bg)
   - "I want to Teach" card (instructor icon, unselected = gray border)
6. Terms checkbox: "I agree to the Terms of Service and Privacy Policy"
7. "Create Account" button (full width, Deep Blue, white text, rounded)
8. Divider "OR"
9. "Sign up with Google" button (white, Google icon, gray border, full width)
10. Bottom text: "Already have an account? Sign In" with Sign In as blue link

Clean, spacious design. Inter font. Show password strength meter as an orange 60% bar.
```

   ---

   ## Page 6 — Forgot Password Page

   ```
   Design a simple forgot password page for an LMS platform.

   LAYOUT:
   - Light gray page background
   - Centered card (max 420px), white, soft shadow
   - Back arrow link at top left of card: "← Back to Login"
   - Lock icon centered at top (large, Deep Blue outline icon)
   - Heading: "Forgot your password?"
   - Description: "Enter your email address and we'll send you a link to reset your password."
   - Email input (full width, rounded)
   - "Send Reset Link" button (full width, Deep Blue, white text)

   SUCCESS STATE (show as a second version):
   - Green checkmark icon
   - Heading: "Check your email"
   - Text: "We've sent a password reset link to john@example.com"
   - "Resend email" link in blue
   - "Back to Login" button (outlined)

   Clean minimal design. Use Inter font.
   ```

   ---

## Page 7 — Student Dashboard — My Learning Page

```
Design a student "My Learning" dashboard page for an LMS platform called "LearnHub".
The student is logged in.

LAYOUT:
1. NAVBAR: Same navbar but right side shows student avatar + name dropdown instead of
   Login/Register buttons.

2. PAGE HEADER: White background.
   - Heading "My Learning" with student name "Hi, Sarah! 👋"
   - Three stat cards in a row:
     * Enrolled Courses: 5 (blue icon)
     * Completed: 2 (green icon)
     * In Progress: 3 (orange icon)

3. TABS: "All Courses | In Progress | Completed | Pending Approval"

4. COURSE PROGRESS CARDS: Grid of enrolled course cards (2 columns). Each card:
   - Thumbnail image
   - Course title
   - Instructor name
   - Progress bar (blue filled, percentage label e.g. "65% complete")
   - Last watched: "Lecture 12: React Hooks"
   - Status badge: "In Progress" (orange) or "Completed" (green) or "Pending" (gray)
   - "Continue Learning" button (Deep Blue) or "Review Course" (outlined)

5. One card should show PENDING APPROVAL state:
   - Yellow/orange border
   - "Pending Approval" badge
   - Text: "Your enrollment is under review. We'll notify you once approved."

Use Inter font, clean card design with progress bars.
```

---

## Page 8 — Video Player / Learn Page

```
Design a course video player page for an LMS platform. This is the main learning interface.

LAYOUT — Two column, full height:

LEFT COLUMN (main content, ~70% width):
1. VIDEO PLAYER: Large video player area (dark/black background, 16:9 ratio).
   Bottom controls: play/pause, progress scrubber, time (12:34 / 45:00),
   volume, speed selector (1x), fullscreen. Top right of video: "Lecture 12 of 42".

2. BELOW VIDEO: White area
   - Lecture title: "React Hooks — useState and useEffect Deep Dive"
   - Row: Prev Lecture button | Mark as Complete (green checkbox button) | Next Lecture button
   - Tab bar: Overview | Resources | Notes
   - Tab content: Short description of the lecture

RIGHT SIDEBAR (~30% width, white bg, border left):
1. SIDEBAR HEADER: Course title (smaller text), progress "12/42 lectures (65%)", progress bar

2. COURSE CURRICULUM LIST: Scrollable list of sections and lectures.
   - Section 1: "Introduction" — 3 lectures (collapsed, shows expand arrow)
   - Section 2: "React Basics" — 5 lectures (expanded)
     Each lecture row: Play icon, lecture title, duration, checkmark if completed (green)
     Currently playing lecture is highlighted with Deep Blue left border and light blue bg
   - Section 3: "React Hooks" — 6 lectures (collapsed)
   - Section 4: "State Management" — 8 lectures (collapsed)

Use dark theme for the video player area, white for sidebar. Inter font.
```

---

## Page 9 — Instructor Dashboard

```
Design an instructor dashboard page for an LMS platform called "LearnHub".

LAYOUT:
1. SIDEBAR (left, 240px, Deep Blue #1E3A5F background):
   - LearnHub logo at top (white text)
   - Instructor avatar + name "John Smith" + "Instructor" badge
   - Navigation links with icons (white text, active = light blue bg):
     * Dashboard (active)
     * My Courses
     * Create Course
     * Students
     * Analytics
     * Settings
   - Logout at bottom

2. MAIN CONTENT (white/light gray background):

   TOP STATS ROW — 4 cards:
   - Total Courses: 8 (blue icon)
   - Total Students: 234 (green icon)  
   - Pending Approvals: 12 (orange icon)
   - Total Revenue: $1,840 (shown as "Offline" with info icon for MVP)

   MY COURSES TABLE: White card
   - Title, "Add New Course" button (Deep Blue) top right
   - Table columns: Thumbnail | Course Title | Category | Status | Students | Actions
   - 4 rows of data:
     * Row 1: "Complete React Bootcamp" | Web Dev | Published (green badge) | 89 students | Edit/View buttons
     * Row 2: "Node.js Masterclass" | Web Dev | Draft (gray badge) | 0 students | Edit/Publish buttons
     * Row 3: "MongoDB Deep Dive" | Database | Published (green badge) | 45 students | Edit/View
     * Row 4: "TypeScript Fundamentals" | Web Dev | Archived (red badge) | 34 students | Edit/View
   - Pagination below

   RECENT ENROLLMENT REQUESTS: White card
   - Title "Recent Enrollment Requests"
   - List of 3 pending enrollments: Student name + avatar, course name, date, Approve/Reject buttons
   
Use Inter font. Sidebar navigation style similar to admin panels.
```

---

## Page 10 — Create Course Page (Instructor)

```
Design a "Create New Course" multi-step form page for an instructor on an LMS platform.

LAYOUT:
1. SAME SIDEBAR from instructor dashboard (Deep Blue, collapsed to icons only on this page)

2. MAIN CONTENT:
   - Page title: "Create New Course"
   - STEP PROGRESS BAR at top: 4 steps in a horizontal stepper
     Step 1: Basic Info (active, Deep Blue) → Step 2: Media → Step 3: Curriculum → Step 4: Publish

   STEP 1 FORM (currently active step):
   White card with generous padding:
   - Course Title: text input (full width) "e.g. Complete Web Development Bootcamp"
   - Short Description: text input (full width, 200 char limit, char counter shown)
   - Full Description: large textarea (400px height) with simple formatting toolbar
     (Bold, Italic, Bullet list icons)
   - Two-column row: Category dropdown | Level dropdown (Beginner/Intermediate/Advanced)
   - Two-column row: Language dropdown | Price input with $ prefix
   - What You'll Learn: dynamic list with "Add Item" button — shows 3 text inputs with
     delete icons each
   - Requirements: same dynamic list — 2 items shown
   - Bottom action row: "Save Draft" button (outlined) | "Next: Media →" button (Deep Blue)

Use Inter font. Clean form design with good label spacing, input focus states in blue.
```

---

## Page 11 — Manage Course Curriculum (Instructor)

```
Design a course curriculum management page for an instructor on an LMS platform.
This is Step 3 of the course creation process.

LAYOUT:
1. SIDEBAR: Same Deep Blue instructor sidebar.

2. MAIN CONTENT:
   - Page title: "Manage Curriculum — React Bootcamp"
   - Step progress bar showing Step 3: Curriculum (active)

   ADD SECTION ROW: Input field "New Section Title..." with "Add Section" button (outlined blue)

   SECTIONS LIST (drag-to-reorder):
   Show 3 sections, each as a white card:

   SECTION CARD DESIGN:
   - Gray drag handle (⠿) on left
   - Section title (bold) "Section 1: Introduction to React"
   - Lecture count "3 lectures · 45 mins"
   - Edit (pencil icon) and Delete (trash icon) buttons on right
   - Collapse/expand arrow
   - When EXPANDED, shows lecture list:
     Each lecture row (inside section card, slightly indented):
     * Drag handle | Play icon | "Lecture 1: What is React?" | 12:34 | Edit | Delete
     * Drag handle | Play icon | "Lecture 2: Setting up environment" | 8:20 | Edit | Delete
     * Drag handle | Play icon | "Lecture 3: Your first component" | (No video — orange "Upload Video" button)
   - "Add Lecture" button at bottom of section (dashed border, blue text)

   LECTURE UPLOAD MODAL (show as overlay):
   - Modal title: "Add Lecture"
   - Lecture title input
   - Video upload dropzone (dashed border, upload icon, "Drag & drop video or click to browse")
   - "Is this a free preview?" toggle switch
   - Cancel | Save Lecture buttons

Use Inter font. Drag handles clearly visible. Clean card design.
```

---

## Page 12 — Admin Dashboard

```
Design an admin dashboard page for an LMS platform called "LearnHub".

LAYOUT:
1. SIDEBAR (Deep Blue #1E3A5F, 240px):
   - LearnHub ADMIN logo at top
   - Admin avatar + "Super Admin" badge
   - Nav links: Dashboard (active) | Enrollment Approvals (badge: 12) | Users | Courses | Settings
   - Logout at bottom

2. MAIN CONTENT:

   HEADER ROW: "Dashboard" title + Today's date

   STATS ROW — 4 large cards:
   - Total Users: 1,248 ↑12% (blue user icon)
   - Total Courses: 56 ↑3 new (green book icon)
   - Pending Enrollments: 23 (orange clock icon, highlighted with orange border)
   - Revenue This Month: "Offline" with info icon (gray)

   SECOND ROW — Two cards side by side:
   
   PENDING ENROLLMENTS CARD (left, 60% width):
   - Title "Pending Enrollment Requests" with "View All" link
   - Table: Student | Course | Requested | Actions
   - 5 rows: each has student avatar + name, course name, "2 days ago",
     and two buttons: "Approve" (green small) | "Reject" (red small)
   
   RECENT USERS CARD (right, 40% width):
   - Title "Newly Registered Users"
   - List of 5 users: avatar, name, email, role badge, join date

   BOTTOM ROW:
   RECENT COURSES card: Table of 4 recently published courses with
   instructor name, category, status badge, student count.

Use Inter font. Professional admin panel design.
```

---

## Page 13 — Admin Enrollment Approvals Page

```
Design an admin enrollment approvals management page for an LMS platform.

LAYOUT:
1. SAME SIDEBAR as admin dashboard (Enrollment Approvals nav item active)

2. MAIN CONTENT:
   - Page title "Enrollment Approvals"
   - FILTER TAB BAR: All (47) | Pending (23) | Approved (18) | Rejected (6)
     Current tab: Pending — underlined with Deep Blue

   FILTER ROW: Search input "Search by student or course..." | Date range picker | Export button

   ENROLLMENTS TABLE: White card
   Columns: # | Student | Course | Requested Date | Payment Note | Status | Actions
   
   Show 6 rows. Mix of statuses:
   Row 1: Sarah Johnson | Complete React Bootcamp | Nov 15, 2024 | "Paid via bank transfer" | Pending (orange badge) | Approve (green btn) + Reject (red btn)
   Row 2: Mike Chen | Node.js Masterclass | Nov 14, 2024 | "Cash payment confirmed" | Pending (orange badge) | Approve + Reject buttons
   Row 3: Anna Smith | MongoDB Deep Dive | Nov 13, 2024 | — | Approved (green badge) | View button
   Row 4: David Lee | React Bootcamp | Nov 12, 2024 | "Needs verification" | Pending (orange badge) | Approve + Reject
   Row 5: Emma Wilson | TypeScript Bootcamp | Nov 11, 2024 | — | Rejected (red badge) | View button
   Row 6: James Brown | Complete React Bootcamp | Nov 10, 2024 | — | Approved (green badge) | View button

   REJECT MODAL (show as overlay): 
   - Title "Reject Enrollment"
   - Student name and course name shown
   - Textarea "Reason for rejection (will be emailed to student)"
   - Cancel | Confirm Rejection (red) buttons

   Pagination at bottom.
   Use Inter font. Clean table with good row spacing.
```

---

## Page 14 — Admin User Management Page

```
Design an admin user management page for an LMS platform.

LAYOUT:
1. SAME Deep Blue sidebar (Users nav item active)

2. MAIN CONTENT:
   - Page title "User Management"
   - Stats row: Total Users: 1,248 | Students: 1,089 | Instructors: 152 | Admins: 7

   FILTER ROW:
   - Search input "Search by name or email..."
   - Role filter dropdown: All Roles | Student | Instructor | Admin
   - Status filter: All | Active | Inactive
   - "Export" button

   USERS TABLE: White card
   Columns: User | Email | Role | Joined | Status | Actions

   Show 6 users:
   Row 1: [Avatar] Sarah Johnson | sarah@email.com | Student (blue badge) | Nov 2024 | Active (green dot) | Edit | Deactivate
   Row 2: [Avatar] John Smith | john@email.com | Instructor (purple badge) | Oct 2024 | Active (green dot) | Edit | Deactivate
   Row 3: [Avatar] Mike Chen | mike@email.com | Student (blue badge) | Nov 2024 | Active | Edit | Deactivate
   Row 4: [Avatar] Admin User | admin@email.com | Admin (red badge) | Jan 2024 | Active | Edit | —
   Row 5: [Avatar] Emma Wilson | emma@email.com | Student (blue badge) | Sep 2024 | Inactive (gray dot) | Edit | Activate
   Row 6: [Avatar] Anna Smith | anna@email.com | Instructor (purple badge) | Aug 2024 | Active | Edit | Deactivate

   EDIT USER MODAL (show as side drawer, right side):
   - Title "Edit User"
   - User avatar + name
   - Role dropdown: Student / Instructor / Admin
   - Account status toggle: Active / Inactive
   - Send Password Reset Email button (outlined)
   - Save Changes button (Deep Blue) | Cancel

Use Inter font. Professional admin table design.
```

---

## Tips for Best Results in Google Stitch

### Getting Better Output:
- **Use Experimental Mode** (Gemini 3 Pro) — better quality, worth the 50/month limit
- **One page at a time** — don't try to generate multiple pages in one prompt
- **Be specific about layout** — mention exact column widths, component positions
- **Reference your color codes** — include exact hex values like #1E3A5F

### Refining After Generation:
Use these follow-up prompts inside the Stitch chat after first generation:

```
Make the navbar sticky and add a notification bell icon next to the user avatar
```
```
Change the color scheme to use #1E3A5F as the primary deep blue
```
```
Make the course cards have a hover effect with a slight upward shadow lift
```
```
Add a mobile hamburger menu to the navbar for small screen sizes
```
```
Make the enrollment status badges pill-shaped with rounded corners
```

### Exporting to React:
1. Click **"View Code"** in Stitch — you get HTML + Tailwind CSS
2. Create a new `.jsx` file in your `/client/src/pages/` folder
3. Convert the HTML structure to JSX (change `class` → `className`)
4. Replace hardcoded data with your React state and API calls
5. The Tailwind classes work directly since your project uses Tailwind

### Page Generation Order:
Generate pages in this order for fastest workflow:
```
1. Login         → simplest, establishes your form style
2. Register      → builds on login pattern
3. Home          → establishes your brand look
4. Course Listing → reuses card components from home
5. Course Detail  → reuses card + navbar
6. My Learning    → student dashboard baseline
7. Video Player   → most unique layout
8. Instructor Dashboard → establishes sidebar pattern
9. Create Course  → reuses instructor sidebar
10. Curriculum Manager → reuses instructor sidebar
11. Admin Dashboard   → reuses sidebar pattern
12. Enrollment Approvals → reuses admin sidebar
13. User Management   → reuses admin sidebar
14. Forgot Password   → simplest auth page, save for last
```
