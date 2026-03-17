const { validationResult } = require('express-validator');

const Comment = require('../models/comment');
const Post = require('../models/post');

exports.getComments = async (req, res, next) => {
   try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
         const error = new Error('Post not found');
         error.statusCode = 404;
         throw error;
      }
      const comments = await Comment.find({ post: req.params.postId })
         .populate('author', 'name avatar')
         .sort({ createdAt: -1 });
      res.status(200).json({ comments });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.createComment = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         const error = new Error('Validation failed');
         error.statusCode = 422;
         error.data = errors.array();
         throw error;
      }
      const post = await Post.findById(req.params.postId);
      if (!post) {
         const error = new Error('Post not found');
         error.statusCode = 404;
         throw error;
      }
      const comment = new Comment({
         text: req.body.text,
         post: req.params.postId,
         author: req.userId
      });
      await comment.save();
      const populated = await comment.populate('author', 'name avatar');
      res.status(201).json({ message: 'Comment added', comment: populated });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.deleteComment = async (req, res, next) => {
   try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
         const error = new Error('Comment not found');
         error.statusCode = 404;
         throw error;
      }
      if (comment.author.toString() !== req.userId) {
         const error = new Error('Not authorized to delete this comment');
         error.statusCode = 403;
         throw error;
      }
      await Comment.findByIdAndDelete(req.params.commentId);
      res.status(200).json({ message: 'Comment deleted' });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};
