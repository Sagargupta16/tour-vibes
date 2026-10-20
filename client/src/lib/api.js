import { clearStored, getStored } from './session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function imageUrl(path) {
   if (!path) return '';
   if (/^(?:https?|data|blob):/.test(path)) return path;
   // The static demo serves its seeded photos from public/demo/ under the app's base path
   if (import.meta.env.VITE_STATIC_DEMO === 'true') return `${import.meta.env.BASE_URL}${path}`;
   return `${API_URL}/${path}`;
}

// The static demo build (GitHub Pages) has no server: the in-browser mock API in
// lib/demo answers instead. Every other build drops this import.
async function send(path, init) {
   if (import.meta.env.VITE_STATIC_DEMO === 'true') {
      const { demoFetch } = await import('./demo/index');
      return demoFetch(path, init);
   }
   return fetch(`${API_URL}${path}`, init);
}

async function request(path, options = {}) {
   const token = getStored('token');
   const headers = { ...options.headers };

   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }
   if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
   }

   const res = await send(path, { ...options, headers });

   // Only a request that carried a token can have an expired session; a failed
   // login is also a 401 and must surface the server's message instead.
   if (res.status === 401 && token) {
      clearStored();
      globalThis.dispatchEvent(new Event('auth:expired'));
      throw new Error('Session expired');
   }

   const data = await res.json().catch(() => ({}));

   if (!res.ok) {
      const err = new Error(data.message || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data.data;
      throw err;
   }

   return data;
}

export const api = {
   get: (path, options) => request(path, options),
   post: (path, body) =>
      request(path, {
         method: 'POST',
         body: body instanceof FormData ? body : JSON.stringify(body)
      }),
   put: (path, body) =>
      request(path, {
         method: 'PUT',
         body: body instanceof FormData ? body : JSON.stringify(body)
      }),
   delete: (path) => request(path, { method: 'DELETE' })
};
