const Post = require('../models/post');

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
