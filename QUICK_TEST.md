# 🚀 Quick MVP Test Guide

## ✅ Servers Running

- **Backend:** http://localhost:5000 ✅
- **Frontend:** http://localhost:5173 ✅

---

## 🎯 5-Minute Quick Test

### Step 1: Login as Instructor (2 min)

1. **Open:** http://localhost:5173/login
2. **Login:**
   - Email: `instructor@lms.com`
   - Password: `instructor123`
3. **You'll see:** Instructor Dashboard

### Step 2: Create a Test Course (2 min)

1. Click **"Create New Course"**
2. Fill in:
   - Title: `Test React Course`
   - Description: `Learning React basics`
   - Category: `Web Development`
   - Level: `Beginner`
   - Price: `0` (free for testing)
3. Click **"Save & Continue"**
4. Skip thumbnail (optional)
5. Click **"Save & Continue"**
6. Add Section: `Introduction`
7. Click **"Publish Course"**

### Step 3: Test as Student (1 min)

1. **Logout** (top right)
2. **Login as Student:**
   - Email: `student@lms.com`
   - Password: `student123`
3. Go to **"Courses"** (browse)
4. Find your test course
5. Click **"Enroll"**
6. Go to **"My Learning"**
7. See status: **"Pending"**

### Step 4: Admin Approves

1. **Logout**
2. **Login as Admin:**
   - Email: `admin@lms.com`
   - Password: `admin123`
3. Go to **"Enrollments"** (or /admin/enrollments)
4. Find pending enrollment
5. Click **green checkmark** ✓
6. Status changes to **"Approved"**

### Step 5: Student Watches

1. **Logout and login as student again**
2. Go to **"My Learning"**
3. Status now: **"Approved"**
4. Click **"Continue Learning"**
5. ✅ **SUCCESS!** Course access granted

---

## 🎉 If You See This - MVP Works!

All core features tested:
- ✅ Authentication
- ✅ Course creation
- ✅ Enrollment request
- ✅ Admin approval
- ✅ Course access

---

## 🔗 Quick Links

- **Home:** http://localhost:5173
- **Login:** http://localhost:5173/login
- **Courses:** http://localhost:5173/courses
- **Admin:** http://localhost:5173/admin/dashboard
- **Instructor:** http://localhost:5173/instructor/dashboard

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | admin123 |
| Instructor | instructor@lms.com | instructor123 |
| Student | student@lms.com | student123 |

---

**Start testing now!** 🚀
