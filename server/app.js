const express = require('express');
const bodyParser = require('body-parser');
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
      cb(null, uuidv4() + '.' + file.mimetype.split('/')[1]);
   }
});

const ALLOWED_MIMETYPES = new Set(['image/png', 'image/jpg', 'image/jpeg']);

const fileFilter = (req, file, cb) => {
   cb(null, ALLOWED_MIMETYPES.has(file.mimetype));
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

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
   }
   next();
});

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
