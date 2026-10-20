const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

// CORS first, so even a body-parser error (bad JSON, 413) carries the headers the browser needs
// to read it
app.use(
   cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
   })
);

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// Multer rejections other than the size limit (unexpected field, too many parts) are the
// client's fault, not a 500
const statusFor = (error) => {
   if (error.statusCode) return error.statusCode;
   if (error.code === 'LIMIT_FILE_SIZE') return 413;
   return error.name === 'MulterError' ? 400 : 500;
};

app.use((error, req, res, next) => {
   const statusCode = statusFor(error);
   // A 5xx message can carry driver or stack detail (duplicate-key text, cast errors):
   // log it, send a generic one
   if (statusCode >= 500) console.error(error);
   const message = statusCode >= 500 ? 'Something went wrong' : error.message;
   const data = error.data;
   res.status(statusCode).json({ message, data });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tour-vibes';
const PORT = process.env.PORT || 8000;

const start = async () => {
   if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET environment variable is not set');
      process.exit(1);
   }
   try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      app.listen(PORT, (err) => {
         // Express 5 hands listen errors (EADDRINUSE) to this callback
         if (err) {
            console.error('Server failed to start:', err);
            process.exit(1);
         }
         console.log(`Server is running on port ${PORT}`);
      });
   } catch (err) {
      console.error('Database connection failed:', err);
      process.exit(1);
   }
};

// `node app.js` starts the server; the tests require the app without listening
// start() handles its own errors, so the promise is deliberately not awaited
if (require.main === module) void start();

module.exports = app;
