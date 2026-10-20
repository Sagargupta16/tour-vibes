import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export const PER_PAGE = 10;

// The search endpoint ignores tag and sort, and a user's own list ignores all three
const buildPath = ({ userId, searchQuery, tag, sort, page }) => {
   if (userId) return `/feed/posts/${userId}?page=${page}`;
   if (searchQuery) return `/feed/search?${new URLSearchParams({ q: searchQuery, page })}`;
   const params = new URLSearchParams({ page });
   if (sort && sort !== 'newest') params.set('sort', sort);
   if (tag) params.set('tag', tag);
   return `/feed/posts?${params}`;
};

// Pass `page` to control paging from outside (the feed keeps it in the URL); leave it
// out and the hook keeps its own page, reset to 1 whenever the query changes.
// `userId: null` (signed out on a personal page) fetches nothing rather than every
// traveler's journals; leave userId out entirely for the public feed.
export default function useFeed({
   userId,
   searchQuery = '',
   tag = '',
   sort = 'newest',
   page: pageProp
} = {}) {
   const scope = `${userId ?? ''}|${searchQuery}|${tag}|${sort}`;
   const [ownPage, setOwnPage] = useState({ scope, page: 1 });
   const page = pageProp ?? (ownPage.scope === scope ? ownPage.page : 1);
   const [version, setVersion] = useState(0);
   const path = buildPath({ userId, searchQuery, tag, sort, page });
   const requestKey = `${path}#${version}`;
   const [result, setResult] = useState({
      key: null,
      userId,
      query: { searchQuery, tag },
      posts: [],
      totalPosts: 0,
      error: null
   });

   useEffect(() => {
      if (userId === null) return undefined;
      // Aborting on cleanup means a slow response for an older query or page can never
      // replace the current one; the aborted check also covers an api that ignores signal
      const controller = new AbortController();
      const settle = (fields) =>
         setResult({ key: requestKey, userId, query: { searchQuery, tag }, ...fields });
      const load = async () => {
         try {
            const data = await api.get(path, { signal: controller.signal });
            if (controller.signal.aborted) return;
            settle({ posts: data.posts || [], totalPosts: data.totalItems || 0, error: null });
         } catch (err) {
            if (controller.signal.aborted || err.name === 'AbortError') return;
            settle({ posts: [], totalPosts: 0, error: err.message || 'Could not load journals' });
         }
      };
      load();
      return () => controller.abort();
   }, [path, requestKey, userId, searchQuery, tag]);

   // Derived instead of set in the effect, so it can never get stuck after an abort
   const loading = userId !== null && result.key !== requestKey;
   // Never flash one traveler's journals while another traveler's are loading
   const posts = result.userId === userId ? result.posts : [];
   const totalPosts = result.userId === userId ? result.totalPosts : 0;

   const reload = useCallback(() => setVersion((v) => v + 1), [setVersion]);
   const goToPage = useCallback((p) => setOwnPage({ scope, page: p }), [scope, setOwnPage]);

   const createPost = async (formData) => {
      const data = await api.post('/feed/posts', formData);
      // Refetch rather than prepend: the new journal may not belong on this page or filter
      reload();
      return data.post;
   };

   const updatePost = async (postId, formData) => {
      const data = await api.put(`/feed/post/${postId}`, formData);
      setResult((prev) => ({
         ...prev,
         posts: prev.posts.map((p) => (p._id === postId ? data.post : p))
      }));
      return data.post;
   };

   const deletePost = async (postId) => {
      await api.delete(`/feed/post/${postId}`);
      const emptiesPage = posts.length === 1 && page > 1;
      setResult((prev) => ({
         ...prev,
         posts: prev.posts.filter((p) => p._id !== postId),
         totalPosts: Math.max(0, prev.totalPosts - 1)
      }));
      // Step back when the last journal on a later page goes, else refill this page
      if (emptiesPage && pageProp == null) goToPage(page - 1);
      else reload();
   };

   return {
      posts,
      totalPosts,
      page,
      loading,
      error: loading ? null : result.error,
      // The filters the shown posts were fetched with, for copy like "12 results for x"
      resultQuery: result.query,
      goToPage,
      reload,
      createPost,
      updatePost,
      deletePost,
      lastPage: Math.ceil(totalPosts / PER_PAGE)
   };
}
