// Single-journal routes: create, read, edit, delete and like, mirroring
// server/controllers/feed.js and like.js with the validation in routes/feed.js.
import { findById, withCreator } from './db';
import { httpError, isFloatIn, iso, objectId, text, validator } from './util';

const IMAGE_SIZE = 1600;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 40;

const lengthIn = (value, min, max) => value.length >= min && value.length <= max;
const isDate = (value) => !Number.isNaN(new Date(value).getTime());
const toDate = (value) => new Date(value).toISOString();

// postValidation in server/routes/feed.js, checks in the same order
const validatePost = (body) => {
   body.title = text(body.title).trim();
   body.content = text(body.content).trim();
   const v = validator(body);
   v.check('title', lengthIn(body.title, 5, 200), 'Title must be 5-200 characters');
   v.check('content', lengthIn(body.content, 5, 20000), 'Content must be 5-20000 characters');
   for (const key of ['locationName', 'locationCountry']) {
      if (body[key] === undefined) continue;
      body[key] = text(body[key]).trim();
      v.check(key, body[key].length <= 100, 'Location must be at most 100 characters');
   }
   // optional({ values: 'falsy' }): an empty date, lat or lng skips its check
   if (body.travelDate) {
      v.check('travelDate', isDate(body.travelDate), 'Travel date must be a valid date');
   }
   if (body.lat) {
      v.check('lat', isFloatIn(body.lat, -90, 90), 'Latitude must be between -90 and 90');
   }
   if (body.lng) {
      v.check('lng', isFloatIn(body.lng, -180, 180), 'Longitude must be between -180 and 180');
   }
   v.done();
};

// Tags arrive as a JSON array string in a multipart field; the schema trims
// and lowercases each one
const parseTags = (raw) => {
   let parsed;
   try {
      parsed = JSON.parse(raw);
   } catch {
      throw httpError(422, 'Tags must be a valid JSON array');
   }
   const valid =
      Array.isArray(parsed) &&
      parsed.length <= MAX_TAGS &&
      parsed.every((tag) => typeof tag === 'string' && tag.length <= MAX_TAG_LENGTH);
   if (!valid) {
      throw httpError(
         422,
         `Tags must be a JSON array of up to ${MAX_TAGS} strings of ${MAX_TAG_LENGTH} characters`
      );
   }
   return parsed.map((tag) => tag.trim().toLowerCase());
};

// undefined: no pin sent; null: both empty (pin removed); one without the other is a 422
const parseCoordinates = ({ lat, lng }) => {
   if (lat === undefined && lng === undefined) return undefined;
   if (!lat && !lng) return null;
   if (!lat || !lng) throw httpError(422, 'Latitude and longitude must be sent together');
   return { lat: Number(lat), lng: Number(lng) };
};

const ownPost = (db, postId, userId, action) => {
   const post = findById(db.posts, postId);
   if (!post) throw httpError(404, action === 'edit' ? 'No post found' : 'No such post exists');
   if (post.creator !== userId) throw httpError(403, `Not authorized to ${action} this post`);
   return post;
};

export async function createPost({ db, body, file, userId, now, images }) {
   validatePost(body);
   if (!file) throw httpError(422, 'No image provided');
   const at = iso(now);
   const post = {
      _id: objectId(now),
      title: body.title,
      imageUrl: '',
      content: body.content,
      creator: userId,
      tags: body.tags ? parseTags(body.tags) : [],
      location: { name: '', country: '' },
      likes: [],
      createdAt: at,
      updatedAt: at,
      __v: 0
   };
   const coords = parseCoordinates(body);
   if (body.locationName || body.locationCountry || coords) {
      post.location = {
         name: text(body.locationName),
         country: text(body.locationCountry),
         ...coords
      };
   }
   if (body.travelDate) post.travelDate = toDate(body.travelDate);
   // Stored last, so a request that fails a check above leaves no orphan photo
   post.imageUrl = await images.save(file, IMAGE_SIZE);
   db.posts.push(post);
   findById(db.users, userId)?.posts.push(post._id);
   return {
      status: 201,
      body: { message: 'Post successfully created', post: withCreator(db, post) }
   };
}

export function getPost({ db, params }) {
   const post = findById(db.posts, params.postId);
   if (!post) throw httpError(404, 'No post found');
   return { status: 200, body: { message: 'Fetched successfully', post: withCreator(db, post) } };
}

export async function updatePost({ db, body, file, params, userId, now, images }) {
   validatePost(body);
   const post = ownPost(db, params.postId, userId, 'edit');
   post.title = body.title;
   post.content = body.content;
   if (body.tags) post.tags = parseTags(body.tags);
   // An empty field clears the value; a field that was not sent keeps it
   if (body.locationName !== undefined) post.location.name = body.locationName;
   if (body.locationCountry !== undefined) post.location.country = body.locationCountry;
   const coords = parseCoordinates(body);
   if (coords) Object.assign(post.location, coords);
   if (coords === null) {
      delete post.location.lat;
      delete post.location.lng;
   }
   if (body.travelDate !== undefined) {
      if (body.travelDate) post.travelDate = toDate(body.travelDate);
      else delete post.travelDate;
   }
   // Only an uploaded file replaces the photo; an `image` text field (the edit
   // form sends the old URL back) is ignored, as on the server
   if (file) {
      const imageUrl = await images.save(file, IMAGE_SIZE);
      await images.remove(post.imageUrl);
      post.imageUrl = imageUrl;
   }
   post.updatedAt = iso(now);
   return {
      status: 200,
      body: { message: 'Post updated successfully', post: withCreator(db, post) }
   };
}

export async function deletePost({ db, params, userId, images }) {
   const post = ownPost(db, params.postId, userId, 'delete');
   await images.remove(post.imageUrl);
   db.posts = db.posts.filter((p) => p._id !== post._id);
   db.comments = db.comments.filter((c) => c.post !== post._id);
   const user = findById(db.users, userId);
   if (user) user.posts = user.posts.filter((id) => id !== post._id);
   return { status: 200, body: { message: 'Post deleted successfully' } };
}

export function toggleLike({ db, params, userId, now }) {
   const post = findById(db.posts, params.postId);
   if (!post) throw httpError(404, 'No post found');
   const alreadyLiked = post.likes.includes(userId);
   post.likes = alreadyLiked ? post.likes.filter((id) => id !== userId) : [...post.likes, userId];
   post.updatedAt = iso(now);
   return {
      status: 200,
      body: {
         message: alreadyLiked ? 'Post unliked' : 'Post liked',
         liked: !alreadyLiked,
         likesCount: post.likes.length
      }
   };
}
