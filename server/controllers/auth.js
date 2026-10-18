const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const { normalizePath, clearImage } = require('../util/helpers');

exports.signup = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         const err = new Error('Validation failed');
         err.statusCode = 422;
         err.data = errors.array();
         throw err;
      }
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
         name,
         email,
         password: hashedPassword
      });
      await user.save();
      res.status(201).json({
         message: 'User successfully registered',
         userId: user._id.toString()
      });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.login = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         const err = new Error('Validation failed');
         err.statusCode = 422;
         err.data = errors.array();
         throw err;
      }
      // Coerce to primitive string to block NoSQL operator injection
      const email = String(req.body.email).toLowerCase();
      const password = String(req.body.password);
      const user = await User.findOne({ email });
      // One message for both cases so the endpoint does not reveal which emails exist
      const matched = user ? await bcrypt.compare(password, user.password) : false;
      if (!matched) {
         const err = new Error('Invalid email or password');
         err.statusCode = 401;
         throw err;
      }
      sendSession(res, user);
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

// One-click demo login: signs in as the DEMO_EMAIL account (a demo user from
// `npm run seed`) without a password, so no demo password ships in the client
// bundle or the repo. Off unless DEMO_EMAIL is set.
exports.demoLogin = async (req, res, next) => {
   try {
      const email = process.env.DEMO_EMAIL?.toLowerCase();
      const user = email ? await User.findOne({ email }) : null;
      if (!user) {
         const err = new Error('Demo login is not available');
         err.statusCode = 404;
         throw err;
      }
      sendSession(res, user);
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

function sendSession(res, user) {
   const userId = user._id.toString();
   const token = jwt.sign({ email: user.email, userId }, process.env.JWT_SECRET, {
      expiresIn: '1h'
   });
   res.status(200).json({ token, name: user.name, userId });
}

exports.getProfile = async (req, res, next) => {
   try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
         const err = new Error('User not found');
         err.statusCode = 404;
         throw err;
      }
      res.status(200).json({ user });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.updateProfile = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         const err = new Error('Validation failed');
         err.statusCode = 422;
         err.data = errors.array();
         throw err;
      }
      const user = await User.findById(req.userId);
      if (!user) {
         const err = new Error('User not found');
         err.statusCode = 404;
         throw err;
      }
      const { name, bio, location, status } = req.body;
      if (name !== undefined) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (location !== undefined) user.location = location;
      if (status !== undefined) user.status = status;
      if (req.file) {
         clearImage(user.avatar);
         user.avatar = normalizePath(req.file.path);
      }
      await user.save();
      const { password, ...profile } = user.toObject();
      res.status(200).json({ message: 'Profile updated', user: profile });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.changePassword = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         const err = new Error('Validation failed');
         err.statusCode = 422;
         err.data = errors.array();
         throw err;
      }
      const user = await User.findById(req.userId);
      if (!user) {
         const err = new Error('User not found');
         err.statusCode = 404;
         throw err;
      }
      const { currentPassword, newPassword } = req.body;
      const matched = await bcrypt.compare(currentPassword, user.password);
      if (!matched) {
         // 422, not 401: the session is valid, and the client treats 401 as expired
         const err = new Error('Current password is incorrect');
         err.statusCode = 422;
         throw err;
      }
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();
      res.status(200).json({ message: 'Password changed successfully' });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.getPublicProfile = async (req, res, next) => {
   try {
      const user = await User.findById(req.params.userId).select(
         'name bio avatar location status createdAt'
      );
      if (!user) {
         const err = new Error('User not found');
         err.statusCode = 404;
         throw err;
      }
      res.status(200).json({ user });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};
