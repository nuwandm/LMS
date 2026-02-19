import { transporter, emailFrom, verifyEmailConfig } from '../config/email.js';

const FROM = `"${emailFrom.name}" <${emailFrom.email}>`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Send email helper with fallback to console logging
 * @param {Object} mailOptions - Nodemailer mail options
 */
const sendEmail = async (mailOptions) => {
  try {
    // Try to send email via SendGrid
    const info = await transporter.sendMail({
      from: FROM,
      ...mailOptions,
    });
    console.log('✉️  Email sent:', mailOptions.subject, 'to', mailOptions.to);
    return info;
  } catch (error) {
    // If SendGrid not configured, log email to console
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL (Console Mode - SendGrid not configured)');
    console.log('='.repeat(60));
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('---');
    console.log(mailOptions.text || mailOptions.html);
    console.log('='.repeat(60) + '\n');

    // Don't throw error - just log it
    return { messageId: 'console-mode' };
  }
};

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Send welcome email to new users
 * @param {Object} user - User object
 */
export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    to: user.email,
    subject: `Welcome to ${emailFrom.name}, ${user.name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A5F; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #2E86C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${emailFrom.name}!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name}, welcome aboard! 👋</h2>
            <p>Your account has been created successfully as a <strong>${user.role}</strong>.</p>

            ${user.role === 'student' ? `
              <p>You can now browse our courses and start your learning journey.</p>
              <a href="${CLIENT_URL}/courses" class="button">Browse Courses</a>
            ` : user.role === 'instructor' ? `
              <p>You can now create courses and share your knowledge with thousands of students.</p>
              <a href="${CLIENT_URL}/instructor/dashboard" class="button">Go to Dashboard</a>
            ` : ''}

            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Happy learning!</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 ${emailFrom.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${user.name}, welcome to ${emailFrom.name}!

      Your account has been created successfully as a ${user.role}.

      ${user.role === 'student' ? 'Browse courses and start learning at: ' + CLIENT_URL + '/courses' : ''}
      ${user.role === 'instructor' ? 'Create your first course at: ' + CLIENT_URL + '/instructor/dashboard' : ''}

      Happy learning!
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Send enrollment request confirmation to student
 * @param {Object} student - Student user object
 * @param {Object} course - Course object
 */
export const sendEnrollmentRequestEmail = async (student, course) => {
  const mailOptions = {
    to: student.email,
    subject: `Enrollment Request Received — ${course.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A5F; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .course-info { background: white; padding: 20px; border-left: 4px solid #2E86C1; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Enrollment Request Received</h1>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>We received your enrollment request for:</p>

            <div class="course-info">
              <h3>${course.title}</h3>
              <p><strong>Instructor:</strong> ${course.instructor?.name || 'Unknown'}</p>
              <p><strong>Price:</strong> $${course.price}</p>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Complete your offline payment (if required)</li>
              <li>Our admin will review your request within 24 hours</li>
              <li>You'll receive an email once approved</li>
            </ol>

            <p>You can check your enrollment status in your dashboard.</p>
            <p>Thank you for choosing ${emailFrom.name}!</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 ${emailFrom.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${student.name},

      We received your enrollment request for: ${course.title}
      Instructor: ${course.instructor?.name || 'Unknown'}
      Price: $${course.price}

      Next Steps:
      1. Complete your offline payment (if required)
      2. Our admin will review your request within 24 hours
      3. You'll receive an email once approved

      Thank you!
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Send enrollment approval notification
 * @param {Object} student - Student user object
 * @param {Object} course - Course object
 */
export const sendEnrollmentApprovedEmail = async (student, course) => {
  const courseUrl = `${CLIENT_URL}/learn/${course._id}`;

  const mailOptions = {
    to: student.email,
    subject: `🎉 Enrollment Approved — ${course.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E8449; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .course-info { background: white; padding: 20px; border-left: 4px solid #1E8449; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #1E8449; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Great News!</h1>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>Your enrollment has been <strong>approved</strong>!</p>

            <div class="course-info">
              <h3>${course.title}</h3>
              <p><strong>Instructor:</strong> ${course.instructor?.name || 'Unknown'}</p>
              <p><strong>Total Lectures:</strong> ${course.totalLectures || 0}</p>
              <p><strong>Duration:</strong> ${Math.floor((course.totalDuration || 0) / 3600)}h ${Math.floor(((course.totalDuration || 0) % 3600) / 60)}m</p>
            </div>

            <p>You can now access all course materials and start learning immediately.</p>
            <a href="${courseUrl}" class="button">Start Learning</a>

            <p>Happy learning!</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 ${emailFrom.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${student.name},

      Great news! Your enrollment has been approved for: ${course.title}

      You can now access all course materials.
      Start learning: ${courseUrl}

      Happy learning!
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Send enrollment rejection notification
 * @param {Object} student - Student user object
 * @param {Object} course - Course object
 * @param {String} reason - Rejection reason
 */
export const sendEnrollmentRejectedEmail = async (student, course, reason) => {
  const mailOptions = {
    to: student.email,
    subject: `Enrollment Update — ${course.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #922B21; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .reason-box { background: white; padding: 20px; border-left: 4px solid #922B21; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Enrollment Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>Unfortunately, your enrollment request for <strong>${course.title}</strong> could not be approved at this time.</p>

            ${reason ? `
              <div class="reason-box">
                <h3>Reason:</h3>
                <p>${reason}</p>
              </div>
            ` : ''}

            <p>If you have any questions or concerns, please contact our support team at ${emailFrom.email}.</p>
            <p>We appreciate your interest and hope to serve you in the future.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 ${emailFrom.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${student.name},

      Unfortunately, your enrollment request for "${course.title}" could not be approved.

      ${reason ? 'Reason: ' + reason : ''}

      Please contact us at ${emailFrom.email} if you have any questions.
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {String} resetToken - Reset token
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A5F; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #2E86C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>You requested a password reset for your ${emailFrom.name} account.</p>
            <p>Click the button below to reset your password (valid for 1 hour):</p>

            <a href="${resetUrl}" class="button">Reset Password</a>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2E86C1;">${resetUrl}</p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2026 ${emailFrom.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${user.name},

      You requested a password reset for your ${emailFrom.name} account.

      Reset your password (valid for 1 hour):
      ${resetUrl}

      If you did not request this, ignore this email.
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Send new course notification to all students
 * @param {Array} students - Array of student objects
 * @param {Object} course - Course object
 * @param {Object} instructor - Instructor object
 */
export const sendNewCourseNotificationEmail = async (students, course, instructor) => {
  if (!students || students.length === 0) return;

  const courseUrl = `${CLIENT_URL}/courses/${course._id}`;
  const emails = students.map(s => s.email);

  const mailOptions = {
    bcc: emails, // Use BCC to protect student privacy
    subject: `New Course: ${course.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A5F; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .course-card { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #2E86C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆕 New Course Available!</h1>
          </div>
          <div class="content">
            <h2>Just Published</h2>

            <div class="course-card">
              <h3>${course.title}</h3>
              <p><strong>Instructor:</strong> ${instructor.name}</p>
              <p><strong>Category:</strong> ${course.category}</p>
              <p><strong>Level:</strong> ${course.level}</p>
              <p><strong>Price:</strong> $${course.price}</p>
              <p>${course.shortDescription || course.description.substring(0, 150)}...</p>
            </div>

            <a href="${courseUrl}" class="button">View Course</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 ${emailFrom.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Course: ${course.title}

      Instructor: ${instructor.name}
      Category: ${course.category}
      Level: ${course.level}
      Price: $${course.price}

      View course: ${courseUrl}
    `,
  };

  return sendEmail(mailOptions);
};

// Initialize email service verification on module load
verifyEmailConfig();
