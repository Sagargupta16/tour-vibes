const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/users');
const {
   PER_PAGE,
   parsePage,
   normalizePath,
   clearImage,
   getSortOption
} = require('../util/helpers');

exports.getPosts = async (req, res, next) => {
   try {
      const page = parsePage(req.query.page);
      const sort = getSortOption(req.query.sort);
      const filter = {};
      if (req.query.tag) {
         filter.tags = req.query.tag.toLowerCase();
      }
      const totalItems = await Post.countDocuments(filter);
      const posts = await Post.find(filter)
         .populate('creator', 'name avatar')
         .sort(sort)
         .skip((page - 1) * PER_PAGE)
         .limit(PER_PAGE);
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
      const query = req.query.q;
      if (!query || !query.trim()) {
         return res.status(200).json({ message: 'No query provided', posts: [], totalItems: 0 });
      }
      const filter = { $text: { $search: query } };
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
      if (req.body.tags) postData.tags = JSON.parse(req.body.tags);
      if (req.body.locationName || req.body.locationCountry) {
         postData.location = {
            name: req.body.locationName || '',
            country: req.body.locationCountry || ''
         };
      }
      if (req.body.travelDate) postData.travelDate = new Date(req.body.travelDate);
      const post = new Post(postData);
      await post.save();
      await User.findByIdAndUpdate(req.userId, { $push: { posts: post._id } });
      const populated = await post.populate('creator', 'name avatar');
      res.status(201).json({ message: 'Post successfully created', post: populated });
   } catch (err) {
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
      let imageUrl = req.body.image;
      if (req.file) imageUrl = normalizePath(req.file.path);
      if (!imageUrl) {
         const error = new Error('No image provided');
         error.statusCode = 422;
         throw error;
      }
      if (imageUrl !== post.imageUrl) clearImage(post.imageUrl);
      post.title = req.body.title;
      post.content = req.body.content;
      post.imageUrl = imageUrl;
      if (req.body.tags) post.tags = JSON.parse(req.body.tags);
      if (req.body.locationName !== undefined || req.body.locationCountry !== undefined) {
         post.location = {
            name: req.body.locationName || post.location.name,
            country: req.body.locationCountry || post.location.country
         };
      }
      if (req.body.travelDate) post.travelDate = new Date(req.body.travelDate);
      const result = await post.save();
      const populated = await result.populate('creator', 'name avatar');
      res.status(200).json({ message: 'Post updated successfully', post: populated });
   } catch (err) {
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
      clearImage(post.imageUrl);
      await Post.findByIdAndDelete(req.params.postId);
      await User.findByIdAndUpdate(req.userId, { $pull: { posts: post._id } });
      res.status(200).json({ message: 'Post deleted successfully' });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.toggleLike = async (req, res, next) => {
   try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
         const error = new Error('No post found');
         error.statusCode = 404;
         throw error;
      }
      const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);
      if (alreadyLiked) {
         post.likes.pull(req.userId);
      } else {
         post.likes.push(req.userId);
      }
      await post.save();
      res.status(200).json({
         message: alreadyLiked ? 'Post unliked' : 'Post liked',
         liked: !alreadyLiked,
         likesCount: post.likes.length
      });
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
