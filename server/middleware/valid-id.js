const mongoose = require('mongoose');

// router.param handler: a malformed :postId, :commentId or :userId is a 400 here,
// instead of a Mongoose CastError surfacing as a 500 from findById.
function validId(req, res, next, value, name) {
   if (!mongoose.Types.ObjectId.isValid(value)) {
      const error = new Error(`Invalid ${name}`);
      error.statusCode = 400;
      return next(error);
   }
   next();
}

module.exports = validId;
