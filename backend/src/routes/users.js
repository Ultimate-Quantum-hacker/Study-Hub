const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const userController = require('../controllers/userController');

router.get('/', authenticate, userController.getAllUsers);
router.get('/me/notifications', authenticate, userController.getNotifications);
router.put('/notifications/read', authenticate, userController.markNotificationsRead);
router.get('/:id', authenticate, userController.getUserById);
router.put('/profile', authenticate, (req, res, next) => {
  req.uploadSubDir = 'avatars';
  next();
}, upload.single('avatar'), userController.updateProfile);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

// Admin routes
router.get('/admin/analytics', authenticate, authorize('admin'), userController.getAnalytics);

module.exports = router;
