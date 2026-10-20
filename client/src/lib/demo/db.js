// The demo database: seeded from the server's seed/data.json the way
// `npm run seed` does it (same users, posts, likes and comments), kept as one
// JSON document in localStorage under the tv-demo: prefix.
import { httpError, iso, omit, pick, seedId } from './util';

export const PREFIX = 'tv-demo:';
const VERSION_KEY = `${PREFIX}version`;
const DB_KEY = `${PREFIX}db`;
// Bump when the stored shape changes; an older copy is then reseeded
export const SCHEMA_VERSION = '1';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const doc = (fields, createdAt) => ({ ...fields, createdAt, updatedAt: createdAt, __v: 0 });

export function seedDb(data, now, secret) {
   const users = data.users.map((u, i) =>
      doc(
         {
            _id: seedId(1, i),
            email: `${u.key}@${data.emailDomain}`,
            name: u.name,
            // No password: like the seed script's random one, nobody can type it.
            // The one-click demo login (POST /auth/demo) needs none.
            password: '',
            bio: u.bio,
            avatar: '',
            location: '',
            status: 'I am new',
            posts: []
         },
         iso(now)
      )
   );
   const idOf = Object.fromEntries(data.users.map((u, i) => [u.key, users[i]._id]));

   // createdAt spread over the weeks before now, like the seed's daysAgo(i * 3 + 1)
   const posts = data.posts.map((row, i) =>
      doc(
         {
            _id: seedId(2, i),
            title: row.title,
            imageUrl: `demo/photos/picsum-${row.photo}.jpg`,
            content: row.content,
            creator: idOf[row.author],
            tags: row.tags,
            location: { name: row.place, country: row.country, lat: row.lat, lng: row.lng },
            travelDate: iso(Date.parse(row.travelDate)),
            likes: []
         },
         iso(now - (i * 3 + 1) * DAY)
      )
   );
   for (const user of users) {
      user.posts = posts.filter((p) => p.creator === user._id).map((p) => p._id);
   }
   for (const { post, by } of data.likes) posts[post].likes = by.map((key) => idOf[key]);

   // An hour or more after the journal they answer, so each thread reads in order
   const comments = data.comments.map(({ author, post, text }, i) =>
      doc(
         { _id: seedId(3, i), text, post: posts[post]._id, author: idOf[author] },
         iso(Math.min(now, Date.parse(posts[post].createdAt) + (i + 1) * HOUR))
      )
   );

   return { secret, demoUserId: idOf.demo ?? null, users, posts, comments };
}

export function createStore(storage) {
   return {
      load() {
         if (storage.getItem(VERSION_KEY) !== SCHEMA_VERSION) return null;
         try {
            return JSON.parse(storage.getItem(DB_KEY));
         } catch {
            return null;
         }
      },
      save(db) {
         try {
            storage.setItem(DB_KEY, JSON.stringify(db));
            storage.setItem(VERSION_KEY, SCHEMA_VERSION);
         } catch {
            throw httpError(
               507,
               'This browser is out of storage for the demo. Reset the demo data.'
            );
         }
      }
   };
}

export const findById = (list, id) => list.find((item) => item._id === id);

// populate('creator', 'name avatar') and populate('author', 'name avatar')
export const userRef = (db, id) => {
   const user = findById(db.users, id);
   return user ? pick(user, ['_id', 'name', 'avatar']) : null;
};

export const withCreator = (db, post) => ({ ...post, creator: userRef(db, post.creator) });

// select('-password'); the salt is the demo's own field
export const ownProfile = (user) => omit(user, ['password', 'salt']);
