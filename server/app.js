const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.json());
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
   const statusCode = error.statusCode || (error.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
   const message = error.message;
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
      app.listen(PORT, () => {
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
