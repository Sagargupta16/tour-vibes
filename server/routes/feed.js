const express = require('express');
const validator = require('express-validator');

const feedControllers = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const validation = [
    validator.body('title').trim().isLength({min: 5}),
    validator.body('content').trim().isLength({min: 5})
];
router.get('/posts/:userId', isAuth, feedControllers.getUserPosts);
router.get('/posts', isAuth, feedControllers.getPosts);

router.post('/posts', isAuth, validation, feedControllers.createPost);

router.get('/post/:postId', isAuth, feedControllers.getPost);

router.put('/post/:postId', isAuth, validation, feedControllers.udpatePost);

router.delete('/post/:postId', isAuth, feedControllers.deletePost);

module.exports = router;