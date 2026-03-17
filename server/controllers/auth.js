const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

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
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
         const err = new Error('No user found with this email');
         err.statusCode = 401;
         throw err;
      }
      const matched = await bcrypt.compare(password, user.password);
      if (!matched) {
         const err = new Error('Incorrect password');
         err.statusCode = 401;
         throw err;
      }
      const token = jwt.sign(
         { email: user.email, userId: user._id.toString() },
         process.env.JWT_SECRET,
         { expiresIn: '1h' }
      );
      res.status(200).json({ token, name: user.name, userId: user._id.toString() });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

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
         user.avatar = req.file.path.replace(/\\/g, '/');
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
         const err = new Error('Current password is incorrect');
         err.statusCode = 401;
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
