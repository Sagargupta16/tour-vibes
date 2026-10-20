// Read-only feed routes: the paginated lists, search, tags (server/controllers/
// feed.js) and the map's bounding-box query (server/controllers/map.js).
import { withCreator } from './db';
import { httpError, newest, paginate } from './util';

const MAP_LIMIT = 500;

const listed = (db, posts, query, message = 'Fetched successfully') => ({
   status: 200,
   body: {
      message,
      posts: paginate(posts, query.get('page')).map((post) => withCreator(db, post)),
      totalItems: posts.length
   }
});

export function getPosts({ db, query }) {
   const tag = query.get('tag');
   let posts = tag ? db.posts.filter((p) => p.tags.includes(tag.toLowerCase())) : [...db.posts];
   if (query.get('sort') === 'popular') {
      // The server's aggregation adds likesCount and sorts on it, newest first on a tie
      posts = posts
         .map((post) => ({ ...post, likesCount: post.likes.length }))
         .sort((a, b) => b.likesCount - a.likesCount || newest(a, b));
   } else {
      posts.sort(query.get('sort') === 'oldest' ? (a, b) => newest(b, a) : newest);
   }
   return listed(db, posts, query);
}

export function getUserPosts({ db, params, query }) {
   const posts = db.posts.filter((p) => p.creator === params.userId).sort(newest);
   return listed(db, posts, query);
}

// Stands in for the $text index on title, content and tags: case-insensitive,
// any word of the query matches, more matching words rank higher
export function searchPosts({ db, query }) {
   const q = (query.get('q') ?? '').trim().slice(0, 200);
   if (!q) {
      return { status: 200, body: { message: 'No query provided', posts: [], totalItems: 0 } };
   }
   const words = q.toLowerCase().split(/\s+/);
   const score = (post) => {
      const fields = [post.title, post.content, post.tags.join(' ')].map((f) => f.toLowerCase());
      return words.reduce((sum, word) => sum + fields.filter((f) => f.includes(word)).length, 0);
   };
   const posts = db.posts
      .map((post) => ({ post, score: score(post) }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score || newest(a.post, b.post))
      .map((hit) => hit.post);
   return listed(db, posts, query, 'Search results');
}

export function getTags({ db }) {
   const tags = [...new Set(db.posts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
   return { status: 200, body: { tags } };
}

// Leaflet bounds can run past +-180 when the map wraps; fold a longitude back
// into [-180, 180)
const wrapLng = (lng) => ((((lng + 180) % 360) + 360) % 360) - 180;

// bbox=west,south,east,north (Leaflet's toBBoxString order), as a predicate on
// the pin; anything but 4 numbers is a 400
export function bboxTest(raw) {
   // Number('') is 0, so a blank part (",,,") must be rejected before it becomes a coordinate
   const parts = String(raw)
      .split(',')
      .map((part) => (part.trim() === '' ? Number.NaN : Number(part)));
   if (parts.length !== 4 || !parts.every(Number.isFinite) || parts[1] > parts[3]) {
      throw httpError(400, 'bbox must be west,south,east,north');
   }
   const [west, south, east, north] = parts;
   const inLat = (lat) => lat >= Math.max(south, -90) && lat <= Math.min(north, 90);
   // A view 360 degrees wide or more shows every longitude
   if (east - west >= 360) return ({ lat }) => inLat(lat);
   const w = wrapLng(west);
   const e = wrapLng(east);
   // w > e: the view crosses the antimeridian, one range each side of it
   const inLng = w <= e ? (lng) => lng >= w && lng <= e : (lng) => lng >= w || lng <= e;
   return ({ lat, lng }) => inLat(lat) && inLng(lng);
}

export function getMapPosts({ db, query }) {
   const bbox = query.get('bbox');
   const inView = bbox ? bboxTest(bbox) : () => true;
   const posts = db.posts
      .filter((p) => typeof p.location?.lat === 'number' && typeof p.location?.lng === 'number')
      .filter((p) => inView(p.location))
      .sort(newest)
      .slice(0, MAP_LIMIT)
      .map(({ _id, title, imageUrl, location, createdAt }) => ({
         _id,
         title,
         imageUrl,
         location,
         createdAt
      }));
   return { status: 200, body: { posts, truncated: posts.length === MAP_LIMIT } };
}
