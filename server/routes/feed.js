const express = require('express');
const { body } = require('express-validator');

const feedControllers = require('../controllers/feed');
const commentControllers = require('../controllers/comment');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const postValidation = [
   body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
   body('content').trim().isLength({ min: 5 }).withMessage('Content must be at least 5 characters')
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
router.post('/posts', isAuth, postValidation, feedControllers.createPost);
router.get('/post/:postId', isAuth, feedControllers.getPost);
router.put('/post/:postId', isAuth, postValidation, feedControllers.updatePost);
router.delete('/post/:postId', isAuth, feedControllers.deletePost);

// Search & tags
router.get('/search', isAuth, feedControllers.searchPosts);
router.get('/tags', isAuth, feedControllers.getTags);

// Likes
router.put('/post/:postId/like', isAuth, feedControllers.toggleLike);

// Comments
router.get('/post/:postId/comments', isAuth, commentControllers.getComments);
router.post('/post/:postId/comments', isAuth, commentValidation, commentControllers.createComment);
router.delete('/comment/:commentId', isAuth, commentControllers.deleteComment);

module.exports = router;
