const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validation');

router.post('/register',
  [body('username').trim().isLength({ min: 3, max: 30 }), body('email').isEmail(), body('password').isLength({ min: 6 })],
  handleValidation,
  authController.register
);
router.post('/login',
  [body('email').isEmail(), body('password').exists()],
  handleValidation,
  authController.login
);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  authController.googleCallback
);
router.post('/forgot-password', [body('email').isEmail()], handleValidation, authController.forgotPassword);
router.post('/reset-password',
  [body('token').exists(), body('password').isLength({ min: 6 })],
  handleValidation,
  authController.resetPassword
);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

// TEMPORARY ADMIN ROUTE
router.get('/make-me-admin', authController.makeMeAdmin);

module.exports = router;
