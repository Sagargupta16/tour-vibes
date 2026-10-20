const Post = require('../models/post');

const MAP_LIMIT = 500;

// Leaflet bounds can run past +-180 when the map wraps; fold a longitude back
// into [-180, 180).
const wrapLng = (lng) => ((((lng + 180) % 360) + 360) % 360) - 180;

// bbox=west,south,east,north (Leaflet's toBBoxString order). Returns a Mongo
// filter on the pin fields, or throws a 400 for anything that is not 4 numbers.
const bboxFilter = (raw) => {
   // Number('') is 0, so a blank part (",,,") must be rejected before it becomes a coordinate
   const parts = String(raw)
      .split(',')
      .map((part) => (part.trim() === '' ? Number.NaN : Number(part)));
   if (parts.length !== 4 || !parts.every(Number.isFinite) || parts[1] > parts[3]) {
      const error = new Error('bbox must be west,south,east,north');
      error.statusCode = 400;
      throw error;
   }
   const [west, south, east, north] = parts;
   const filter = {
      'location.lat': { $gte: Math.max(south, -90), $lte: Math.min(north, 90) }
   };
   // A view 360 degrees wide or more shows every longitude
   if (east - west >= 360) return filter;
   const w = wrapLng(west);
   const e = wrapLng(east);
   if (w <= e) {
      filter['location.lng'] = { $gte: w, $lte: e };
   } else {
      // The view crosses the antimeridian: two ranges, one each side of it
      filter.$or = [{ 'location.lng': { $gte: w } }, { 'location.lng': { $lte: e } }];
   }
   return filter;
};

exports.getMapPosts = async (req, res, next) => {
   try {
      const filter = req.query.bbox
         ? bboxFilter(req.query.bbox)
         : { 'location.lat': { $exists: true } };
      filter['location.lng'] ??= { $exists: true };
      const posts = await Post.find(filter)
         .select('title imageUrl location createdAt')
         .sort({ createdAt: -1 })
         .limit(MAP_LIMIT)
         .lean();
      res.status(200).json({ posts, truncated: posts.length === MAP_LIMIT });
   } catch (err) {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
   }
};

exports.bboxFilter = bboxFilter;
