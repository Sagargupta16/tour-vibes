import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Most-liked journals for the landing page (the first page of the popular sort).
// A failed request is not an error screen here: the sections that need posts
// just stay hidden, so status is 'loading' | 'ready' | 'error'.
export default function useFeaturedPosts() {
   const [state, setState] = useState({ posts: [], total: 0, status: 'loading' });

   useEffect(() => {
      const controller = new AbortController();
      const load = async () => {
         try {
            const data = await api.get('/feed/posts?sort=popular', { signal: controller.signal });
            setState({
               posts: Array.isArray(data.posts) ? data.posts : [],
               total: Number(data.totalItems) || 0,
               status: 'ready'
            });
         } catch (err) {
            if (err?.name === 'AbortError') return;
            setState({ posts: [], total: 0, status: 'error' });
         }
      };
      void load();
      return () => controller.abort();
   }, []);

   return state;
}
