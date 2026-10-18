const { test } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, createUser, auth, createPost } = require('./setup');
const { bboxFilter } = require('../controllers/map');

const seedPins = async (user) => {
   const pins = {
      Lisbon: ['38.72', '-9.14'],
      Tokyo: ['35.68', '139.69'],
      Fiji: ['-17.71', '178.07'],
      Samoa: ['-13.76', '-172.10']
   };
   for (const [title, [lat, lng]] of Object.entries(pins)) {
      await createPost(user, { title: `Trip to ${title}`, lat, lng });
   }
   await createPost(user, { title: 'Trip with no pin' });
};

const titles = (res) => res.body.posts.map((p) => p.title.replace('Trip to ', '')).sort();

test('the map returns pinned posts only, with the fields a marker needs', async () => {
   const alice = await createUser('Alice');
   await seedPins(alice);
   const res = await request(app).get('/feed/map').set(auth(alice));
   assert.equal(res.status, 200);
   assert.deepEqual(titles(res), ['Fiji', 'Lisbon', 'Samoa', 'Tokyo']);
   assert.equal(res.body.truncated, false);
   const [first] = res.body.posts;
   assert.ok(first.imageUrl);
   assert.equal(first.content, undefined);
});

test('a bounding box limits the markers to the visible area', async () => {
   const alice = await createUser('Alice');
   await seedPins(alice);
   const europe = await request(app).get('/feed/map?bbox=-25,30,40,70').set(auth(alice));
   assert.deepEqual(titles(europe), ['Lisbon']);
});

test('a box across the antimeridian finds pins on both sides of it', async () => {
   const alice = await createUser('Alice');
   await seedPins(alice);
   // Leaflet reports a Pacific view as east > 180 after panning past the date line
   const pacific = await request(app).get('/feed/map?bbox=170,-25,190,-5').set(auth(alice));
   assert.deepEqual(titles(pacific), ['Fiji', 'Samoa']);
});

test('a world-wide box returns every pin', async () => {
   const alice = await createUser('Alice');
   await seedPins(alice);
   const world = await request(app).get('/feed/map?bbox=-540,-90,540,90').set(auth(alice));
   assert.equal(world.body.posts.length, 4);
});

test('a malformed bbox is a 400', async () => {
   const alice = await createUser('Alice');
   for (const bbox of ['1,2,3', 'a,b,c,d', '0,10,10,0']) {
      const res = await request(app).get(`/feed/map?bbox=${bbox}`).set(auth(alice));
      assert.equal(res.status, 400, bbox);
   }
});

test('bboxFilter wraps longitudes into -180..180', () => {
   assert.deepEqual(bboxFilter('190,0,200,10')['location.lng'], { $gte: -170, $lte: -160 });
   assert.equal(bboxFilter('-200,0,200,10')['location.lng'], undefined);
});
