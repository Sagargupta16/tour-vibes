const fs = require('fs');
const path = require('path');

const PER_PAGE = 10;
// Past this the skip() would overflow what Mongo accepts and turn into a 500
const MAX_PAGE = 100000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 40;

const parsePage = (raw) => {
   const page = parseInt(raw, 10);
   return Number.isFinite(page) && page > 0 ? Math.min(page, MAX_PAGE) : 1;
};

const normalizePath = (filePath) => {
   return filePath.replace(/\\/g, '/');
};

const clearImage = (filePath) => {
   if (!filePath) return;
   const resolved = path.resolve(__dirname, '..', filePath);
   const imagesDir = path.resolve(__dirname, '..', 'images');
   // The separator matters: a bare startsWith also let a sibling like images-old/ through
   if (!resolved.startsWith(imagesDir + path.sep)) return;
   fs.unlink(resolved, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Failed to delete image:', err);
   });
};

// multer writes the upload before validation and ownership checks run, so every
// failed request that carried a file has to remove it again or it is orphaned.
const discardUpload = (req) => {
   if (req.file) clearImage(normalizePath(req.file.path));
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
   const valid =
      Array.isArray(parsed) &&
      parsed.length <= MAX_TAGS &&
      parsed.every((tag) => typeof tag === 'string' && tag.length <= MAX_TAG_LENGTH);
   if (!valid) {
      const error = new Error(
         `Tags must be a JSON array of up to ${MAX_TAGS} strings of ${MAX_TAG_LENGTH} characters`
      );
      error.statusCode = 422;
      throw error;
   }
   return parsed;
};

// Map pin from the multipart lat/lng fields (range-checked by express-validator).
// Returns undefined when neither field was sent, null when both are empty (pin
// removed), and { lat, lng } otherwise. One without the other is a 422.
const parseCoordinates = (body) => {
   const { lat, lng } = body;
   if (lat === undefined && lng === undefined) return undefined;
   if (!lat && !lng) return null;
   if (!lat || !lng) {
      const error = new Error('Latitude and longitude must be sent together');
      error.statusCode = 422;
      throw error;
   }
   return { lat: Number(lat), lng: Number(lng) };
};

// The edit form's fields onto a post. An empty field clears the value; a field that
// was not sent keeps it. parseTags throws the 422 for bad tags.
const applyPostEdits = (post, body) => {
   post.title = body.title;
   post.content = body.content;
   if (body.tags) post.tags = parseTags(body.tags);
   if (body.locationName !== undefined) post.location.name = body.locationName;
   if (body.locationCountry !== undefined) post.location.country = body.locationCountry;
   // undefined: pin not sent, keep it; null: pin removed; object: pin moved
   const coords = parseCoordinates(body);
   if (coords !== undefined) {
      post.location.lat = coords?.lat;
      post.location.lng = coords?.lng;
   }
   if (body.travelDate !== undefined) {
      post.travelDate = body.travelDate ? new Date(body.travelDate) : undefined;
   }
};

module.exports = {
   PER_PAGE,
   parsePage,
   normalizePath,
   clearImage,
   discardUpload,
   getSortOption,
   parseTags,
   parseCoordinates,
   applyPostEdits
};
