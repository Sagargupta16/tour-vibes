// Regression tests for the security fixes in v0.7.0 and v0.8.0. Each one is a
// scenario that was reproduced by hand against an earlier main.
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

test('anonymous multipart requests never write to disk', async () => {
   const before = listImages().size;
   const create = await request(app).post('/feed/posts').attach('image', PNG, 'a.png');
   const unknown = await request(app).post('/random').attach('image', PNG, 'a.png');
   const profile = await request(app).put('/auth/profile').attach('image', PNG, 'a.png');
   assert.equal(create.status, 401);
   assert.equal(unknown.status, 404);
   assert.equal(profile.status, 401);
   assert.equal(listImages().size, before);
});

test("a user cannot point a post at another user's image and delete it", async () => {
   const alice = await createUser('Alice');
   const bob = await createUser('Bob');
   const alicePost = (await createPost(alice)).body.post;
   const bobPost = (await createPost(bob)).body.post;

   const hijack = await request(app)
      .put(`/feed/post/${bobPost._id}`)
      .set(auth(bob))
      .field('title', 'Edited title')
      .field('content', 'Edited content')
      .field('image', alicePost.imageUrl);
   assert.equal(hijack.status, 200);
   assert.equal(hijack.body.post.imageUrl, bobPost.imageUrl);

   const removed = await request(app).delete(`/feed/post/${bobPost._id}`).set(auth(bob));
   assert.equal(removed.status, 200);
   assert.ok(imageExists(alicePost.imageUrl), "Alice's image must survive");
});

test("a user cannot edit or delete someone else's post or comment", async () => {
   const alice = await createUser('Alice');
   const bob = await createUser('Bob');
   const post = (await createPost(alice)).body.post;
   const comment = (
      await request(app)
         .post(`/feed/post/${post._id}/comments`)
         .set(auth(alice))
         .send({ text: 'Mine' })
   ).body.comment;

   const edit = await request(app)
      .put(`/feed/post/${post._id}`)
      .set(auth(bob))
      .field('title', 'Not yours')
      .field('content', 'Not yours');
   const del = await request(app).delete(`/feed/post/${post._id}`).set(auth(bob));
   const delComment = await request(app).delete(`/feed/comment/${comment._id}`).set(auth(bob));
   assert.equal(edit.status, 403);
   assert.equal(del.status, 403);
   assert.equal(delComment.status, 403);
});

test('login gives one message for unknown email and wrong password', async () => {
   const alice = await createUser('Alice');
   const unknown = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever1' });
   const wrong = await request(app)
      .post('/auth/login')
      .send({ email: alice.email, password: 'wrong-password' });
   assert.equal(unknown.status, 401);
   assert.equal(wrong.status, 401);
   assert.equal(unknown.body.message, 'Invalid email or password');
   assert.equal(wrong.body.message, unknown.body.message);
});

test('login rejects a NoSQL operator in place of the email', async () => {
   await createUser('Alice');
   const res = await request(app)
      .post('/auth/login')
      .send({ email: { $ne: null }, password: 'password123' });
   assert.equal(res.status, 422);
   assert.equal(res.body.token, undefined);
});

test('a wrong current password is a 422 and keeps the session valid', async () => {
   const alice = await createUser('Alice');
   const res = await request(app)
      .put('/auth/password')
      .set(auth(alice))
      .send({ currentPassword: 'not-the-password', newPassword: 'new-password-1' });
   assert.equal(res.status, 422);
   const profile = await request(app).get('/auth/profile').set(auth(alice));
   assert.equal(profile.status, 200);
});

test('an upload over 5MB is a 413, a non-image upload is ignored', async () => {
   const alice = await createUser('Alice');
   const big = await createPost(
      alice,
      {},
      { data: Buffer.alloc(5 * 1024 * 1024 + 1), name: 'big.png' }
   );
   assert.equal(big.status, 413);

   const gif = await createPost(alice, {}, { data: Buffer.from('GIF89a'), name: 'anim.gif' });
   assert.equal(gif.status, 422);
   assert.equal(gif.body.message, 'No image provided');
});

test('a malformed id is a 400, not a 500', async () => {
   const alice = await createUser('Alice');
   const paths = [
      ['get', '/feed/post/not-an-id'],
      ['put', '/feed/post/not-an-id/like'],
      ['get', '/feed/post/not-an-id/comments'],
      ['delete', '/feed/comment/not-an-id'],
      ['get', '/feed/posts/not-an-id'],
      ['get', '/auth/user/not-an-id']
   ];
   for (const [method, path] of paths) {
      const res = await request(app)[method](path).set(auth(alice));
      assert.equal(res.status, 400, `${method.toUpperCase()} ${path}`);
   }
});

test('every API route is rate limited', async () => {
   const alice = await createUser('Alice');
   const profile = await request(app).get('/auth/profile').set(auth(alice));
   const feed = await request(app).get('/feed/posts').set(auth(alice));
   const login = await request(app).post('/auth/login').send({});
   assert.equal(profile.headers['x-ratelimit-limit'], '300');
   assert.equal(feed.headers['x-ratelimit-limit'], '300');
   assert.equal(login.headers['x-ratelimit-limit'], '20');
});

test('a tampered or missing token is a 401 on a write route', async () => {
   const missing = await request(app).put('/auth/password').send({});
   const tampered = await request(app)
      .put('/auth/password')
      .set('Authorization', 'Bearer abc.def.ghi')
      .send({});
   assert.equal(missing.status, 401);
   assert.equal(tampered.status, 401);
});
