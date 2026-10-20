import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { hasPin } from '@/components/map/map-utils';

// Pages fetched up front, in parallel after the first: enough journals for honest
// stats and a full map without a long request chain. The rest load on demand.
const PAGE_CAP = 5;

const EMPTY = { key: null, status: 'loading', user: null, posts: [], total: 0, page: 0 };

const fetchPage = (userId, page, signal) =>
   api.get(`/feed/posts/${userId}${page > 1 ? `?page=${page}` : ''}`, { signal });

const dedupe = (posts) => {
   const seen = new Set();
   return posts.filter((post) => {
      if (seen.has(post._id)) return false;
      seen.add(post._id);
      return true;
   });
};

// Distinct places (by name, else by a ~10 km pin cell) and likes across the posts
export const statsOf = (posts) => {
   const places = new Set();
   let likes = 0;
   for (const post of posts) {
      likes += Array.isArray(post.likes) ? post.likes.length : 0;
      const name = [post.location?.name, post.location?.country]
         .filter(Boolean)
         .join(', ')
         .toLowerCase();
      if (name) places.add(name);
      else if (hasPin(post)) {
         places.add(`${post.location.lat.toFixed(1)},${post.location.lng.toFixed(1)}`);
      }
   }
   return { places: places.size, likes };
};

// A traveler's public profile plus their journals. status: loading | ready |
// missing (no such user, or a malformed id) | error.
export default function useTraveler(userId) {
   const [data, setData] = useState(EMPTY);
   const [attempt, setAttempt] = useState(0);
   const [loadingMore, setLoadingMore] = useState(false);

   const fetchAll = useCallback(
      async (signal) => {
         try {
            const [profile, first] = await Promise.all([
               api.get(`/auth/user/${userId}`, { signal }),
               fetchPage(userId, 1, signal)
            ]);
            const firstPosts = first.posts || [];
            const total = first.totalItems ?? firstPosts.length;
            // Page size from the server's own first page, not a copy of PER_PAGE
            const perPage = Math.max(firstPosts.length, 1);
            const lastPage = Math.min(Math.ceil(total / perPage), PAGE_CAP);
            const rest = await Promise.all(
               Array.from({ length: Math.max(lastPage - 1, 0) }, (_, i) =>
                  fetchPage(userId, i + 2, signal)
               )
            );
            const posts = dedupe([firstPosts, ...rest.map((r) => r.posts || [])].flat());
            setData({
               key: userId,
               status: 'ready',
               user: profile.user,
               posts,
               total: Math.max(total, posts.length),
               page: Math.max(lastPage, 1)
            });
         } catch (err) {
            if (signal.aborted || err.name === 'AbortError') return;
            const missing = err.status === 404 || err.status === 400;
            setData({ ...EMPTY, key: userId, status: missing ? 'missing' : 'error' });
         }
      },
      [userId]
   );

   useEffect(() => {
      const controller = new AbortController();
      void fetchAll(controller.signal);
      return () => controller.abort();
   }, [fetchAll, attempt]);

   const loadMore = async () => {
      setLoadingMore(true);
      try {
         const next = data.page + 1;
         const res = await fetchPage(userId, next);
         setData((d) =>
            d.key === userId
               ? { ...d, page: next, posts: dedupe([...d.posts, ...(res.posts || [])]) }
               : d
         );
      } catch (err) {
         toast.error(err.message);
      } finally {
         setLoadingMore(false);
      }
   };

   const retry = () => {
      setData(EMPTY);
      setAttempt((n) => n + 1);
   };

   // Data for another :userId (a link from one traveler to the next) is stale
   const current = data.key === userId ? data : EMPTY;

   return {
      ...current,
      hasMore: current.status === 'ready' && current.posts.length < current.total,
      loadMore,
      loadingMore,
      retry
   };
}
