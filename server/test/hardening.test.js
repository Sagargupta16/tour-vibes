// Regression tests for the server bug sweep: input that used to be a 500, uploads that
// leaked, and writes that raced. Each one failed against the code before the fix.
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
   app,
   request,
   createUser,
   auth,
   createPost,
   imageExists,
   listImages,
   PNG
} = require('./setup');
const { clearImage } = require('../util/helpers');
const Post = require('../models/post');

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

// PUT through the real route; title and content are required on every edit
const editPost = (user, post, fields = {}, file) => {
   const req = request(app).put(`/feed/post/${post._id}`).set(auth(user));
   const all = { title: post.title, content: post.content, ...fields };
   for (const [key, value] of Object.entries(all)) req.field(key, value);
   return file ? req.attach('image', PNG, 'new.png') : req;
};

test('signup rejects a duplicate email that differs only in case', async () => {
   const alice = await createUser('Alice');
   const res = await request(app)
      .put('/auth/signup')
      .send({ name: 'Again', email: alice.email.toUpperCase(), password: 'password123' });
   assert.equal(res.status, 422);
   assert.equal(res.body.message, 'Validation failed');
});

test('a repeated, operator-shaped or oversized query value never breaks the feed', async () => {
   const alice = await createUser('Alice');
   await createPost(alice, { title: 'Quiet morning', tags: '["coffee"]' });
   await createPost(alice, { title: 'Loved sunset', tags: '["beach"]' });
   const queries = [
      '?tag=a&tag=b',
      '?tag[$ne]=coffee',
      '?sort[$gt]=1',
      '?sort=popular&sort=oldest',
      '?page=0',
      '?page=-3',
      '?page=abc',
      '?page=99999999999999999999999',
      '?page=1&page=2',
      '?sort=popular&page=99999999999999999999999'
   ];
   for (const query of queries) {
      const res = await request(app).get(`/feed/posts${query}`);
      assert.equal(res.status, 200, query);
   }
   const injected = await request(app).get('/feed/posts?tag[$ne]=coffee');
   assert.notDeepEqual(
      injected.body.posts.map((p) => p.title),
      ['Loved sunset'],
      '$ne must not be applied as a Mongo operator'
   );
   for (const q of ['q[$regex]=.*', 'q=a&q=b', `q=${'word '.repeat(2000)}`]) {
      const res = await request(app).get(`/feed/search?${q}`);
      assert.equal(res.status, 200, q.slice(0, 20));
   }
   const user = await request(app).get(`/feed/posts/${alice.id}?page=0`);
   assert.equal(user.status, 200);
});

test('a failed create removes the upload it just wrote', async () => {
   const alice = await createUser('Alice');
   const before = listImages().size;
   const short = await createPost(alice, { title: 'Hi' });
   const badTags = await createPost(alice, { tags: 'not json' });
   const badDate = await createPost(alice, { travelDate: 'next tuesday-ish' });
   const oneCoord = await createPost(alice, { lat: '10' });
   assert.deepEqual(
      [short.status, badTags.status, badDate.status, oneCoord.status],
      [422, 422, 422, 422]
   );
   await settle();
   assert.equal(listImages().size, before);
});

test('a failed edit removes the new upload and keeps the old image', async () => {
   const alice = await createUser('Alice');
   const bob = await createUser('Bob');
   const { post } = (await createPost(alice)).body;
   const before = listImages().size;

   const badTags = await editPost(alice, post, { tags: 'not json' }, true);
   const badDate = await editPost(alice, post, { travelDate: 'garbage' }, true);
   const notOwner = await editPost(bob, post, {}, true);
   assert.deepEqual([badTags.status, badDate.status, notOwner.status], [422, 422, 403]);
   await settle();
   assert.equal(listImages().size, before);
   assert.ok(imageExists(post.imageUrl), 'the post must keep its image');

   const ok = await editPost(alice, post, {}, true);
   assert.equal(ok.status, 200);
   await settle();
   assert.equal(imageExists(post.imageUrl), false);
   assert.ok(imageExists(ok.body.post.imageUrl));
});

test('a failed profile update removes the avatar upload', async () => {
   const alice = await createUser('Alice');
   const before = listImages().size;
   const res = await request(app)
      .put('/auth/profile')
      .set(auth(alice))
      .field('name', 'x'.repeat(81))
      .attach('image', PNG, 'me.png');
   assert.equal(res.status, 422);
   await settle();
   assert.equal(listImages().size, before);
});

test('an unexpected upload field is a 400, not a 500', async () => {
   const alice = await createUser('Alice');
   const res = await request(app)
      .post('/feed/posts')
      .set(auth(alice))
      .field('title', 'A day in Lisbon')
      .field('content', 'Trams and tiles')
      .attach('photo', PNG, 'photo.png');
   assert.equal(res.status, 400);
});

test('clearImage only deletes inside the images folder', async () => {
   const sibling = path.join(__dirname, '..', 'images-sibling-test');
   fs.mkdirSync(sibling, { recursive: true });
   const file = path.join(sibling, 'keep.txt');
   fs.writeFileSync(file, 'keep');
   try {
      clearImage('images-sibling-test/keep.txt');
      clearImage('images/../images-sibling-test/keep.txt');
      await settle();
      assert.ok(fs.existsSync(file));
   } finally {
      fs.rmSync(sibling, { recursive: true, force: true });
   }
});

test('two quick likes from one user count once', async () => {
   const alice = await createUser('Alice');
   const { post } = (await createPost(alice)).body;
   const like = () => request(app).put(`/feed/post/${post._id}/like`).set(auth(alice));
   await Promise.all([like(), like(), like()]);
   const stored = await Post.findById(post._id);
   assert.ok(stored.likes.length <= 1, `likes: ${stored.likes.length}`);
});

test('a bbox with blank parts is a 400', async () => {
   for (const bbox of [',,,', '1,2,3,', ' , , , ']) {
      const res = await request(app).get('/feed/map').query({ bbox });
      assert.equal(res.status, 400, bbox);
   }
});

test('tags must be a short list of strings', async () => {
   const alice = await createUser('Alice');
   const bad = [
      '[1, 2]',
      '[{"a": 1}]',
      '{"a": 1}',
      JSON.stringify(Array.from({ length: 21 }, (_, i) => `t${i}`)),
      JSON.stringify(['x'.repeat(41)])
   ];
   for (const tags of bad) {
      const res = await createPost(alice, { tags });
      assert.equal(res.status, 422, tags.slice(0, 20));
   }
});

test('an edit can clear the location and the travel date', async () => {
   const alice = await createUser('Alice');
   const { post } = (
      await createPost(alice, {
         locationName: 'Lisbon',
         locationCountry: 'Portugal',
         travelDate: '2026-05-01'
      })
   ).body;
   const kept = await editPost(alice, post, { title: 'A new title' });
   assert.equal(kept.body.post.location.name, 'Lisbon');
   assert.ok(kept.body.post.travelDate);

   const cleared = await editPost(alice, post, {
      locationName: '',
      locationCountry: '',
      travelDate: ''
   });
   assert.equal(cleared.status, 200);
   assert.equal(cleared.body.post.location.name, '');
   assert.equal(cleared.body.post.location.country, '');
   assert.equal(cleared.body.post.travelDate, undefined);
});

test('a body-parser error still carries the CORS headers', async () => {
   const res = await request(app)
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Content-Type', 'application/json')
      .send('{bad json');
   assert.equal(res.status, 400);
   assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:3000');
});

test('profile fields that are not text or are too long are a 422', async () => {
   const alice = await createUser('Alice');
   const put = (body) => request(app).put('/auth/profile').set(auth(alice)).send(body);
   assert.equal((await put({ bio: { a: 1 } })).status, 422);
   assert.equal((await put({ bio: ['a'] })).status, 422);
   assert.equal((await put({ status: 'x'.repeat(101) })).status, 422);
   assert.equal((await put({ location: 'x'.repeat(101) })).status, 422);
   assert.equal((await put({ bio: 'Hello', status: 'On the road' })).status, 200);
});

test('the current password is trimmed like it is at signup and login', async () => {
   const signup = await request(app)
      .put('/auth/signup')
      .send({ name: 'Erin', email: 'erin@example.com', password: 'spacepass1 ' });
   assert.equal(signup.status, 201);
   const login = await request(app)
      .post('/auth/login')
      .send({ email: 'erin@example.com', password: 'spacepass1' });
   const change = await request(app)
      .put('/auth/password')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ currentPassword: 'spacepass1 ', newPassword: 'another-pass-1' });
   assert.equal(change.status, 200);
});
