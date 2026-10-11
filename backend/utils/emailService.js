const crypto = require('crypto');

/**
 * Generate verification token
 */
exports.generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send verification email
 * @param {string} email - User email
 * @param {string} token - Verification token
 * @param {string} userName - User name or email
 * 
 * NOTE: This is a simulated email service for development.
 * In production, integrate with actual email service (SendGrid, AWS SES, etc.)
 */
exports.sendVerificationEmail = async (email, token, userName = 'User') => {
  try {
    // Get base URL from environment or use default
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    // In development, we'll just log the verification link
    console.log('\n📧 EMAIL VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your InternHub account`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nHi ${userName},\n`);
    console.log('Welcome to InternHub! Please verify your email address by clicking the link below:\n');
    console.log(`🔗 Verification Link: ${verificationUrl}\n`);
    console.log('This link will expire in 24 hours.\n');
    console.log('If you did not create an account, please ignore this email.\n');
    console.log('Best regards,');
    console.log('InternHub Team');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // TODO: In production, replace with actual email service
    // Example with nodemailer:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@internhub.com',
      to: email,
      subject: 'Verify your InternHub account',
      html: `
        <h2>Welcome to InternHub!</h2>
        <p>Hi ${userName},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #7C3AED; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <br>
        <p>Best regards,<br>InternHub Team</p>
      `
    });
    */

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, token, userName = 'User') => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    console.log('\n📧 PASSWORD RESET EMAIL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your InternHub password`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nHi ${userName},\n`);
    console.log('You requested to reset your password. Click the link below:\n');
    console.log(`🔗 Reset Link: ${resetUrl}\n`);
    console.log('This link will expire in 1 hour.\n');
    console.log('If you did not request this, please ignore this email.\n');
    console.log('Best regards,');
    console.log('InternHub Team');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};
