# 🧪 LMS Platform - Testing Guide

**Status:** All servers running ✅
**Test Accounts:** Ready ✅

---

## ✅ Server Status

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **Database:** MongoDB Atlas (Connected)

---

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | admin123 |
| Instructor | instructor@lms.com | instructor123 |
| Student | student@lms.com | student123 |

---

## 🎯 Quick Test Flow (20 minutes)

### 1. Instructor Creates Course
- Login: instructor@lms.com / instructor123
- Create course → Add sections → Upload videos → Publish

### 2. Student Enrolls
- Login: student@lms.com / student123
- Browse courses → Request enrollment → Check My Learning (Pending)

### 3. Admin Approves
- Login: admin@lms.com / admin123
- Go to Enrollments → Approve request

### 4. Student Watches Videos
- Refresh My Learning → Status: Approved
- Click "Continue Learning" → Watch & complete lectures

---

## 📋 Testing Checklist

### Authentication ✅
- [ ] Register new user
- [ ] Login with credentials
- [ ] Google OAuth login
- [ ] Password reset
- [ ] JWT in httpOnly cookies

### Student Features ✅
- [ ] Browse courses
- [ ] Search & filter
- [ ] View course details
- [ ] Request enrollment
- [ ] Watch videos
- [ ] Track progress

### Instructor Features ✅
- [ ] Create course
- [ ] Upload videos
- [ ] Manage curriculum
- [ ] Publish course

### Admin Features ✅
- [ ] View dashboard stats
- [ ] Approve/reject enrollments
- [ ] Manage user roles
- [ ] Activate/deactivate users

---

## 🔒 Security Tests

1. **Unauthorized Access:** Logout → Try /admin → Redirects to login
2. **Role Protection:** Student → Try /instructor → Blocked
3. **File Limits:** Upload 600MB video → Rejected
4. **Rate Limiting:** 15 rapid logins → Blocked after 10

---

## 📧 Email Tests (If SendGrid configured)

- Welcome email on registration
- Enrollment request confirmation
- Approval/rejection notifications
- Password reset emails

---

## 📱 Mobile Testing

Test on: iPhone (390px), iPad (768px), Desktop (1920px)
- All pages responsive
- Forms usable
- Video player adapts

---

## ⚡ Performance

- Page load: < 3 seconds
- API response: < 500ms
- Video start: < 5 seconds

---

## 🔗 Quick Links

- Login: http://localhost:5173/login
- Courses: http://localhost:5173/courses
- Admin: http://localhost:5173/admin/dashboard

**All MVP features ready for testing! 🚀**
