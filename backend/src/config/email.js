const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (email, resetToken, username) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: `"Study Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Study Hub',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#ffffff;padding:30px;border-radius:12px">
        <h1 style="color:#6c63ff;text-align:center">📚 Study Hub</h1>
        <h2>Hi ${username},</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${resetUrl}" style="background:#6c63ff;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold">Reset Password</a>
        </div>
        <p style="color:#aaa;font-size:12px">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
        <p style="color:#aaa;font-size:12px">© 2025 Study Hub. All rights reserved.</p>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (email, username) => {
  await transporter.sendMail({
    from: `"Study Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Study Hub! 🎓',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#ffffff;padding:30px;border-radius:12px">
        <h1 style="color:#6c63ff;text-align:center">📚 Study Hub</h1>
        <h2>Welcome, ${username}!</h2>
        <p>You've successfully joined Study Hub. Start collaborating, sharing notes, and studying smarter with AI-powered tools.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${process.env.FRONTEND_URL}" style="background:#6c63ff;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold">Go to Study Hub</a>
        </div>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
