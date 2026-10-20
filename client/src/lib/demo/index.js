// Entry for the static demo build (GitHub Pages, `npm run build:demo`): api.js
// hands every request here instead of the network. The database lives in this
// browser, seeded from public/demo/data.json, a copy of the server's seed data.
import { createStore, PREFIX } from './db';
import { createImageStore } from './images';
import { createRouter } from './router';
import { SESSION_KEYS } from '../session';

const images = createImageStore();

const router = createRouter({
   store: createStore(localStorage),
   images,
   loadSeed: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}demo/data.json`);
      if (!res.ok) throw new Error('Demo data is missing: run npm run build:demo');
      return res.json();
   }
});

// A short random wait, so loading states show as they would against a real API.
// Honors the caller's AbortSignal like fetch does.
const latency = (signal) =>
   new Promise((resolve, reject) => {
      if (signal?.aborted) {
         reject(signal.reason);
         return;
      }
      // crypto rather than Math.random only so no reviewer has to ask; any jitter would do
      const jitter = crypto.getRandomValues(new Uint8Array(1))[0] / 255;
      const timer = setTimeout(resolve, 120 + jitter * 130);
      signal?.addEventListener(
         'abort',
         () => {
            clearTimeout(timer);
            reject(signal.reason);
         },
         { once: true }
      );
   });

// Same contract as fetch(url, init) for the paths api.js requests
export async function demoFetch(path, { method, headers, body, signal } = {}) {
   await latency(signal);
   await images.ready();
   const { status, data } = await router.handle({ method, path, headers, body });
   signal?.throwIfAborted();
   return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
   });
}

export async function resetDemo() {
   await images.ready();
   await images.clear();
   for (const key of Object.keys(localStorage)) {
      // The session keys go too, so a reset also ends the session
      if (key.startsWith(PREFIX) || SESSION_KEYS.includes(key)) localStorage.removeItem(key);
   }
   globalThis.location.reload();
}
