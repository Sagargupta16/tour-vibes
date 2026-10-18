const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Explicit map from whitelisted MIME types to safe file extensions.
// Prevents path traversal via crafted mimetype (e.g. "image/../../etc/passwd")
// being used to build the stored filename.
const MIMETYPE_EXTENSIONS = Object.freeze({
   'image/png': 'png',
   'image/jpg': 'jpg',
   'image/jpeg': 'jpg'
});

const fileStorage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'images');
   },
   filename: (req, file, cb) => {
      const ext = MIMETYPE_EXTENSIONS[file.mimetype] || 'bin';
      cb(null, `${uuidv4()}.${ext}`);
   }
});

const fileFilter = (req, file, cb) => {
   cb(null, Object.hasOwn(MIMETYPE_EXTENSIONS, file.mimetype));
};

// Mounted per route, after isAuth, so only signed-in users on the three upload
// routes (create post, update post, update profile) can write to disk.
module.exports = multer({
   storage: fileStorage,
   fileFilter,
   limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');
