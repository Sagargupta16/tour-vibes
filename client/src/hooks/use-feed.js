import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

const PER_PAGE = 10;

export default function useFeed({ userId, searchQuery, tag, sort } = {}) {
   const [posts, setPosts] = useState([]);
   const [totalPosts, setTotalPosts] = useState(0);
   const [page, setPage] = useState(1);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const fetchPosts = useCallback(
      async (p) => {
         setLoading(true);
         setError(null);
         try {
            let path;
            if (searchQuery) {
               path = `/feed/search?q=${encodeURIComponent(searchQuery)}&page=${p}`;
            } else if (userId) {
               path = `/feed/posts/${userId}?page=${p}`;
            } else {
               const params = new URLSearchParams({ page: p });
               if (sort && sort !== 'newest') params.set('sort', sort);
               if (tag) params.set('tag', tag);
               path = `/feed/posts?${params}`;
            }
            const data = await api.get(path);
            setPosts(data.posts || []);
            setTotalPosts(data.totalItems || 0);
         } catch (err) {
            setError(err.message);
         }
         setLoading(false);
      },
      [userId, searchQuery, tag, sort]
   );

   useEffect(() => {
      setPage(1);
      fetchPosts(1);
   }, [fetchPosts]);

   const goToPage = (p) => {
      setPage(p);
      fetchPosts(p);
   };

   const createPost = async (formData) => {
      const data = await api.post('/feed/posts', formData);
      setPosts((prev) => [data.post, ...prev].slice(0, PER_PAGE));
      setTotalPosts((t) => t + 1);
      return data.post;
   };

   const updatePost = async (postId, formData) => {
      const data = await api.put(`/feed/post/${postId}`, formData);
      setPosts((prev) => prev.map((p) => (p._id === postId ? data.post : p)));
      return data.post;
   };

   const deletePost = async (postId) => {
      await api.delete(`/feed/post/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setTotalPosts((t) => t - 1);
   };

   return {
      posts,
      totalPosts,
      page,
      loading,
      error,
      goToPage,
      createPost,
      updatePost,
      deletePost,
      lastPage: Math.ceil(totalPosts / PER_PAGE)
   };
}
