const { test } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, createUser, auth, createPost, imageExists } = require('./setup');

test('creating a post stores tags, location and the map pin', async () => {
   const alice = await createUser('Alice');
   const res = await createPost(alice, {
      tags: JSON.stringify(['beach', 'Food']),
      locationName: 'Lisbon',
      locationCountry: 'Portugal',
      lat: '38.7223',
      lng: '-9.1393',
      travelDate: '2026-05-01'
   });
   assert.equal(res.status, 201);
   const { post } = res.body;
   assert.deepEqual(post.tags, ['beach', 'food']);
   assert.equal(post.location.name, 'Lisbon');
   assert.equal(post.location.lat, 38.7223);
   assert.equal(post.location.lng, -9.1393);
   assert.equal(post.creator.name, 'Alice');
   assert.ok(imageExists(post.imageUrl));
});

test('a post without an image or with a short title is a 422', async () => {
   const alice = await createUser('Alice');
   const noImage = await request(app)
      .post('/feed/posts')
      .set(auth(alice))
      .field('title', 'No image here')
      .field('content', 'Just words');
   const short = await createPost(alice, { title: 'Hi' });
   const badTags = await createPost(alice, { tags: 'not json' });
   assert.equal(noImage.status, 422);
   assert.equal(short.status, 422);
   assert.equal(badTags.status, 422);
});

test('a pin needs both coordinates, in range', async () => {
   const alice = await createUser('Alice');
   const onlyLat = await createPost(alice, { lat: '10' });
   const outOfRange = await createPost(alice, { lat: '91', lng: '0' });
   assert.equal(onlyLat.status, 422);
   assert.equal(outOfRange.status, 422);
});

test('editing a post can move or remove the pin and keeps it when not sent', async () => {
   const alice = await createUser('Alice');
   const { post } = (await createPost(alice, { lat: '10', lng: '20' })).body;
   const edit = (fields) => {
      const req = request(app).put(`/feed/post/${post._id}`).set(auth(alice));
      const all = { title: post.title, content: post.content, ...fields };
      for (const [key, value] of Object.entries(all)) req.field(key, value);
      return req;
   };

   const kept = await edit({ title: 'A new title' });
   assert.equal(kept.body.post.location.lat, 10);

   const moved = await edit({ lat: '-33.86', lng: '151.21' });
   assert.equal(moved.body.post.location.lng, 151.21);

   const removed = await edit({ lat: '', lng: '' });
   assert.equal(removed.status, 200);
   assert.equal(removed.body.post.location.lat, undefined);
});

test('the feed paginates, filters by tag and sorts by popularity', async () => {
   const alice = await createUser('Alice');
   const bob = await createUser('Bob');
   const quiet = (await createPost(alice, { title: 'Quiet morning', tags: '["coffee"]' })).body
      .post;
   const loved = (await createPost(alice, { title: 'Loved sunset', tags: '["beach"]' })).body.post;
   await request(app).put(`/feed/post/${loved._id}/like`).set(auth(alice));
   await request(app).put(`/feed/post/${loved._id}/like`).set(auth(bob));

   const newest = await request(app).get('/feed/posts').set(auth(bob));
   assert.equal(newest.body.totalItems, 2);
   assert.equal(newest.body.posts[0]._id, loved._id);

   const oldest = await request(app).get('/feed/posts?sort=oldest').set(auth(bob));
   assert.equal(oldest.body.posts[0]._id, quiet._id);

   const popular = await request(app).get('/feed/posts?sort=popular').set(auth(bob));
   assert.equal(popular.body.posts[0]._id, loved._id);
   assert.equal(popular.body.posts[0].creator.name, 'Alice');

   const tagged = await request(app).get('/feed/posts?tag=Coffee').set(auth(bob));
   assert.deepEqual(
      tagged.body.posts.map((p) => p._id),
      [quiet._id]
   );

   const tags = await request(app).get('/feed/tags').set(auth(bob));
   assert.deepEqual(tags.body.tags.sort(), ['beach', 'coffee']);
});

test('pages hold 10 posts', async () => {
   const alice = await createUser('Alice');
   for (let i = 0; i < 11; i++) await createPost(alice, { title: `Post number ${i}` });
   const first = await request(app).get('/feed/posts?page=1').set(auth(alice));
   const second = await request(app).get('/feed/posts?page=2').set(auth(alice));
   assert.equal(first.body.posts.length, 10);
   assert.equal(second.body.posts.length, 1);
   assert.equal(first.body.totalItems, 11);
});

test('search matches title, content and tags', async () => {
   const alice = await createUser('Alice');
   await createPost(alice, { title: 'Kyoto temples', content: 'Moss gardens at dawn' });
   await createPost(alice, { title: 'Desert camp', content: 'Stars over the dunes' });
   const res = await request(app).get('/feed/search?q=moss').set(auth(alice));
   assert.equal(res.body.totalItems, 1);
   assert.equal(res.body.posts[0].title, 'Kyoto temples');
   const empty = await request(app).get('/feed/search?q=').set(auth(alice));
   assert.equal(empty.body.totalItems, 0);
});

test('a like toggles once per user', async () => {
   const alice = await createUser('Alice');
   const { post } = (await createPost(alice)).body;
   const like = () => request(app).put(`/feed/post/${post._id}/like`).set(auth(alice));
   const first = await like();
   const second = await like();
   assert.deepEqual([first.body.liked, first.body.likesCount], [true, 1]);
   assert.deepEqual([second.body.liked, second.body.likesCount], [false, 0]);
});

test('comments can be added, listed and deleted by their author', async () => {
   const alice = await createUser('Alice');
   const { post } = (await createPost(alice)).body;
   const added = await request(app)
      .post(`/feed/post/${post._id}/comments`)
      .set(auth(alice))
      .send({ text: 'Great trip' });
   assert.equal(added.status, 201);
   const list = await request(app).get(`/feed/post/${post._id}/comments`).set(auth(alice));
   assert.equal(list.body.comments.length, 1);
   assert.equal(list.body.comments[0].author.name, 'Alice');
   const del = await request(app)
      .delete(`/feed/comment/${added.body.comment._id}`)
      .set(auth(alice));
   assert.equal(del.status, 200);
});

test('deleting a post removes its comments and its image', async () => {
   const alice = await createUser('Alice');
   const { post } = (await createPost(alice)).body;
   await request(app)
      .post(`/feed/post/${post._id}/comments`)
      .set(auth(alice))
      .send({ text: 'Soon gone' });
   const del = await request(app).delete(`/feed/post/${post._id}`).set(auth(alice));
   assert.equal(del.status, 200);
   const comments = await request(app).get(`/feed/post/${post._id}/comments`).set(auth(alice));
   assert.equal(comments.status, 404);
   // clearImage unlinks asynchronously
   await new Promise((resolve) => setTimeout(resolve, 50));
   assert.equal(imageExists(post.imageUrl), false);
});
