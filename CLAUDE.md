# LMS Platform — Claude Code Project Plan
> **Stack:** MERN (MongoDB, Express, React, Node.js)  
> **Phase:** 1 — MVP  
> **Read this entire file before writing any code.**

---

## 1. Project Overview

Build a full-featured Learning Management System (LMS) similar to Udemy/Coursera. The platform has three user roles:

- **Student** — Browse courses, request enrollment, watch videos
- **Instructor** — Create and manage courses, upload videos
- **Admin** — Approve/reject enrollments, manage users and platform

**MVP Features:**
- User authentication (JWT + Google OAuth)
- Instructor course creation with video upload (Cloudinary)
- Student enrollment request system (manual offline payment)
- Admin approval panel
- Email notifications (Nodemailer + SendGrid)
- Basic search and category filtering

**MVP does NOT include:**
- Online payment (added in Phase 2)
- Live sessions, certificates, quizzes (Phase 3)

---

## 2. Folder Structure

Scaffold exactly this structure before writing any logic:

```
/lms-platform
├── /client                          # React frontend (Vite)
│   ├── /public
│   ├── /src
│   │   ├── /assets
│   │   ├── /components
│   │   │   ├── /common              # Shared: Navbar, Footer, Spinner, Modal
│   │   │   ├── /course              # CourseCard, CourseList, VideoPlayer
│   │   │   ├── /dashboard           # StatCard, EnrollmentTable
│   │   │   └── /forms               # LoginForm, RegisterForm, CourseForm
│   │   ├── /pages
│   │   │   ├── /auth                # Login.jsx, Register.jsx
│   │   │   ├── /student             # Home.jsx, CourseDetail.jsx, MyLearning.jsx
│   │   │   ├── /instructor          # InstructorDashboard.jsx, CreateCourse.jsx, EditCourse.jsx
│   │   │   └── /admin               # AdminDashboard.jsx, EnrollmentApprovals.jsx, UserManagement.jsx
│   │   ├── /hooks                   # useAuth.js, useCourses.js, useEnrollment.js
│   │   ├── /store                   # Zustand stores: authStore.js, courseStore.js
│   │   ├── /services                # api.js (axios instance), authService.js, courseService.js
│   │   ├── /utils                   # helpers.js, constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── /server                          # Express backend
│   ├── /config
│   │   ├── db.js                    # MongoDB connection
│   │   ├── cloudinary.js            # Cloudinary setup
│   │   └── email.js                 # Nodemailer transporter
│   ├── /controllers
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── lectureController.js
│   │   └── adminController.js
│   ├── /middleware
│   │   ├── authMiddleware.js        # verifyToken
│   │   ├── roleMiddleware.js        # requireRole('admin'), requireRole('instructor')
│   │   ├── uploadMiddleware.js      # multer + cloudinary config
│   │   └── errorMiddleware.js       # global error handler
│   ├── /models
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Section.js
│   │   ├── Lecture.js
│   │   └── Enrollment.js
│   ├── /routes
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── lectureRoutes.js
│   │   └── adminRoutes.js
│   ├── /services
│   │   ├── emailService.js          # All email sending functions
│   │   └── cloudinaryService.js     # Upload/delete helpers
│   ├── /utils
│   │   └── apiResponse.js           # Standardized API response helpers
│   ├── .env
│   ├── server.js                    # Entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 3. Environment Variables

### `/server/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/lms
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=no-reply@yourlms.com
EMAIL_FROM_NAME=YourLMS

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLIENT_URL=http://localhost:5173
```

### `/client/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 4. MongoDB Schemas

### User.js
```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 }, // optional if Google OAuth only
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  googleId: { type: String },
  bio: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' }],
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
```

### Course.js
```javascript
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { 
    type: String, 
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'Design', 
           'Business', 'Marketing', 'Photography', 'Music', 'Other'],
    required: true 
  },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  language: { type: String, default: 'English' },
  price: { type: Number, required: true, default: 0 },
  thumbnail: { type: String, default: '' },
  thumbnailPublicId: { type: String },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  totalDuration: { type: Number, default: 0 }, // in seconds
  totalLectures: { type: Number, default: 0 },
  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  tags: [String],
  requirements: [String],
  whatYouLearn: [String],
}, { timestamps: true });

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Course', courseSchema);
```

### Section.js
```javascript
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Section', sectionSchema);
```

### Lecture.js
```javascript
const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  videoUrl: { type: String, required: true },       // Cloudinary URL
  videoPublicId: { type: String, required: true },  // for deletion
  duration: { type: Number, default: 0 },           // in seconds
  isPreview: { type: Boolean, default: false },      // free preview for non-enrolled
  order: { type: Number, default: 0 },
  resources: [{
    title: String,
    url: String,
  }],
}, { timestamps: true });

export default mongoose.model('Lecture', lectureSchema);
```

### Enrollment.js
```javascript
const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'offline' },
  paymentNote: { type: String, default: '' },       // admin note about offline payment
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedReason: { type: String },
  completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  progress: { type: Number, default: 0 },           // percentage 0-100
  lastAccessedAt: { type: Date },
}, { timestamps: true });

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
```

---

## 5. API Routes Reference

### Auth Routes — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/logout` | Private | Logout (clear cookie) |
| GET | `/me` | Private | Get current user profile |
| PUT | `/me` | Private | Update profile |
| POST | `/forgot-password` | Public | Send reset email |
| POST | `/reset-password/:token` | Public | Reset password |
| GET | `/google` | Public | Google OAuth redirect |
| GET | `/google/callback` | Public | Google OAuth callback |

### Course Routes — `/api/courses`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all published courses (with search & filter) |
| GET | `/:id` | Public | Get single course details |
| POST | `/` | Instructor | Create new course |
| PUT | `/:id` | Instructor (owner) | Update course |
| DELETE | `/:id` | Instructor (owner) | Delete course |
| PUT | `/:id/publish` | Instructor (owner) | Publish/unpublish course |
| POST | `/:id/thumbnail` | Instructor (owner) | Upload course thumbnail |

### Lecture Routes — `/api/courses/:courseId/sections/:sectionId/lectures`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Enrolled Student | Get all lectures in section |
| POST | `/` | Instructor | Create lecture + upload video |
| PUT | `/:lectureId` | Instructor | Update lecture details |
| DELETE | `/:lectureId` | Instructor | Delete lecture + remove from Cloudinary |

### Enrollment Routes — `/api/enrollments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Student | Request enrollment in a course |
| GET | `/my` | Student | Get my enrollments |
| GET | `/` | Admin | Get all enrollments (with filters) |
| PUT | `/:id/approve` | Admin | Approve enrollment |
| PUT | `/:id/reject` | Admin | Reject enrollment with reason |
| PUT | `/:id/progress` | Student | Update lecture completion |

### Admin Routes — `/api/admin`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | Dashboard stats (users, courses, enrollments) |
| GET | `/users` | Admin | Get all users |
| PUT | `/users/:id/role` | Admin | Change user role |
| PUT | `/users/:id/deactivate` | Admin | Deactivate user account |

---

## 6. Authentication Implementation

### JWT Strategy (use httpOnly cookies):
```javascript
// authController.js — login
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

### Auth Middleware:
```javascript
// middleware/authMiddleware.js
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
};

// middleware/roleMiddleware.js
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access forbidden' });
  }
  next();
};
```

---

## 7. Cloudinary Video Upload Setup

```javascript
// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
    transformation: [
      { width: 1280, height: 720, crop: 'limit', quality: 'auto' }  // cap at 720p for MVP
    ],
  },
});

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1280, height: 720, crop: 'fill' }],
  },
});

export const uploadVideo = multer({ 
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

export const uploadThumbnail = multer({ 
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
```

---

## 8. Email Service

```javascript
// config/email.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

```javascript
// services/emailService.js
import { transporter } from '../config/email.js';

const FROM = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`;

export const sendWelcomeEmail = async (user) => {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Welcome to YourLMS, ${user.name}!`,
    html: `
      <h2>Hi ${user.name}, welcome aboard!</h2>
      <p>Your account has been created successfully.</p>
      <p>Browse our courses and start learning today.</p>
      <a href="${process.env.CLIENT_URL}/courses" 
         style="background:#2E86C1;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Browse Courses
      </a>
    `,
  });
};

export const sendEnrollmentRequestEmail = async (student, course) => {
  // To student — confirmation of request
  await transporter.sendMail({
    from: FROM,
    to: student.email,
    subject: `Enrollment Request Received — ${course.title}`,
    html: `
      <h2>Hi ${student.name},</h2>
      <p>We received your enrollment request for <strong>${course.title}</strong>.</p>
      <p>Please complete your offline payment and we will approve your enrollment within 24 hours.</p>
    `,
  });
};

export const sendEnrollmentApprovedEmail = async (student, course) => {
  await transporter.sendMail({
    from: FROM,
    to: student.email,
    subject: `Enrollment Approved — ${course.title}`,
    html: `
      <h2>Great news, ${student.name}!</h2>
      <p>Your enrollment in <strong>${course.title}</strong> has been approved.</p>
      <p>You can now access all course materials.</p>
      <a href="${process.env.CLIENT_URL}/my-learning" 
         style="background:#1E8449;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Start Learning
      </a>
    `,
  });
};

export const sendEnrollmentRejectedEmail = async (student, course, reason) => {
  await transporter.sendMail({
    from: FROM,
    to: student.email,
    subject: `Enrollment Update — ${course.title}`,
    html: `
      <h2>Hi ${student.name},</h2>
      <p>Unfortunately your enrollment request for <strong>${course.title}</strong> could not be approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please contact us if you have any questions.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h2>Hi ${user.name},</h2>
      <p>You requested a password reset. Click the link below (valid for 1 hour):</p>
      <a href="${resetUrl}" 
         style="background:#2E86C1;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};

export const sendNewCourseNotificationEmail = async (students, course, instructor) => {
  // Send to all students when a new course is published
  const emails = students.map(s => s.email);
  await transporter.sendMail({
    from: FROM,
    bcc: emails, // use bcc to protect student privacy
    subject: `New Course: ${course.title} by ${instructor.name}`,
    html: `
      <h2>New course just published!</h2>
      <h3>${course.title}</h3>
      <p>${course.shortDescription}</p>
      <p><strong>Instructor:</strong> ${instructor.name}</p>
      <a href="${process.env.CLIENT_URL}/courses/${course._id}"
         style="background:#2E86C1;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        View Course
      </a>
    `,
  });
};
```

---

## 9. Enrollment Flow (MVP — Manual Payment)

```
1. Student browses courses → clicks "Enroll"
2. POST /api/enrollments → creates Enrollment { status: 'pending' }
3. Email sent to student: "Request received, please complete offline payment"
4. Admin sees pending enrollments in dashboard
5. Admin reviews → clicks Approve or Reject
6. PUT /api/enrollments/:id/approve
   → status = 'approved', approvedBy = admin._id, approvedAt = now
   → course.enrollmentCount += 1
   → email sent to student: "Enrollment approved!"
7. Student can now access all course videos
```

### Guard access to lectures:
```javascript
// In lectureController.js — before returning video URL
const enrollment = await Enrollment.findOne({
  student: req.user._id,
  course: courseId,
  status: 'approved',
});

// Allow access if: approved enrollment OR lecture.isPreview === true
if (!enrollment && !lecture.isPreview) {
  return res.status(403).json({ message: 'Please enroll to access this lecture' });
}
```

---

## 10. Frontend Pages & Components

### Pages to Build:
```
/                        → Home (hero, featured courses, categories)
/courses                 → Course listing with search & filters
/courses/:id             → Course detail (info, curriculum, enroll button)
/my-learning             → Student's enrolled courses
/learn/:courseId         → Video player + curriculum sidebar
/login                   → Login form + Google OAuth button
/register                → Registration form
/forgot-password         → Password reset request
/instructor/dashboard    → Stats, course list, quick actions
/instructor/courses/new  → Create course form
/instructor/courses/:id  → Edit course, manage sections & lectures
/admin/dashboard         → Platform stats overview
/admin/enrollments       → Pending, approved, rejected enrollment table
/admin/users             → User list with role management
```

### Zustand Auth Store:
```javascript
// store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}), { name: 'auth-storage' }));
```

### Axios Instance:
```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send httpOnly cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Protected Route Component:
```jsx
// components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Usage in App.jsx:
// <Route path="/admin/*" element={
//   <ProtectedRoute allowedRoles={['admin']}>
//     <AdminDashboard />
//   </ProtectedRoute>
// } />
```

---

## 11. Server Entry Point

```javascript
// server/server.js
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Global error handler (must be last)
app.use(errorHandler);

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error('DB connection failed:', err));
```

---

## 12. Server Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "cloudinary": "^1.41.3",
    "multer": "^1.4.5-lts.1",
    "multer-storage-cloudinary": "^4.0.0",
    "nodemailer": "^6.9.7",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "crypto": "^1.0.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "express-mongo-sanitize": "^2.2.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## 13. Client Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.8.4",
    "react-player": "^2.13.0",
    "react-hook-form": "^7.48.2",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.6",
    "@headlessui/react": "^1.7.17",
    "date-fns": "^2.30.0"
  }
}
```

---

## 14. Build Order (Follow Exactly)

Build in this sequence to avoid blockers:

```
BACKEND:
Step 1  → server.js + db.js (basic server + DB connection)
Step 2  → All Mongoose models (User, Course, Section, Lecture, Enrollment)
Step 3  → authController + authRoutes (register, login, me)
Step 4  → authMiddleware + roleMiddleware
Step 5  → Cloudinary config + uploadMiddleware
Step 6  → courseController + courseRoutes (CRUD)
Step 7  → lectureController + lectureRoutes (with video upload)
Step 8  → Email config + emailService (all 5 email functions)
Step 9  → enrollmentController + enrollmentRoutes
Step 10 → adminController + adminRoutes
Step 11 → errorMiddleware (global error handler)

FRONTEND:
Step 12 → Vite project setup + Tailwind + React Router
Step 13 → api.js (axios instance) + authStore (Zustand)
Step 14 → Auth pages (Login, Register) + ProtectedRoute
Step 15 → Home page + Course listing page
Step 16 → Course detail page + enrollment request button
Step 17 → Video player page (react-player with Cloudinary URL)
Step 18 → Instructor dashboard + CreateCourse form
Step 19 → Section & Lecture management (drag-to-reorder sections)
Step 20 → Admin dashboard + enrollment approval table
Step 21 → My Learning page (student enrolled courses)
Step 22 → Password reset flow (forgot + reset pages)
```

---

## 15. Security Checklist

Implement all of these before considering MVP complete:

- [ ] Passwords hashed with bcrypt (salt rounds: 12)
- [ ] JWT stored in httpOnly cookies (NOT localStorage)
- [ ] CORS restricted to CLIENT_URL only
- [ ] Rate limiting on auth routes (max 10 req/15min)
- [ ] Helmet.js for security headers
- [ ] MongoDB query sanitization (express-mongo-sanitize)
- [ ] File type validation on uploads (videos & images only)
- [ ] File size limits enforced (video: 500MB, image: 5MB)
- [ ] Instructors can only edit their own courses
- [ ] Admin-only routes protected with requireRole('admin')
- [ ] Video URLs only returned to enrolled students (or isPreview === true)
- [ ] Password reset tokens expire in 1 hour
- [ ] Input validation on all POST/PUT routes

---

## 16. API Response Format

Use consistent responses across ALL endpoints:

```javascript
// utils/apiResponse.js
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = 'Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// middleware/errorMiddleware.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
```

---

## 17. Search & Filter (Course Listing)

```javascript
// courseController.js — getAllCourses
export const getAllCourses = async (req, res) => {
  const { 
    search, category, level, minPrice, maxPrice, 
    page = 1, limit = 12, sortBy = 'createdAt' 
  } = req.query;

  const query = { status: 'published' };

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (level) query.level = level;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (page - 1) * limit;
  const sortOptions = {
    'newest': { createdAt: -1 },
    'popular': { enrollmentCount: -1 },
    'rating': { rating: -1 },
    'price-low': { price: 1 },
    'price-high': { price: -1 },
  };

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('instructor', 'name avatar')
      .sort(sortOptions[sortBy] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-sections'),
    Course.countDocuments(query),
  ]);

  return successResponse(res, {
    courses,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
};
```

---

## 18. Git & Scripts

### `.gitignore`
```
node_modules/
.env
dist/
*.log
.DS_Store
```

### `package.json` scripts (root — optional monorepo):
```json
{
  "scripts": {
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

### Server `package.json` scripts:
```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## 19. Phase 2 Preparation Notes

When Phase 1 is stable, these are the exact changes needed for Phase 2:

1. **Stripe** — Add `price` to Enrollment, replace `paymentMethod: 'offline'` with Stripe Checkout session
2. **Mux** — Replace Cloudinary video URLs with Mux playback IDs. Only `videoUrl` field in Lecture schema changes
3. **MongoDB Atlas M10** — Just upgrade tier in Atlas dashboard, no code changes
4. **Stripe Connect** — Add `stripeAccountId` to User schema for instructor payouts

All Phase 2 changes are additive — no existing Phase 1 code needs to be deleted.

---

## 20. Key Rules for Claude Code

- **Always use ES Modules** (`import/export`) on the backend, not CommonJS
- **Never store JWT in localStorage** — use httpOnly cookies only
- **Always populate** instructor name/avatar when returning courses
- **Always check ownership** before allowing instructor to edit a course
- **Always delete from Cloudinary** when deleting a lecture or course thumbnail
- **Send emails asynchronously** — do not await email sending inside request handlers (use `.catch()` to log failures without breaking the response)
- **Use `Promise.all()`** for parallel DB queries
- **Paginate all list endpoints** — never return unbounded arrays
- **Use `select('-password')`** whenever querying users
- **Test every email trigger** manually before marking a feature complete
