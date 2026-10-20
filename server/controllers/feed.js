const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/users');
const Comment = require('../models/comment');
const {
   PER_PAGE,
   parsePage,
   normalizePath,
   clearImage,
   discardUpload,
   getSortOption,
   parseTags,
   parseCoordinates,
   applyPostEdits
} = require('../util/helpers');

exports.getPosts = async (req, res, next) => {
   try {
      const page = parsePage(req.query.page);
      const filter = {};
      if (req.query.tag) {
         filter.tags = String(req.query.tag).toLowerCase();
      }
      const totalItems = await Post.countDocuments(filter);
      let posts;
      if (req.query.sort === 'popular') {
         // likesCount is not a stored field, so a plain .sort() on it is a no-op.
         // Compute it from the likes array via aggregation to sort by popularity.
         posts = await Post.aggregate([
            { $match: filter },
            { $addFields: { likesCount: { $size: '$likes' } } },
            { $sort: { likesCount: -1, createdAt: -1 } },
            { $skip: (page - 1) * PER_PAGE },
            { $limit: PER_PAGE }
         ]);
         posts = await Post.populate(posts, { path: 'creator', select: 'name avatar' });
      } else {
         posts = await Post.find(filter)
            .populate('creator', 'name avatar')
            .sort(getSortOption(req.query.sort))
            .skip((page - 1) * PER_PAGE)
            .limit(PER_PAGE);
      }
      res.status(200).json({ message: 'Fetched successfully', posts, totalItems });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.getUserPosts = async (req, res, next) => {
   try {
      const page = parsePage(req.query.page);
      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
         const error = new Error('Invalid user ID');
         error.statusCode = 400;
         throw error;
      }
      const userId = new mongoose.Types.ObjectId(req.params.userId);
      const totalItems = await Post.countDocuments({ creator: userId });
      const posts = await Post.find({ creator: userId })
         .populate('creator', 'name avatar')
         .sort({ createdAt: -1 })
         .skip((page - 1) * PER_PAGE)
         .limit(PER_PAGE);
      res.status(200).json({ message: 'Fetched successfully', posts, totalItems });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.searchPosts = async (req, res, next) => {
   try {
      const page = parsePage(req.query.page);
      // Force primitive string; blocks NoSQL operator injection (e.g. { $regex: '.*' })
      // Use explicit String() -- ternary guard is not enough for Sonar taint analysis.
      const q = String(req.query.q == null ? '' : req.query.q)
         .trim()
         .slice(0, 200);
      if (!q) {
         return res.status(200).json({ message: 'No query provided', posts: [], totalItems: 0 });
      }
      const filter = { $text: { $search: q } };
      const totalItems = await Post.countDocuments(filter);
      const posts = await Post.find(filter, { score: { $meta: 'textScore' } })
         .populate('creator', 'name avatar')
         .sort({ score: { $meta: 'textScore' } })
         .skip((page - 1) * PER_PAGE)
         .limit(PER_PAGE);
      res.status(200).json({ message: 'Search results', posts, totalItems });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.createPost = async (req, res, next) => {
   let saved = false;
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         const error = new Error('Validation failed');
         error.statusCode = 422;
         error.data = errors.array();
         throw error;
      }
      if (!req.file) {
         const error = new Error('No image provided');
         error.statusCode = 422;
         throw error;
      }
      const imageUrl = normalizePath(req.file.path);
      const postData = {
         title: req.body.title,
         content: req.body.content,
         imageUrl,
         creator: req.userId
      };
      if (req.body.tags) postData.tags = parseTags(req.body.tags);
      const coords = parseCoordinates(req.body);
      if (req.body.locationName || req.body.locationCountry || coords) {
         postData.location = {
            name: req.body.locationName || '',
            country: req.body.locationCountry || '',
            ...coords
         };
      }
      if (req.body.travelDate) postData.travelDate = new Date(req.body.travelDate);
      const post = new Post(postData);
      await post.save();
      saved = true;
      await User.findByIdAndUpdate(req.userId, { $push: { posts: post._id } });
      const populated = await post.populate('creator', 'name avatar');
      res.status(201).json({ message: 'Post successfully created', post: populated });
   } catch (err) {
      if (!saved) discardUpload(req);
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.getPost = async (req, res, next) => {
   try {
      const post = await Post.findById(req.params.postId).populate('creator', 'name avatar');
      if (!post) {
         const error = new Error('No post found');
         error.statusCode = 404;
         throw error;
      }
      res.status(200).json({ message: 'Fetched successfully', post });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.updatePost = async (req, res, next) => {
   let saved = false;
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
         const error = new Error('No post found');
         error.statusCode = 404;
         throw error;
      }
      if (post.creator.toString() !== req.userId) {
         const error = new Error('Not authorized to edit this post');
         error.statusCode = 403;
         throw error;
      }
      // Never take the image path from the request body: a client could point its
      // post at another user's file, then delete the post and with it that file.
      const imageUrl = req.file ? normalizePath(req.file.path) : post.imageUrl;
      const oldImageUrl = post.imageUrl;
      post.imageUrl = imageUrl;
      applyPostEdits(post, req.body);
      const result = await post.save();
      saved = true;
      // Only now is the old file unreferenced; clearing it before the save broke the post
      // whenever the save failed
      if (imageUrl !== oldImageUrl) clearImage(oldImageUrl);
      const populated = await result.populate('creator', 'name avatar');
      res.status(200).json({ message: 'Post updated successfully', post: populated });
   } catch (err) {
      if (!saved) discardUpload(req);
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.deletePost = async (req, res, next) => {
   try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
         const error = new Error('No such post exists');
         error.statusCode = 404;
         throw error;
      }
      if (post.creator.toString() !== req.userId) {
         const error = new Error('Not authorized to delete this post');
         error.statusCode = 403;
         throw error;
      }
      await Post.findByIdAndDelete(req.params.postId);
      clearImage(post.imageUrl);
      await Comment.deleteMany({ post: post._id });
      await User.findByIdAndUpdate(req.userId, { $pull: { posts: post._id } });
      res.status(200).json({ message: 'Post deleted successfully' });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.getTags = async (req, res, next) => {
   try {
      const tags = await Post.distinct('tags');
      res.status(200).json({ tags });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};
