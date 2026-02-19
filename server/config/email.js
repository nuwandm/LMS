import nodemailer from 'nodemailer';

/**
 * Create Nodemailer transporter for SendGrid
 */
export const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'apikey', // This is literally the string 'apikey'
    pass: process.env.SENDGRID_API_KEY,
  },
});

/**
 * Verify transporter configuration
 */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready (SendGrid)');
    return true;
  } catch (error) {
    console.warn('⚠️  Email service not configured:', error.message);
    console.warn('   Emails will be logged to console instead');
    return false;
  }
};

/**
 * Email sender info
 */
export const emailFrom = {
  email: process.env.EMAIL_FROM || 'noreply@learnhub.com',
  name: process.env.EMAIL_FROM_NAME || 'LearnHub',
};

export default transporter;
