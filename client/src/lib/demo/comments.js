// Comment routes, mirroring server/controllers/comment.js
import { findById, userRef } from './db';
import { httpError, iso, newest, objectId, text, validator } from './util';

const withAuthor = (db, comment) => ({ ...comment, author: userRef(db, comment.author) });

const findPost = (db, postId) => {
   const post = findById(db.posts, postId);
   if (!post) throw httpError(404, 'Post not found');
   return post;
};

export function getComments({ db, params }) {
   const post = findPost(db, params.postId);
   const comments = db.comments
      .filter((c) => c.post === post._id)
      .sort(newest)
      .map((c) => withAuthor(db, c));
   return { status: 200, body: { comments } };
}

export function createComment({ db, body, params, userId, now }) {
   body.text = text(body.text).trim();
   const v = validator(body);
   v.check(
      'text',
      body.text.length >= 1 && body.text.length <= 500,
      'Comment must be 1-500 characters'
   );
   v.done();
   const post = findPost(db, params.postId);
   const at = iso(now);
   const comment = {
      _id: objectId(now),
      text: body.text,
      post: post._id,
      author: userId,
      createdAt: at,
      updatedAt: at,
      __v: 0
   };
   db.comments.push(comment);
   return { status: 201, body: { message: 'Comment added', comment: withAuthor(db, comment) } };
}

export function deleteComment({ db, params, userId }) {
   const comment = findById(db.comments, params.commentId);
   if (!comment) throw httpError(404, 'Comment not found');
   if (comment.author !== userId) throw httpError(403, 'Not authorized to delete this comment');
   db.comments = db.comments.filter((c) => c._id !== comment._id);
   return { status: 200, body: { message: 'Comment deleted' } };
}
