const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const feedControllers = require('../controllers/feed');
const likeControllers = require('../controllers/like');
const mapControllers = require('../controllers/map');
const commentControllers = require('../controllers/comment');
const isAuth = require('../middleware/is-auth');
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
   body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
   body('content').trim().isLength({ min: 5 }).withMessage('Content must be at least 5 characters'),
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
router.get('/posts', isAuth, feedControllers.getPosts);
router.get('/posts/:userId', isAuth, feedControllers.getUserPosts);
router.post('/posts', isAuth, upload, postValidation, feedControllers.createPost);
router.get('/post/:postId', isAuth, feedControllers.getPost);
router.put('/post/:postId', isAuth, upload, postValidation, feedControllers.updatePost);
router.delete('/post/:postId', isAuth, feedControllers.deletePost);

// Search & tags
router.get('/search', isAuth, feedControllers.searchPosts);
router.get('/tags', isAuth, feedControllers.getTags);

// Map
router.get('/map', isAuth, mapControllers.getMapPosts);

// Likes
router.put('/post/:postId/like', isAuth, likeControllers.toggleLike);

// Comments
router.get('/post/:postId/comments', isAuth, commentControllers.getComments);
router.post('/post/:postId/comments', isAuth, commentValidation, commentControllers.createComment);
router.delete('/comment/:commentId', isAuth, commentControllers.deleteComment);

module.exports = router;
