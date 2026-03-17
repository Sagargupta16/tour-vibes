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

const getSortOption = (sort) => {
   switch (sort) {
      case 'oldest':
         return { createdAt: 1 };
      case 'popular':
         return { likesCount: -1, createdAt: -1 };
      default:
         return { createdAt: -1 };
   }
};

module.exports = { PER_PAGE, parsePage, normalizePath, clearImage, getSortOption };
