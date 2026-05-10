const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'images');
   },
   filename: (req, file, cb) => {
      const ext = MIMETYPE_EXTENSIONS[file.mimetype] || 'bin';
      cb(null, `${uuidv4()}.${ext}`);
   }
});

// Explicit map from whitelisted MIME types to safe file extensions.
// Prevents path traversal via crafted mimetype (e.g. "image/../../etc/passwd")
// being used to build the stored filename.
const MIMETYPE_EXTENSIONS = Object.freeze({
   'image/png': 'png',
   'image/jpg': 'jpg',
   'image/jpeg': 'jpg'
});

const fileFilter = (req, file, cb) => {
   cb(null, Object.hasOwn(MIMETYPE_EXTENSIONS, file.mimetype));
};

app.use(bodyParser.json());
app.use(
   multer({
      storage: fileStorage,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }
   }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
   cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
   })
);

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
   const statusCode = error.statusCode || 500;
   const message = error.message;
   const data = error.data;
   res.status(statusCode).json({ message, data });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tour-vibes';
const PORT = process.env.PORT || 8000;

if (!process.env.JWT_SECRET) {
   console.error('FATAL: JWT_SECRET environment variable is not set');
   process.exit(1);
}

mongoose
   .connect(MONGODB_URI)
   .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
      });
   })
   .catch((err) => {
      console.error('Database connection failed:', err);
      process.exit(1);
   });
