import { useState, useEffect, useCallback } from 'react';

const PER_PAGE = 10;

export default function useFeed(token, fetchUrl) {
   const [posts, setPosts] = useState([]);
   const [totalPosts, setTotalPosts] = useState(0);
   const [postPage, setPostPage] = useState(1);
   const [postsLoading, setPostsLoading] = useState(true);
   const [isEditing, setIsEditing] = useState(false);
   const [editPost, setEditPost] = useState(null);
   const [editLoading, setEditLoading] = useState(false);
   const [error, setError] = useState(null);

   const headers = { Authorization: 'Bearer ' + token };

   const loadPosts = useCallback(
      async (page) => {
         setPostsLoading(true);
         try {
            const res = await fetch(fetchUrl + '?page=' + page, { headers });
            if (res.status !== 200) throw new Error('Failed to fetch posts.');
            const data = await res.json();
            setPosts(data.posts);
            setTotalPosts(data.totalItems);
         } catch (err) {
            setError(err);
         }
         setPostsLoading(false);
      },
      [fetchUrl, token]
   );

   useEffect(() => {
      loadPosts(1);
   }, [loadPosts]);

   const goToPage = (direction) => {
      const newPage = direction === 'next' ? postPage + 1 : postPage - 1;
      setPostPage(newPage);
      loadPosts(newPage);
   };

   const startEdit = (postId) => {
      const loaded = { ...posts.find((p) => p._id === postId) };
      setIsEditing(true);
      setEditPost(loaded);
   };

   const cancelEdit = () => {
      setIsEditing(false);
      setEditPost(null);
   };

   const finishEdit = async (postData) => {
      setEditLoading(true);
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      formData.append('image', postData.image);
      let url = 'http://localhost:8000/feed/posts';
      let method = 'POST';
      if (editPost) {
         url = 'http://localhost:8000/feed/post/' + editPost._id;
         method = 'PUT';
      }
      try {
         const res = await fetch(url, { method, body: formData, headers });
         if (res.status !== 200 && res.status !== 201) {
            throw new Error('Creating or editing a post failed!');
         }
         const resData = await res.json();
         setPosts((prev) => {
            if (editPost) {
               return prev.map((p) => (p._id === editPost._id ? resData.post : p));
            }
            return [resData.post, ...prev].slice(0, PER_PAGE);
         });
      } catch (err) {
         setError(err);
      }
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
   };

   const deletePost = async (postId) => {
      setPostsLoading(true);
      try {
         const res = await fetch('http://localhost:8000/feed/post/' + postId, {
            method: 'DELETE',
            headers
         });
         if (res.status !== 200) throw new Error('Deleting a post failed!');
         setPosts((prev) => prev.filter((p) => p._id !== postId));
      } catch (err) {
         setError(err);
      }
      setPostsLoading(false);
   };

   return {
      posts,
      totalPosts,
      postPage,
      postsLoading,
      isEditing,
      editPost,
      editLoading,
      error,
      setError,
      goToPage,
      startEdit,
      cancelEdit,
      finishEdit,
      deletePost,
      lastPage: Math.ceil(totalPosts / PER_PAGE)
   };
}
