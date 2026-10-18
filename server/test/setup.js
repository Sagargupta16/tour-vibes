// Shared test harness: an in-memory MongoDB per test file, the real Express app,
// and helpers that create users and posts without going through the rate-limited
// signup and login routes.
const fs = require('node:fs');
const path = require('node:path');
const { after, before, beforeEach } = require('node:test');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test-secret';

const app = require('../app');
const User = require('../models/users');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
// Smallest PNG header; multer only checks the MIME type, which supertest derives
// from the .png filename
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

const listImages = () => new Set(fs.readdirSync(IMAGES_DIR).filter((f) => f !== '.gitkeep'));

let mongod;
let existingImages;

before(async () => {
   existingImages = listImages();
   mongod = await MongoMemoryServer.create();
   await mongoose.connect(mongod.getUri());
   await mongoose.connection.syncIndexes();
});

beforeEach(async () => {
   const { collections } = mongoose.connection;
   await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

after(async () => {
   // Remove only the files this test file uploaded
   for (const file of listImages()) {
      if (!existingImages.has(file)) fs.rmSync(path.join(IMAGES_DIR, file));
   }
   await mongoose.disconnect();
   await mongod.stop();
});

const createUser = async (name, password = 'password123') => {
   const user = await User.create({
      name,
      email: `${name.toLowerCase()}@example.com`,
      password: await bcrypt.hash(password, 4)
   });
   const token = jwt.sign({ email: user.email, userId: user._id.toString() }, 'test-secret', {
      expiresIn: '1h'
   });
   return { id: user._id.toString(), email: user.email, password, token };
};

const auth = (user) => ({ Authorization: `Bearer ${user.token}` });

// Multipart create through the real route, so multer and validation both run
const createPost = (user, fields = {}, file = { data: PNG, name: 'photo.png' }) => {
   const req = request(app).post('/feed/posts').set(auth(user));
   const all = { title: 'A day in Lisbon', content: 'Trams, tiles and custard tarts', ...fields };
   for (const [key, value] of Object.entries(all)) req.field(key, value);
   return req.attach('image', file.data, file.name);
};

const imageExists = (imageUrl) => fs.existsSync(path.join(__dirname, '..', imageUrl));

module.exports = { app, request, createUser, auth, createPost, imageExists, listImages, PNG };
