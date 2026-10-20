// Photo storage for the demo API. Uploads are downscaled on a canvas and kept
// as Blobs in IndexedDB, since localStorage holds about 5MB for the whole origin
// (other apps share sagargupta.online). Each page load turns them into object
// URLs once, so url() can answer synchronously while a response is built.
import { UPLOAD_PREFIX, httpError, objectId } from './util';

const DB_NAME = 'tv-demo';
const STORE = 'images';
const QUALITY = 0.82;

const settle = (request) =>
   new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
   });

const committed = (tx) =>
   new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
   });

const openDb = () => {
   const request = indexedDB.open(DB_NAME, 1);
   request.onupgradeneeded = () => request.result.createObjectStore(STORE);
   return settle(request);
};

// Longest side at most maxSide px, re-encoded as JPEG on white (PNGs can be transparent)
async function downscale(file, maxSide) {
   let bitmap;
   try {
      bitmap = await createImageBitmap(file);
   } catch {
      throw httpError(422, 'Could not read this image');
   }
   const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
   const canvas = document.createElement('canvas');
   canvas.width = Math.max(1, Math.round(bitmap.width * scale));
   canvas.height = Math.max(1, Math.round(bitmap.height * scale));
   const ctx = canvas.getContext('2d');
   ctx.fillStyle = '#fff';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
   bitmap.close();
   const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
   if (!blob) throw httpError(422, 'Could not read this image');
   return blob;
}

export function createImageStore() {
   const urls = new Map();
   let opening = null;

   const load = async () => {
      try {
         const db = await openDb();
         const store = db.transaction(STORE).objectStore(STORE);
         const [keys, blobs] = await Promise.all([
            settle(store.getAllKeys()),
            settle(store.getAll())
         ]);
         keys.forEach((key, i) => urls.set(key, URL.createObjectURL(blobs[i])));
         return db;
      } catch {
         // Some private windows block IndexedDB: uploads then last until a reload
         return null;
      }
   };
   const ready = () => (opening ??= load());

   const write = async (change) => {
      const db = await ready();
      if (!db) return;
      const tx = db.transaction(STORE, 'readwrite');
      change(tx.objectStore(STORE));
      await committed(tx);
   };

   return {
      ready,
      url: (ref) => urls.get(ref) ?? '',
      async save(file, maxSide) {
         const blob = await downscale(file, maxSide);
         const ref = `${UPLOAD_PREFIX}${objectId()}`;
         await write((store) => store.put(blob, ref));
         urls.set(ref, URL.createObjectURL(blob));
         return ref;
      },
      // Seeded photos and empty avatars are not ours to delete
      async remove(ref) {
         if (!urls.has(ref)) return;
         await write((store) => store.delete(ref));
         URL.revokeObjectURL(urls.get(ref));
         urls.delete(ref);
      },
      async clear() {
         await write((store) => store.clear());
         for (const url of urls.values()) URL.revokeObjectURL(url);
         urls.clear();
      }
   };
}
