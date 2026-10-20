// The demo API: the routes in server/routes/*.js answered in the browser. Each
// request runs in the server's order: id params (400), auth (401), upload (413),
// then the handler, which validates (422) and checks ownership (403). Storage,
// photos, seed data and the clock are injected, so node can drive it too.
import * as auth from './auth';
import * as comments from './comments';
import * as feed from './feed';
import * as posts from './posts';
import { seedDb } from './db';
import { verifyToken } from './session';
import { UPLOAD_PREFIX, httpError, isObjectId, randomHex } from './util';

// No auth at all; a token is optional (a bad one is still a 401); a token is required
const OPEN = 'open';
const PUBLIC = 'public';
const PRIVATE = 'private';

// multer.single('image'): only PNG and JPEG are kept, over 5MB is a 413
const IMAGE_TYPES = new Set(['image/png', 'image/jpg', 'image/jpeg']);
const MAX_UPLOAD = 5 * 1024 * 1024;

const ROUTES = [
   ['PUT', '/auth/signup', auth.signup, OPEN],
   ['POST', '/auth/login', auth.login, OPEN],
   ['POST', '/auth/demo', auth.demoLogin, OPEN],
   ['GET', '/auth/profile', auth.getProfile, PRIVATE],
   ['PUT', '/auth/profile', auth.updateProfile, PRIVATE, true],
   ['PUT', '/auth/password', auth.changePassword, PRIVATE],
   ['GET', '/auth/user/:userId', auth.getPublicProfile, PUBLIC],
   ['GET', '/feed/posts', feed.getPosts, PUBLIC],
   ['GET', '/feed/posts/:userId', feed.getUserPosts, PUBLIC],
   ['POST', '/feed/posts', posts.createPost, PRIVATE, true],
   ['GET', '/feed/post/:postId', posts.getPost, PUBLIC],
   ['PUT', '/feed/post/:postId', posts.updatePost, PRIVATE, true],
   ['DELETE', '/feed/post/:postId', posts.deletePost, PRIVATE],
   ['GET', '/feed/search', feed.searchPosts, PUBLIC],
   ['GET', '/feed/tags', feed.getTags, PUBLIC],
   ['GET', '/feed/map', feed.getMapPosts, PUBLIC],
   ['PUT', '/feed/post/:postId/like', posts.toggleLike, PRIVATE],
   ['GET', '/feed/post/:postId/comments', comments.getComments, PUBLIC],
   ['POST', '/feed/post/:postId/comments', comments.createComment, PRIVATE],
   ['DELETE', '/feed/comment/:commentId', comments.deleteComment, PRIVATE]
].map(([method, path, handler, access, upload = false]) => {
   const names = [...path.matchAll(/:(\w+)/g)].map((m) => m[1]);
   const pattern = new RegExp(`^${path.replaceAll(/:\w+/g, '([^/]+)')}$`);
   return { method, pattern, names, handler, access, upload };
});

const findRoute = (method, pathname) => {
   for (const route of ROUTES) {
      const match = route.method === method && route.pattern.exec(pathname);
      if (match) {
         const params = Object.fromEntries(
            route.names.map((name, i) => [name, decodeURIComponent(match[i + 1])])
         );
         return { route, params };
      }
   }
   throw httpError(404, `Cannot ${method} ${pathname}`);
};

const headerOf = (headers, name) =>
   Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === name)?.[1];

// The server's is-auth and optional-auth middleware
const authenticate = async (header, access, secret, now) => {
   if (access === OPEN) return null;
   if (!header) {
      if (access === PRIVATE) throw httpError(401, 'Not Authenticated');
      return null;
   }
   const parts = header.split(' ');
   if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw httpError(401, 'Invalid Authorization header format');
   }
   return verifyToken(parts[1], secret, now);
};

// FormData, the JSON string api.js sends, or a plain object (node tests)
const readBody = (raw) => {
   if (raw == null) return { fields: {}, files: {} };
   if (typeof raw === 'string') {
      try {
         return { fields: JSON.parse(raw) ?? {}, files: {} };
      } catch {
         throw httpError(400, 'Request body is not valid JSON');
      }
   }
   const entries = raw instanceof FormData ? [...raw] : Object.entries(raw);
   const fields = {};
   const files = {};
   for (const [key, value] of entries) {
      if (value instanceof Blob) files[key] = value;
      else fields[key] = value;
   }
   return { fields, files };
};

const pickUpload = (files, upload) => {
   const names = Object.keys(files);
   if (!upload || names.length === 0) return null;
   // Any file field but `image` is a MulterError, which the server answers with a 400
   if (names.some((name) => name !== 'image')) throw httpError(400, 'Unexpected field');
   const file = files.image;
   if (!IMAGE_TYPES.has(file.type)) return null;
   if (file.size > MAX_UPLOAD) throw httpError(413, 'File too large');
   return file;
};

export function createRouter({ store, images, loadSeed, now = Date.now }) {
   let tail = Promise.resolve();

   const loadDb = async () => {
      const saved = store.load();
      if (saved) return saved;
      await images.clear();
      const db = seedDb(await loadSeed(), now(), randomHex(16));
      store.save(db);
      return db;
   };

   const run = async ({ method = 'GET', path, headers, body }) => {
      const url = new URL(path, 'http://demo.local');
      const verb = method.toUpperCase();
      const { route, params } = findRoute(verb, url.pathname);
      for (const [name, value] of Object.entries(params)) {
         if (!isObjectId(value)) throw httpError(400, `Invalid ${name}`);
      }
      const db = await loadDb();
      const at = now();
      const userId = await authenticate(
         headerOf(headers, 'authorization'),
         route.access,
         db.secret,
         at
      );
      const { fields, files } = readBody(body);
      const file = pickUpload(files, route.upload);
      const ctx = {
         db,
         params,
         query: url.searchParams,
         body: fields,
         file,
         userId,
         now: at,
         images
      };
      const result = await route.handler(ctx);
      // A failed request throws before this, so it never writes half a change
      if (verb !== 'GET') store.save(db);
      return result;
   };

   // Stored photos leave as a URL the page can show
   const resolveImages = (value) =>
      JSON.parse(JSON.stringify(value), (key, v) =>
         typeof v === 'string' && v.startsWith(UPLOAD_PREFIX) ? images.url(v) : v
      );

   const handle = async (request) => {
      // One request at a time, so two writes never interleave and drop each other
      const previous = tail;
      let release;
      tail = new Promise((resolve) => {
         release = resolve;
      });
      await previous;
      try {
         const { status, body } = await run(request);
         return { status, data: resolveImages(body) };
      } catch (err) {
         // Like the server's error handler: unexpected errors get a generic message
         if (!err.statusCode) console.error(err);
         const message = err.statusCode ? err.message : 'Something went wrong';
         return { status: err.statusCode || 500, data: resolveImages({ message, data: err.data }) };
      } finally {
         release();
      }
   };

   return { handle };
}
