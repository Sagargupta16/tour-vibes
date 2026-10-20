// Reads are public, writes need a session. A request that carries a bad token is
// still a 401, so a client with a stale session finds out and logs out.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { app, request, createUser, auth, createPost } = require('./setup');

const seed = async () => {
   const alice = await createUser('Alice');
   const { post } = (await createPost(alice, { lat: '38.72', lng: '-9.14' })).body;
   const { comment } = (
      await request(app)
         .post(`/feed/post/${post._id}/comments`)
         .set(auth(alice))
         .send({ text: 'Great trip' })
   ).body;
   return { alice, post, comment };
};

const publicReads = ({ alice, post }) => [
   '/feed/posts',
   `/feed/posts/${alice.id}`,
   `/feed/post/${post._id}`,
   '/feed/search?q=lisbon',
   '/feed/tags',
   '/feed/map',
   `/feed/post/${post._id}/comments`,
   `/auth/user/${alice.id}`
];

test('every public read answers an anonymous visitor with a 200', async () => {
   const data = await seed();
   for (const path of publicReads(data)) {
      const res = await request(app).get(path);
      assert.equal(res.status, 200, path);
   }
   const feed = await request(app).get('/feed/posts');
   assert.equal(feed.body.totalItems, 1);
   assert.equal(feed.body.posts[0].creator.name, 'Alice');
   const comments = await request(app).get(`/feed/post/${data.post._id}/comments`);
   assert.equal(comments.body.comments[0].author.name, 'Alice');
});

test('a signed-in visitor still reads the public routes', async () => {
   const data = await seed();
   for (const path of publicReads(data)) {
      const res = await request(app).get(path).set(auth(data.alice));
      assert.equal(res.status, 200, path);
   }
});

test('anonymous writes are a 401', async () => {
   const { post, comment } = await seed();
   const writes = [
      ['post', '/feed/posts'],
      ['put', `/feed/post/${post._id}`],
      ['delete', `/feed/post/${post._id}`],
      ['put', `/feed/post/${post._id}/like`],
      ['post', `/feed/post/${post._id}/comments`],
      ['delete', `/feed/comment/${comment._id}`],
      ['get', '/auth/profile'],
      ['put', '/auth/profile'],
      ['put', '/auth/password']
   ];
   for (const [method, path] of writes) {
      const res = await request(app)[method](path).send({});
      assert.equal(res.status, 401, `${method.toUpperCase()} ${path}`);
   }
});

test('a garbage, wrong-scheme or expired token on a public read is a 401', async () => {
   const data = await seed();
   const expired = jwt.sign({ userId: data.alice.id }, 'test-secret', { expiresIn: -10 });
   const headers = [`Bearer ${expired}`, 'Bearer abc.def.ghi', `Token ${data.alice.token}`];
   for (const path of publicReads(data)) {
      for (const header of headers) {
         const res = await request(app).get(path).set('Authorization', header);
         assert.equal(res.status, 401, `${path} with ${header.slice(0, 16)}`);
      }
   }
});

test('a public read is still rate limited', async () => {
   const { alice } = await seed();
   const feed = await request(app).get('/feed/posts');
   const profile = await request(app).get(`/auth/user/${alice.id}`);
   assert.equal(feed.headers['x-ratelimit-limit'], '300');
   assert.equal(profile.headers['x-ratelimit-limit'], '300');
});

test('the public profile shows public fields only', async () => {
   const { alice } = await seed();
   const res = await request(app).get(`/auth/user/${alice.id}`);
   assert.deepEqual(Object.keys(res.body.user).sort(), [
      '_id',
      'avatar',
      'bio',
      'createdAt',
      'location',
      'name',
      'status'
   ]);
   assert.ok(!JSON.stringify(res.body).includes(alice.email));
});
