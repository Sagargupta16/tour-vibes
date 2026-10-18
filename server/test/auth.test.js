const { test } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, createUser, auth, PNG, imageExists } = require('./setup');

test('signup, login and profile round trip', async () => {
   const signup = await request(app)
      .put('/auth/signup')
      .send({ name: 'Carol', email: 'Carol@Example.com', password: 'password123' });
   assert.equal(signup.status, 201);

   const login = await request(app)
      .post('/auth/login')
      .send({ email: 'carol@example.com', password: 'password123' });
   assert.equal(login.status, 200);
   assert.equal(login.body.name, 'Carol');

   const profile = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${login.body.token}`);
   assert.equal(profile.status, 200);
   assert.equal(profile.body.user.email, 'carol@example.com');
   assert.equal(profile.body.user.password, undefined);
});

test('signup rejects a taken email and a short password', async () => {
   const alice = await createUser('Alice');
   const taken = await request(app)
      .put('/auth/signup')
      .send({ name: 'Again', email: alice.email, password: 'password123' });
   const short = await request(app)
      .put('/auth/signup')
      .send({ name: 'Dan', email: 'dan@example.com', password: 'short' });
   assert.equal(taken.status, 422);
   assert.equal(short.status, 422);
});

test('changing the password makes the old one stop working', async () => {
   const alice = await createUser('Alice');
   const change = await request(app)
      .put('/auth/password')
      .set(auth(alice))
      .send({ currentPassword: alice.password, newPassword: 'brand-new-pass' });
   assert.equal(change.status, 200);
   const old = await request(app)
      .post('/auth/login')
      .send({ email: alice.email, password: alice.password });
   const fresh = await request(app)
      .post('/auth/login')
      .send({ email: alice.email, password: 'brand-new-pass' });
   assert.equal(old.status, 401);
   assert.equal(fresh.status, 200);
});

test('replacing the avatar deletes the old file', async () => {
   const alice = await createUser('Alice');
   const upload = () =>
      request(app).put('/auth/profile').set(auth(alice)).attach('image', PNG, 'me.png');
   const first = (await upload()).body.user.avatar;
   const second = (await upload()).body.user.avatar;
   assert.notEqual(first, second);
   await new Promise((resolve) => setTimeout(resolve, 50));
   assert.equal(imageExists(first), false);
   assert.ok(imageExists(second));
});

test('a public profile hides email and password', async () => {
   const alice = await createUser('Alice');
   const bob = await createUser('Bob');
   const res = await request(app).get(`/auth/user/${alice.id}`).set(auth(bob));
   assert.equal(res.status, 200);
   assert.equal(res.body.user.name, 'Alice');
   assert.equal(res.body.user.email, undefined);
   assert.equal(res.body.user.password, undefined);
});

test('demo login signs in as DEMO_EMAIL and is off without it', async () => {
   const alice = await createUser('Alice');
   delete process.env.DEMO_EMAIL;
   const off = await request(app).post('/auth/demo');
   assert.equal(off.status, 404);

   process.env.DEMO_EMAIL = alice.email.toUpperCase();
   try {
      const demo = await request(app).post('/auth/demo');
      assert.equal(demo.status, 200);
      assert.equal(demo.body.userId, alice.id);
      assert.equal(demo.headers['x-ratelimit-limit'], '20');
      const profile = await request(app)
         .get('/auth/profile')
         .set('Authorization', `Bearer ${demo.body.token}`);
      assert.equal(profile.body.user.name, 'Alice');
   } finally {
      delete process.env.DEMO_EMAIL;
   }
});
