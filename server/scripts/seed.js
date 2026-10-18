// Loads the demo journals from seed/data.json into the database in MONGODB_URI:
// demo users, pinned posts with photos, likes and comments. Safe to re-run: it
// only removes users on the demo email domain, their posts and comments, and
// the seed-* images.
//
//   npm run seed                      (password: tourvibes-demo)
//   SEED_PASSWORD=... npm run seed    (choose the demo password)
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
const PASSWORD = process.env.SEED_PASSWORD || 'tourvibes-demo';
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

   const hash = await bcrypt.hash(PASSWORD, 12);
   const users = {};
   for (const u of data.users) {
      users[u.key] = await User.create({
         name: u.name,
         email: emailFor(u.key),
         password: hash,
         bio: u.bio
      });
   }

   const created = [];
   for (const [i, row] of data.posts.entries()) {
      const { author, photo, title, place, country, lat, lng, travelDate, tags, content } = row;
      const file = `seed-${photo}.jpg`;
      fs.copyFileSync(path.join(PHOTOS, `picsum-${photo}.jpg`), path.join(IMAGES, file));
      const post = await Post.create({
         title,
         content,
         imageUrl: `images/${file}`,
         creator: users[author]._id,
         tags,
         location: { name: place, country, lat, lng },
         travelDate: new Date(travelDate)
      });
      const at = daysAgo(i * 3 + 1);
      await Post.collection.updateOne(
         { _id: post._id },
         { $set: { createdAt: at, updatedAt: at } }
      );
      await User.updateOne({ _id: users[author]._id }, { $push: { posts: post._id } });
      created.push(post);
   }

   for (const { post, by } of data.likes) {
      await Post.updateOne(
         { _id: created[post]._id },
         { $set: { likes: by.map((key) => users[key]._id) } }
      );
   }
   for (const { author, post, text } of data.comments) {
      await Comment.create({ text, post: created[post]._id, author: users[author]._id });
   }

   console.log(`Removed ${removed} old demo users`);
   console.log(
      `Seeded ${data.users.length} users, ${created.length} posts, ${data.comments.length} comments`
   );
   const shown = process.env.SEED_PASSWORD ? 'the SEED_PASSWORD value' : PASSWORD;
   console.log(`Demo login: ${emailFor('demo')} / ${shown}`);
};

seed()
   .catch((err) => {
      console.error('Seed failed:', err);
      process.exitCode = 1;
   })
   .finally(() => mongoose.disconnect());
