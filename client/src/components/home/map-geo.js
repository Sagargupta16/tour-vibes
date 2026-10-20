import { WORLD_ROWS } from './world-dots';

const CELL = 10;
const LAT_TOP = 80;
const LAT_SPAN = 135;

// SVG user space of the dot map: <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
export const MAP_W = WORLD_ROWS[0].length * CELL;
export const MAP_H = WORLD_ROWS.length * CELL;

// Every land dot in one path: a zero-length segment with a round cap draws a dot,
// so ~700 dots cost a single DOM node
export const WORLD_DOTS_PATH = WORLD_ROWS.flatMap((row, r) =>
   [...row].map((cell, c) =>
      cell === 'x' ? `M${c * CELL + CELL / 2} ${r * CELL + CELL / 2}h0` : ''
   )
).join('');

// Latitude and longitude to map coordinates (equirectangular, clamped to the map)
export function project(lat, lng) {
   const x = ((lng + 180) / 360) * MAP_W;
   const y = ((LAT_TOP - lat) / LAT_SPAN) * MAP_H;
   return { x: Math.min(Math.max(x, 0), MAP_W), y: Math.min(Math.max(y, 0), MAP_H) };
}

// The same point as CSS percentages, for HTML laid over the svg
export const toPercent = ({ x, y }) => ({
   left: `${(x / MAP_W) * 100}%`,
   top: `${(y / MAP_H) * 100}%`
});

// A gentle arc between two map points, bowed upward like a flight path
export function arcPath(a, b) {
   const mx = (a.x + b.x) / 2;
   const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.28;
   return `M${a.x} ${a.y}Q${mx} ${my} ${b.x} ${b.y}`;
}

// Used when the API has no pinned journals yet, so the hero still tells the story
const FALLBACK_STOPS = [
   { id: 'lisbon', name: 'Lisbon', country: 'Portugal', lat: 38.72, lng: -9.14 },
   { id: 'cusco', name: 'Cusco', country: 'Peru', lat: -13.53, lng: -71.97 },
   { id: 'kyoto', name: 'Kyoto', country: 'Japan', lat: 35.01, lng: 135.77 },
   { id: 'cape-town', name: 'Cape Town', country: 'South Africa', lat: -33.92, lng: 18.42 }
];

const hasPin = (post) =>
   Number.isFinite(post?.location?.lat) && Number.isFinite(post?.location?.lng);

// Up to `max` journals with a map pin, one per place, ordered west to east so the
// route reads left to right
export function stopsFrom(posts, max = 4) {
   const seen = new Set();
   const stops = [];
   for (const post of posts) {
      if (!hasPin(post)) continue;
      const key = `${Math.round(post.location.lat)},${Math.round(post.location.lng)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      stops.push({
         id: post._id,
         name: post.location.name || post.title,
         country: post.location.country || '',
         lat: post.location.lat,
         lng: post.location.lng,
         post
      });
      if (stops.length === max) break;
   }
   const list = stops.length >= 2 ? stops : FALLBACK_STOPS;
   return [...list].sort((a, b) => a.lng - b.lng);
}
