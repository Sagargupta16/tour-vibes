// Loads the demo journals from seed/data.json into the database in MONGODB_URI:
// demo users, pinned posts with photos, likes and comments. Safe to re-run: it
// only removes users on the demo email domain, their posts and comments, and
// the seed-* images.
//
//   npm run seed                      (demo users get a random password)
//   SEED_PASSWORD=... npm run seed    (choose it, to sign in through the login form)
//
// The one-click demo login (POST /auth/demo, enabled by DEMO_EMAIL on the API)
// needs no password, so none is committed or printed.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const User = require('../models/users');
const Post = require('../models/post');
const Comment = require('../models/comment');
const data = require('../seed/data.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tour-vibes';
const PHOTOS = path.join(__dirname, '..', 'seed', 'photos');
const IMAGES = path.join(__dirname, '..', 'images');

const emailFor = (key) => `${key}@${data.emailDomain}`;

const removeDemoData = async () => {
   const emails = data.users.map((u) => emailFor(u.key));
   const old = await User.find({ email: { $in: emails } }).select('_id');
   const ids = old.map((u) => u._id);
   const oldPosts = await Post.find({ creator: { $in: ids } }).select('_id');
   await Comment.deleteMany({
      $or: [{ author: { $in: ids } }, { post: { $in: oldPosts.map((p) => p._id) } }]
   });
   // Likes left by demo users on other people's posts
   await Post.updateMany({}, { $pull: { likes: { $in: ids } } });
   await Post.deleteMany({ creator: { $in: ids } });
   await User.deleteMany({ _id: { $in: ids } });
   for (const file of fs.readdirSync(IMAGES)) {
      if (file.startsWith('seed-')) fs.rmSync(path.join(IMAGES, file));
   }
   return old.length;
};

// Spread createdAt over the weeks before now so the feed has a believable order
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const seed = async () => {
   await mongoose.connect(MONGODB_URI);
   await Post.syncIndexes();
   fs.mkdirSync(IMAGES, { recursive: true });
   const removed = await removeDemoData();

   const password = process.env.SEED_PASSWORD || crypto.randomBytes(18).toString('base64url');
   const hash = await bcrypt.hash(password, 12);
   const userDocs = await User.insertMany(
      data.users.map((u) => ({ name: u.name, email: emailFor(u.key), password: hash, bio: u.bio }))
   );
   const users = Object.fromEntries(data.users.map((u, i) => [u.key, userDocs[i]]));

   const created = await Post.insertMany(
      data.posts.map((row) => {
         const { author, photo, title, place, country, lat, lng, travelDate, tags, content } = row;
         const file = `seed-${photo}.jpg`;
         fs.copyFileSync(path.join(PHOTOS, `picsum-${photo}.jpg`), path.join(IMAGES, file));
         return {
            title,
            content,
            imageUrl: `images/${file}`,
            creator: users[author]._id,
            tags,
            location: { name: place, country, lat, lng },
            travelDate: new Date(travelDate)
         };
      })
   );
   // The raw collection write keeps the timestamps plugin from resetting them
   await Post.collection.bulkWrite(
      created.map((post, i) => {
         const at = daysAgo(i * 3 + 1);
         return {
            updateOne: {
               filter: { _id: post._id },
               update: { $set: { createdAt: at, updatedAt: at } }
            }
         };
      })
   );
   await User.bulkWrite(
      userDocs.map((user) => ({
         updateOne: {
            filter: { _id: user._id },
            update: {
               $set: { posts: created.filter((p) => p.creator.equals(user._id)).map((p) => p._id) }
            }
         }
      }))
   );

   await Post.bulkWrite(
      data.likes.map(({ post, by }) => ({
         updateOne: {
            filter: { _id: created[post]._id },
            update: { $set: { likes: by.map((key) => users[key]._id) } }
         }
      }))
   );
   await Comment.insertMany(
      data.comments.map(({ author, post, text }) => ({
         text,
         post: created[post]._id,
         author: users[author]._id
      }))
   );

   console.log(`Removed ${removed} old demo users`);
   console.log(
      `Seeded ${data.users.length} users, ${created.length} posts, ${data.comments.length} comments`
   );
   console.log(`Demo account: ${emailFor('demo')} (set DEMO_EMAIL to it for the demo login)`);
};

seed()
   .catch((err) => {
      console.error('Seed failed:', err);
      process.exitCode = 1;
   })
   .finally(() => mongoose.disconnect());
