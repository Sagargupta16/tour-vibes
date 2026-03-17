const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function imageUrl(path) {
   if (!path) return '';
   if (path.startsWith('http')) return path;
   return `${API_URL}/${path}`;
}

async function request(path, options = {}) {
   const token = localStorage.getItem('token');
   const headers = { ...options.headers };

   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }
   if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
   }

   const res = await fetch(`${API_URL}${path}`, { ...options, headers });

   if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('expiryDate');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      window.dispatchEvent(new Event('auth:expired'));
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
   get: (path) => request(path),
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
