const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const authControllers = require('../controllers/auth');
const User = require('../models/users');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 20,
   message: { message: 'Too many attempts, please try again after 15 minutes' }
});

const signupValidation = [
   body('email')
      .isEmail()
      .withMessage('Enter a valid email')
      .custom(async (value) => {
         // Coerce to primitive string to block NoSQL operator injection
         // (e.g. { $ne: null }); .isEmail() failing does not stop this custom
         // validator from running with the raw object value.
         const user = await User.findOne({ email: String(value) });
         if (user) {
            throw new Error('Email already registered');
         }
      })
      .normalizeEmail({ gmail_remove_dots: false }),
   body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
   body('name').trim().not().isEmpty().withMessage('Name is required')
];

const loginValidation = [
   body('email')
      .isEmail()
      .withMessage('Enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
   body('password').trim().notEmpty().withMessage('Password is required')
];

const profileValidation = [
   body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
   body('bio').optional().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
   body('location').optional().trim(),
   body('status').optional().trim()
];

const passwordValidation = [
   body('currentPassword').notEmpty().withMessage('Current password is required'),
   body('newPassword')
      .trim()
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
];

router.put('/signup', authLimiter, signupValidation, authControllers.signup);
router.post('/login', authLimiter, loginValidation, authControllers.login);
router.get('/profile', isAuth, authControllers.getProfile);
router.put('/profile', isAuth, profileValidation, authControllers.updateProfile);
router.put('/password', isAuth, passwordValidation, authControllers.changePassword);
router.get('/user/:userId', isAuth, authControllers.getPublicProfile);

module.exports = router;
