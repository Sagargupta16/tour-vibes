const Post = require('../models/post');

exports.toggleLike = async (req, res, next) => {
   try {
      const post = await Post.findById(req.params.postId).select('likes');
      if (!post) {
         const error = new Error('No post found');
         error.statusCode = 404;
         throw error;
      }
      const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);
      // Atomic update: push() + save() on a stale copy let two quick clicks both add the
      // user, so one person could count twice. $addToSet cannot duplicate.
      const update = alreadyLiked
         ? { $pull: { likes: req.userId } }
         : { $addToSet: { likes: req.userId } };
      const updated = await Post.findByIdAndUpdate(req.params.postId, update, {
         new: true,
         projection: 'likes'
      });
      if (!updated) {
         const error = new Error('No post found');
         error.statusCode = 404;
         throw error;
      }
      res.status(200).json({
         message: alreadyLiked ? 'Post unliked' : 'Post liked',
         liked: !alreadyLiked,
         likesCount: updated.likes.length
      });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};
