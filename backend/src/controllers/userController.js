const User = require('../models/User');
const Message = require('../models/Message');
const CourseFile = require('../models/CourseFile');
const Channel = require('../models/Channel');
const path = require('path');
const fs = require('fs');

// GET /api/users — all users (admin or for searching)
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  const { username, bio } = req.body;
  const updates = { bio };
  if (username && username !== req.user.username) {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ success: false, message: 'Username already taken' });
    updates.username = username;
  }
  if (req.file) {
    updates.avatar = `/uploads/avatars/${req.file.filename}`;
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json({ success: true, user });
};

// DELETE /api/users/:id (admin only)
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted successfully' });
};

// GET /api/users/me/notifications
exports.getNotifications = async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
  res.json({ success: true, notifications });
};

// PUT /api/users/notifications/read
exports.markNotificationsRead = async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $set: { 'notifications.$[].read': true } }
  );
  res.json({ success: true });
};

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  const [totalUsers, totalFiles, totalMessages, totalChannels, recentUsers] = await Promise.all([
    User.countDocuments(),
    CourseFile.countDocuments(),
    Message.countDocuments({ isDeleted: false }),
    Channel.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('username avatar createdAt role'),
  ]);
  res.json({ success: true, analytics: { totalUsers, totalFiles, totalMessages, totalChannels, recentUsers } });
};
