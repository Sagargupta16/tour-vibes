const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const feedControllers = require('../controllers/feed');
const likeControllers = require('../controllers/like');
const mapControllers = require('../controllers/map');
const commentControllers = require('../controllers/comment');
const isAuth = require('../middleware/is-auth');
const optionalAuth = require('../middleware/optional-auth');
const upload = require('../middleware/upload');
const validId = require('../middleware/valid-id');

const router = express.Router();

const apiLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 300,
   message: { message: 'Too many requests, please try again later' }
});

router.use(apiLimiter);
router.param('postId', validId);
router.param('commentId', validId);
router.param('userId', validId);

const postValidation = [
   body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be 5-200 characters'),
   body('content')
      .trim()
      .isLength({ min: 5, max: 20000 })
      .withMessage('Content must be 5-20000 characters'),
   body(['locationName', 'locationCountry'])
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location must be at most 100 characters'),
   body('travelDate')
      .optional({ values: 'falsy' })
      .custom((value) => !Number.isNaN(new Date(value).getTime()))
      .withMessage('Travel date must be a valid date'),
   body('lat')
      .optional({ values: 'falsy' })
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
   body('lng')
      .optional({ values: 'falsy' })
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
];

const commentValidation = [
   body('text')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Comment must be 1-500 characters')
];

// Posts
router.get('/posts', optionalAuth, feedControllers.getPosts);
router.get('/posts/:userId', optionalAuth, feedControllers.getUserPosts);
router.post('/posts', isAuth, upload, postValidation, feedControllers.createPost);
router.get('/post/:postId', optionalAuth, feedControllers.getPost);
router.put('/post/:postId', isAuth, upload, postValidation, feedControllers.updatePost);
router.delete('/post/:postId', isAuth, feedControllers.deletePost);

// Search & tags
router.get('/search', optionalAuth, feedControllers.searchPosts);
router.get('/tags', optionalAuth, feedControllers.getTags);

// Map
router.get('/map', optionalAuth, mapControllers.getMapPosts);

// Likes
router.put('/post/:postId/like', isAuth, likeControllers.toggleLike);

// Comments
router.get('/post/:postId/comments', optionalAuth, commentControllers.getComments);
router.post('/post/:postId/comments', isAuth, commentValidation, commentControllers.createComment);
router.delete('/comment/:commentId', isAuth, commentControllers.deleteComment);

module.exports = router;
