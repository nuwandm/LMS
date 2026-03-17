---
pdf_options:
  format: A4
  margin: 20mm 15mm
  printBackground: true
stylesheet: styles.css
---

<div class="cover">
  <div class="cover-top">
    <div class="logo-box">LH</div>
    <div class="company-name">LearnHub</div>
  </div>
  <div class="cover-center">
    <div class="proposal-badge">PROJECT PROPOSAL</div>
    <h1 class="cover-title">LMS Platform<br>Development</h1>
    <p class="cover-sub">A Full-Featured Learning Management System<br>Built on MERN Stack Technology</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-meta">
      <div class="meta-item"><span class="meta-label">Prepared By</span><span class="meta-value">LearnHub Dev Team</span></div>
      <div class="meta-item"><span class="meta-label">Date</span><span class="meta-value">February 2026</span></div>
      <div class="meta-item"><span class="meta-label">Version</span><span class="meta-value">v1.0</span></div>
    </div>
  </div>
</div>

<div class="page-break"></div>

---

## 1. Project Overview

This proposal outlines the complete development of a **Learning Management System (LMS)** platform — similar to Udemy and Coursera — tailored to your specific requirements. The platform will support three user roles: **Students**, **Instructors**, and **Admins**, delivering a seamless online learning experience.

<div class="info-grid">
  <div class="info-card">
    <div class="info-icon">⚙️</div>
    <div class="info-title">Tech Stack</div>
    <div class="info-desc">MongoDB · Express.js · React.js · Node.js (MERN)</div>
  </div>
  <div class="info-card">
    <div class="info-icon">☁️</div>
    <div class="info-title">Cloud Services</div>
    <div class="info-desc">Cloudinary (Video) · SendGrid (Email) · MongoDB Atlas</div>
  </div>
  <div class="info-card">
    <div class="info-icon">🔐</div>
    <div class="info-title">Authentication</div>
    <div class="info-desc">JWT Tokens · Google OAuth 2.0 · httpOnly Cookies</div>
  </div>
  <div class="info-card">
    <div class="info-icon">📱</div>
    <div class="info-title">Design</div>
    <div class="info-desc">Fully Responsive · Tailwind CSS · Modern UI/UX</div>
  </div>
</div>

---

## 2. Platform User Roles

<div class="roles-grid">
  <div class="role-card student">
    <div class="role-header">👨‍🎓 Student</div>
    <ul>
      <li>Browse & search courses</li>
      <li>Request enrollment</li>
      <li>Watch video lectures</li>
      <li>Track learning progress</li>
      <li>View certificates</li>
    </ul>
  </div>
  <div class="role-card instructor">
    <div class="role-header">👨‍🏫 Instructor</div>
    <ul>
      <li>Create & manage courses</li>
      <li>Upload video lectures</li>
      <li>Manage course curriculum</li>
      <li>View enrolled students</li>
      <li>Track course analytics</li>
    </ul>
  </div>
  <div class="role-card admin">
    <div class="role-header">👨‍💼 Admin</div>
    <ul>
      <li>Approve / reject enrollments</li>
      <li>Manage all users & roles</li>
      <li>View platform statistics</li>
      <li>Monitor all courses</li>
      <li>Full platform control</li>
    </ul>
  </div>
</div>

---

<div class="page-break"></div>

## 3. Development Phases & Pricing

<div class="phase-header mvp-header">
  <div class="phase-number">01</div>
  <div class="phase-info">
    <div class="phase-title">Phase 1 — MVP (Minimum Viable Product)</div>
    <div class="phase-duration">⏱ Estimated Duration: 9 Weeks</div>
  </div>
  <div class="phase-price-box">
    <div class="phase-price">LKR 60,000</div>
    <div class="phase-price-label">Full Payment</div>
  </div>
</div>

### What's Included in MVP

<div class="feature-grid">
  <div class="feature-section">
    <div class="feature-section-title">🔐 Authentication System</div>
    <ul class="feature-list">
      <li>User registration & login</li>
      <li>Google OAuth 2.0 sign-in</li>
      <li>JWT secure authentication</li>
      <li>Forgot & reset password</li>
      <li>Role-based access control</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">📚 Course Management</div>
    <ul class="feature-list">
      <li>Course creation (instructor)</li>
      <li>Video upload to Cloudinary</li>
      <li>Section & lecture management</li>
      <li>Course publish / unpublish</li>
      <li>Thumbnail upload</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">🎓 Student Features</div>
    <ul class="feature-list">
      <li>Browse & search courses</li>
      <li>Course detail page</li>
      <li>Enrollment request system</li>
      <li>Video player (Cloudinary)</li>
      <li>Progress tracking</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">🛡️ Admin Panel</div>
    <ul class="feature-list">
      <li>Admin dashboard & stats</li>
      <li>Approve / reject enrollments</li>
      <li>User management & roles</li>
      <li>Activate / deactivate accounts</li>
      <li>Platform overview reports</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">📧 Email Notifications</div>
    <ul class="feature-list">
      <li>Welcome email on register</li>
      <li>Enrollment request confirmation</li>
      <li>Enrollment approved email</li>
      <li>Enrollment rejected email</li>
      <li>Password reset email</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">🔒 Security</div>
    <ul class="feature-list">
      <li>Rate limiting on all routes</li>
      <li>Helmet.js security headers</li>
      <li>MongoDB injection prevention</li>
      <li>File validation & size limits</li>
      <li>Secure cookie handling</li>
    </ul>
  </div>
</div>

<div class="payment-box mvp-payment">
  <div class="payment-row">
    <div class="payment-label">💳 Advance Payment <span class="payment-note">(Development starts after receipt)</span></div>
    <div class="payment-amount advance">LKR 20,000</div>
  </div>
  <div class="payment-divider"></div>
  <div class="payment-row">
    <div class="payment-label">💰 Remaining Balance <span class="payment-note">(Due on MVP delivery)</span></div>
    <div class="payment-amount remaining">LKR 40,000</div>
  </div>
  <div class="payment-divider total-divider"></div>
  <div class="payment-row total-row">
    <div class="payment-label total-label">🏷️ Phase 1 Total</div>
    <div class="payment-amount total-amount">LKR 60,000</div>
  </div>
</div>

<div class="page-break"></div>

---

<div class="phase-header phase2-header">
  <div class="phase-number">02</div>
  <div class="phase-info">
    <div class="phase-title">Phase 2 — Payment & Video Upgrade</div>
    <div class="phase-duration">⏱ Estimated Duration: 4–5 Weeks</div>
  </div>
  <div class="phase-price-box">
    <div class="phase-price">LKR 50,000</div>
    <div class="phase-price-label">Full Payment</div>
  </div>
</div>

### What's Included in Phase 2

<div class="feature-grid">
  <div class="feature-section">
    <div class="feature-section-title">💳 Online Payment (Stripe)</div>
    <ul class="feature-list">
      <li>Stripe Checkout integration</li>
      <li>Secure online payments</li>
      <li>Auto-approve enrollment on payment</li>
      <li>Payment history for students</li>
      <li>Instructor payout via Stripe Connect</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">🎬 Professional Video (Mux)</div>
    <ul class="feature-list">
      <li>Replace Cloudinary with Mux</li>
      <li>Adaptive bitrate streaming</li>
      <li>Faster video load times</li>
      <li>DRM content protection</li>
      <li>HD quality video delivery</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">🔍 Smart Search (Algolia)</div>
    <ul class="feature-list">
      <li>Instant search results</li>
      <li>Typo-tolerant search</li>
      <li>Advanced faceted filters</li>
      <li>Search analytics</li>
      <li>Faster than MongoDB search</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">📊 Analytics Dashboard</div>
    <ul class="feature-list">
      <li>Revenue reports & charts</li>
      <li>Student completion rates</li>
      <li>Course performance metrics</li>
      <li>Enrollment trend graphs</li>
      <li>Export reports to CSV</li>
    </ul>
  </div>
</div>

<div class="payment-box phase2-payment">
  <div class="payment-row total-row">
    <div class="payment-label total-label">🏷️ Phase 2 Full Payment</div>
    <div class="payment-amount total-amount">LKR 50,000</div>
  </div>
</div>

---

<div class="phase-header phase3-header">
  <div class="phase-number">03</div>
  <div class="phase-info">
    <div class="phase-title">Phase 3 — Advanced Features</div>
    <div class="phase-duration">⏱ Estimated Duration: 5–6 Weeks</div>
  </div>
  <div class="phase-price-box">
    <div class="phase-price">LKR 50,000</div>
    <div class="phase-price-label">Full Payment</div>
  </div>
</div>

### What's Included in Phase 3

<div class="feature-grid">
  <div class="feature-section">
    <div class="feature-section-title">📹 Live Sessions (Daily.co)</div>
    <ul class="feature-list">
      <li>Live video classes</li>
      <li>Screen sharing support</li>
      <li>Session recording</li>
      <li>Scheduled class calendar</li>
      <li>SMS alerts via Twilio</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">📝 Quizzes & Assignments</div>
    <ul class="feature-list">
      <li>Quiz builder for instructors</li>
      <li>Auto-grading system</li>
      <li>Assignment submissions</li>
      <li>Quiz result analytics</li>
      <li>Retake limits & timers</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">🏆 Certificates</div>
    <ul class="feature-list">
      <li>Auto-generated PDF certificates</li>
      <li>Unique certificate ID</li>
      <li>Certificate verification page</li>
      <li>Downloadable & shareable</li>
      <li>Custom certificate template</li>
    </ul>
  </div>
  <div class="feature-section">
    <div class="feature-section-title">⭐ Reviews & Community</div>
    <ul class="feature-list">
      <li>Star rating system</li>
      <li>Course reviews & comments</li>
      <li>Discussion forums per lecture</li>
      <li>Student Q&A section</li>
      <li>Instructor responses</li>
    </ul>
  </div>
</div>

<div class="payment-box phase3-payment">
  <div class="payment-row total-row">
    <div class="payment-label total-label">🏷️ Phase 3 Full Payment</div>
    <div class="payment-amount total-amount">LKR 50,000</div>
  </div>
</div>

<div class="page-break"></div>

---

## 4. Complete Pricing Summary

<div class="summary-table-wrap">
  <table class="summary-table">
    <thead>
      <tr>
        <th>Phase</th>
        <th>Description</th>
        <th>Duration</th>
        <th>Full Payment</th>
        <th>Advance</th>
      </tr>
    </thead>
    <tbody>
      <tr class="mvp-row">
        <td><span class="phase-badge mvp-badge">Phase 1</span></td>
        <td>MVP — Core Platform</td>
        <td>9 Weeks</td>
        <td class="price-cell">LKR 60,000</td>
        <td class="advance-cell">LKR 20,000</td>
      </tr>
      <tr class="p2-row">
        <td><span class="phase-badge p2-badge">Phase 2</span></td>
        <td>Payment, Video & Search</td>
        <td>4–5 Weeks</td>
        <td class="price-cell">LKR 50,000</td>
        <td class="advance-cell">—</td>
      </tr>
      <tr class="p3-row">
        <td><span class="phase-badge p3-badge">Phase 3</span></td>
        <td>Live, Quizzes & Certificates</td>
        <td>5–6 Weeks</td>
        <td class="price-cell">LKR 50,000</td>
        <td class="advance-cell">—</td>
      </tr>
      <tr class="total-row-final">
        <td colspan="3"><strong>Total Project Investment</strong></td>
        <td class="price-cell grand-total" colspan="2">LKR 160,000</td>
      </tr>
    </tbody>
  </table>
</div>

---

## 5. Monthly Infrastructure Costs

> These are **third-party service costs** paid directly by the client. Not included in development fees.

<table class="infra-table">
  <thead>
    <tr>
      <th>Service</th>
      <th>Purpose</th>
      <th>Free Tier</th>
      <th>Paid Plan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>MongoDB Atlas</td>
      <td>Database hosting</td>
      <td>Free (M0)</td>
      <td>~LKR 17,000/mo (M10)</td>
    </tr>
    <tr>
      <td>Cloudinary</td>
      <td>Video & image hosting</td>
      <td>Free (25GB)</td>
      <td>~LKR 32,000/mo</td>
    </tr>
    <tr>
      <td>SendGrid</td>
      <td>Email notifications</td>
      <td>Free (100/day)</td>
      <td>~LKR 6,500/mo</td>
    </tr>
    <tr>
      <td>Railway / Render</td>
      <td>Backend server hosting</td>
      <td>Free tier</td>
      <td>~LKR 1,500/mo</td>
    </tr>
    <tr>
      <td>Vercel</td>
      <td>Frontend hosting</td>
      <td>Free</td>
      <td>~LKR 6,500/mo</td>
    </tr>
    <tr class="total-infra">
      <td colspan="2"><strong>MVP Estimated Total</strong></td>
      <td><strong>LKR 0/mo</strong></td>
      <td><strong>~LKR 64,000/mo</strong></td>
    </tr>
  </tbody>
</table>

<div class="note-box">
  💡 <strong>Recommendation:</strong> Start with free tiers during MVP. Upgrade to paid plans only when you have active users and revenue.
</div>

<div class="page-break"></div>

---

## 6. Project Timeline

<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot mvp-dot"></div>
    <div class="timeline-content">
      <div class="timeline-phase">Phase 1 — MVP</div>
      <div class="timeline-weeks">Weeks 1–9</div>
      <div class="timeline-desc">Setup → Backend → Frontend → Testing → Deployment</div>
    </div>
  </div>
  <div class="timeline-item">
    <div class="timeline-dot p2-dot"></div>
    <div class="timeline-content">
      <div class="timeline-phase">Phase 2 — Payment & Video</div>
      <div class="timeline-weeks">Weeks 10–14</div>
      <div class="timeline-desc">Stripe, Mux video, Algolia search, Analytics</div>
    </div>
  </div>
  <div class="timeline-item">
    <div class="timeline-dot p3-dot"></div>
    <div class="timeline-content">
      <div class="timeline-phase">Phase 3 — Advanced</div>
      <div class="timeline-weeks">Weeks 15–21</div>
      <div class="timeline-desc">Live sessions, Quizzes, Certificates, Community</div>
    </div>
  </div>
  <div class="timeline-item">
    <div class="timeline-dot done-dot"></div>
    <div class="timeline-content">
      <div class="timeline-phase">Full Platform Live 🎉</div>
      <div class="timeline-weeks">Week 21+</div>
      <div class="timeline-desc">Complete LMS platform ready for production</div>
    </div>
  </div>
</div>

---

## 7. Payment Terms & Conditions

<div class="terms-grid">
  <div class="term-item">
    <div class="term-number">01</div>
    <div class="term-text"><strong>Advance Payment:</strong> LKR 20,000 is required before Phase 1 development begins. Work starts only after advance payment is received.</div>
  </div>
  <div class="term-item">
    <div class="term-number">02</div>
    <div class="term-text"><strong>Phase Completion:</strong> Each phase is delivered as a working product. Remaining balance for each phase is due upon delivery.</div>
  </div>
  <div class="term-item">
    <div class="term-number">03</div>
    <div class="term-text"><strong>Revisions:</strong> Each phase includes up to 2 rounds of reasonable revisions at no extra cost. Major scope changes will be quoted separately.</div>
  </div>
  <div class="term-item">
    <div class="term-number">04</div>
    <div class="term-text"><strong>Source Code:</strong> Full source code and ownership is transferred to the client after final payment of each phase.</div>
  </div>
  <div class="term-item">
    <div class="term-number">05</div>
    <div class="term-text"><strong>Infrastructure:</strong> Third-party service accounts (MongoDB, Cloudinary, SendGrid) must be created by the client. Costs are the client's responsibility.</div>
  </div>
  <div class="term-item">
    <div class="term-number">06</div>
    <div class="term-text"><strong>Support:</strong> 2 weeks of free bug-fix support after each phase delivery. Post-support maintenance can be arranged at LKR 5,000/month.</div>
  </div>
</div>

---

## 8. What You Get

<div class="deliverables-grid">
  <div class="deliverable">✅ Full source code (client + server)</div>
  <div class="deliverable">✅ Database schema & seed data</div>
  <div class="deliverable">✅ Deployed & live application</div>
  <div class="deliverable">✅ Environment setup documentation</div>
  <div class="deliverable">✅ API documentation</div>
  <div class="deliverable">✅ Admin credentials & handover</div>
  <div class="deliverable">✅ 2-week post-launch support</div>
  <div class="deliverable">✅ Git repository access</div>
</div>

---

<div class="footer-section">
  <div class="footer-left">
    <div class="footer-logo">LH</div>
    <div>
      <div class="footer-company">LearnHub Dev Team</div>
      <div class="footer-tagline">Building the future of online learning</div>
    </div>
  </div>
  <div class="footer-right">
    <div class="footer-total-label">Total Investment</div>
    <div class="footer-total-price">LKR 160,000</div>
    <div class="footer-phases">Across 3 Phases</div>
  </div>
</div>
