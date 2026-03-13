const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../config/email');

// POST /api/auth/register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Username or email already in use' });
  }
  const user = await User.create({ username, email, password });
  try { await sendWelcomeEmail(email, username); } catch (_) {}
  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  user.isOnline = true;
  await user.save();
  const token = generateToken(user._id);
  res.json({ success: true, token, user });
};

// GET /api/auth/google/callback (handled via passport, called after)
exports.googleCallback = async (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();
  try {
    await sendPasswordResetEmail(email, resetToken, user.username);
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(500).json({ success: false, message: 'Failed to send email. Try again.' });
  }
  res.json({ success: true, message: 'Password reset email sent.' });
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  const newToken = generateToken(user._id);
  res.json({ success: true, token: newToken, message: 'Password reset successfully' });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();
  }
  res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/make-me-admin
// TEMPORARY ENDPOINT TO FIX ROLE NO-SHELL
exports.makeMeAdmin = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).send('Please provide an email query parameter, e.g. ?email=your@email.com');
    
    const user = await User.findOneAndUpdate({ email: email }, { role: 'admin' }, { new: true });
    
    if (!user) return res.status(404).send('User not found in the database. Have you logged in with Google at least once yet?');
    
    res.send(`Successfully updated ${user.email} to ADMIN role! 🥳 You can now log out of the frontend and log back in to see your privileges.`);
  } catch (error) {
    res.status(500).send('Error updating user: ' + error.message);
  }
};

