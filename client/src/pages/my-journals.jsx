import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import useFeed from '@/hooks/use-feed';
import PostCard from '@/components/feed/post-card';
import PostForm from '@/components/feed/post-form';
import Pagination from '@/components/feed/pagination';
import SkeletonCard from '@/components/shared/skeleton-card';
import EmptyState from '@/components/shared/empty-state';
import PageTransition from '@/components/shared/page-transition';

export default function MyJournals() {
   const { userId } = useAuth();
   const [formOpen, setFormOpen] = useState(false);
   const [editPost, setEditPost] = useState(null);

   const { posts, loading, page, lastPage, goToPage, createPost, updatePost, deletePost } = useFeed(
      { userId }
   );

   const handleEdit = (post) => {
      setEditPost(post);
      setFormOpen(true);
   };

   const handleDelete = async (postId) => {
      try {
         await deletePost(postId);
         toast.success('Post deleted');
      } catch (err) {
         toast.error(err.message);
      }
   };

   const handleSubmit = async (formData) => {
      if (editPost) {
         await updatePost(editPost._id, formData);
      } else {
         await createPost(formData);
      }
   };

   const openNew = () => {
      setEditPost(null);
      setFormOpen(true);
   };

   return (
      <PageTransition>
         <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
               <h1 className="text-2xl font-bold">My Journals</h1>
               <Button onClick={openNew}>
                  <Plus className="mr-1 h-4 w-4" />
                  New Journal
               </Button>
            </div>

            {loading ? (
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                     <SkeletonCard key={i} />
                  ))}
               </div>
            ) : posts.length === 0 ? (
               <EmptyState
                  title="No journals yet"
                  description="Create your first travel journal!"
               />
            ) : (
               <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                     {posts.map((post) => (
                        <PostCard
                           key={post._id}
                           post={post}
                           editable
                           onEdit={handleEdit}
                           onDelete={handleDelete}
                        />
                     ))}
                  </div>
                  <Pagination page={page} lastPage={lastPage} onPageChange={goToPage} />
               </>
            )}

            <PostForm
               open={formOpen}
               onOpenChange={(v) => {
                  setFormOpen(v);
                  if (!v) setEditPost(null);
               }}
               editPost={editPost}
               onSubmit={handleSubmit}
            />
         </div>
      </PageTransition>
   );
}
