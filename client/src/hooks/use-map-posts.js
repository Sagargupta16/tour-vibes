import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { hasPin } from '@/components/map/map-utils';

// Loads the pins for a bounding box. Panning fires many loads in a row, so each
// new one aborts the one before it and a slow old response can never overwrite
// the markers for the current view. Resolves to the pins, or null when a newer
// load superseded this one.
export default function useMapPosts() {
   const [posts, setPosts] = useState([]);
   const [truncated, setTruncated] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const controller = useRef(null);

   const load = useCallback(async (bbox) => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setLoading(true);
      try {
         const query = bbox ? `?bbox=${encodeURIComponent(bbox)}` : '';
         const data = await api.get(`/feed/map${query}`, { signal: current.signal });
         // An abort that lands while the body is read comes back as {} instead of
         // throwing; without this check it wiped the markers for the newer view
         if (controller.current !== current || current.signal.aborted) return null;
         const pins = (data.posts || []).filter(hasPin);
         setPosts(pins);
         setTruncated(Boolean(data.truncated));
         setError('');
         return pins;
      } catch (err) {
         if (err.name === 'AbortError' || current.signal.aborted) return null;
         setError(err.message || 'Could not load the map');
         throw err;
      } finally {
         if (controller.current === current) setLoading(false);
      }
   }, []);

   useEffect(() => () => controller.current?.abort(), []);

   return { posts, truncated, loading, error, load };
}
