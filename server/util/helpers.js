const fs = require('fs');
const path = require('path');

const PER_PAGE = 10;

const parsePage = (raw) => {
   const page = parseInt(raw, 10);
   return Number.isFinite(page) && page > 0 ? page : 1;
};

const normalizePath = (filePath) => {
   return filePath.replace(/\\/g, '/');
};

const clearImage = (filePath) => {
   if (!filePath) return;
   const resolved = path.resolve(__dirname, '..', filePath);
   const imagesDir = path.resolve(__dirname, '..', 'images');
   if (!resolved.startsWith(imagesDir)) return;
   fs.unlink(resolved, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Failed to delete image:', err);
   });
};

// Popularity sorting is handled separately in getPosts via aggregation
// ($size of likes), since likesCount is not a stored field.
const getSortOption = (sort) => {
   switch (sort) {
      case 'oldest':
         return { createdAt: 1 };
      default:
         return { createdAt: -1 };
   }
};

// Tags arrive as a JSON-stringified array in a multipart field. Untrusted input:
// bad JSON or a non-array must surface as a 422, not an uncaught 500 from JSON.parse.
const parseTags = (raw) => {
   let parsed;
   try {
      parsed = JSON.parse(raw);
   } catch {
      const error = new Error('Tags must be a valid JSON array');
      error.statusCode = 422;
      throw error;
   }
   if (!Array.isArray(parsed)) {
      const error = new Error('Tags must be a valid JSON array');
      error.statusCode = 422;
      throw error;
   }
   return parsed;
};

module.exports = { PER_PAGE, parsePage, normalizePath, clearImage, getSortOption, parseTags };
