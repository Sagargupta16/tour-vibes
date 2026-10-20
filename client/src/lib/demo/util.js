// Shared helpers for the demo API: Mongo-style ids, errors shaped like the
// server's (statusCode, message, data) and express-validator style field errors.

export const PER_PAGE = 10;
// The server caps the page so skip() cannot overflow
const MAX_PAGE = 100000;

// Uploaded photos are stored under this prefix and swapped for a viewable URL
// on the way out (see router.js)
export const UPLOAD_PREFIX = 'demo-upload:';

export const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export const randomHex = (bytes) => hex(crypto.getRandomValues(new Uint8Array(bytes)));

// 24 hex chars like an ObjectId (4-byte timestamp, 8 random bytes): the client
// and the server's valid-id middleware both expect that shape
export const objectId = (now = Date.now()) =>
   Math.floor(now / 1000)
      .toString(16)
      .padStart(8, '0') + randomHex(8);

// Seeded ids are fixed, so a shared link to a demo journal opens in any browser
export const seedId = (kind, index) =>
   `5eed${kind.toString(16).padStart(4, '0')}${index.toString(16).padStart(16, '0')}`;

export const isObjectId = (value) => /^[0-9a-f]{24}$/i.test(value);

export const iso = (ms) => new Date(ms).toISOString();

// Newest first; ISO timestamps sort as plain strings
export const newest = (a, b) => b.createdAt.localeCompare(a.createdAt);

export const parsePage = (raw) => {
   const page = Number.parseInt(raw, 10);
   return Number.isFinite(page) && page > 0 ? Math.min(page, MAX_PAGE) : 1;
};

export const paginate = (list, raw) => {
   const page = parsePage(raw);
   return list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
};

export const httpError = (statusCode, message, data) =>
   Object.assign(new Error(message), { statusCode, data });

// What express-validator's sanitizers see: missing fields become ''
export const text = (value) => (value == null ? '' : String(value));

// Same as /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ without the regex backtracking: one @ with
// something before it, and a dot in the domain with 1+ characters before and 2+ after
export const isEmail = (value) => {
   const s = text(value);
   const at = s.indexOf('@');
   if (at < 1 || at !== s.lastIndexOf('@') || /\s/.test(s)) return false;
   const domain = s.slice(at + 1);
   const dot = domain.indexOf('.', 1);
   return dot !== -1 && dot <= domain.length - 3;
};

export const isFloatIn = (value, min, max) => {
   const raw = text(value).trim();
   const n = Number(raw);
   return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(raw) && n >= min && n <= max;
};

// Collects failed checks and throws the server's 422: { message, data: [...] }
export function validator(body) {
   const errors = [];
   return {
      check(path, ok, msg) {
         if (!ok) errors.push({ type: 'field', value: body[path], msg, path, location: 'body' });
      },
      done() {
         if (errors.length) throw httpError(422, 'Validation failed', errors);
      }
   };
}

export const pick = (doc, keys) => Object.fromEntries(keys.map((key) => [key, doc[key]]));

export const omit = (doc, keys) =>
   Object.fromEntries(Object.entries(doc).filter(([key]) => !keys.includes(key)));
