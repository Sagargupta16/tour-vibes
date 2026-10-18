import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

// Loads the pins for a bounding box. Panning fires many loads in a row, so each
// new one aborts the one before it and a slow old response can never overwrite
// the markers for the current view.
export default function useMapPosts() {
   const [posts, setPosts] = useState([]);
   const [truncated, setTruncated] = useState(false);
   const [loading, setLoading] = useState(true);
   const controller = useRef(null);

   const load = useCallback(async (bbox) => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setLoading(true);
      try {
         const query = bbox ? `?bbox=${encodeURIComponent(bbox)}` : '';
         const data = await api.get(`/feed/map${query}`, { signal: current.signal });
         setPosts(data.posts || []);
         setTruncated(Boolean(data.truncated));
         return data.posts || [];
      } catch (err) {
         if (err.name !== 'AbortError') throw err;
         return null;
      } finally {
         if (controller.current === current) setLoading(false);
      }
   }, []);

   useEffect(() => () => controller.current?.abort(), []);

   return { posts, truncated, loading, load };
}
