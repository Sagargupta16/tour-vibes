import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CloudOff, NotebookPen, Plus, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import useFeed from '@/hooks/use-feed';
import JournalStats from '@/components/feed/journal-stats';
import Pagination from '@/components/feed/pagination';
import PostForm from '@/components/feed/post-form';
import PostGrid from '@/components/feed/post-grid';
import ConfirmDialog from '@/components/post/confirm-dialog';
import EmptyState from '@/components/shared/empty-state';
import PageTransition from '@/components/shared/page-transition';
import { fadeUp, stagger } from '@/lib/motion';

const pill = 'h-11 rounded-full px-5';

export default function MyJournals() {
   const { userId, userName } = useAuth();
   // Each dialog keeps its post while closing, so the exit animation never shows
   // the other mode's title or an empty description
   const [form, setForm] = useState({ open: false, post: null });
   const [removal, setRemoval] = useState({ open: false, post: null });
   const gridRef = useRef(null);

   const feed = useFeed({ userId });
   const { posts, loading, error, page, lastPage, totalPosts } = feed;
   const firstName = userName?.trim().split(/\s+/)[0];

   const openNew = () => setForm({ open: true, post: null });
   const openEdit = (post) => setForm({ open: true, post });
   const askDelete = (postId) => {
      const post = posts.find((p) => p._id === postId);
      if (post) setRemoval({ open: true, post });
   };

   const handleSubmit = async (formData) => {
      if (form.post) await feed.updatePost(form.post._id, formData);
      else await feed.createPost(formData);
   };

   const confirmDelete = async () => {
      await feed.deletePost(removal.post._id);
      toast.success('Journal deleted');
   };

   const changePage = (next) => {
      feed.goToPage(next);
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   };

   return (
      <PageTransition>
         <div className="tv-container pb-16">
            <motion.header
               variants={stagger(0.08)}
               initial="hidden"
               animate="show"
               className="flex flex-col gap-6 pt-8 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pt-14 sm:pb-8"
            >
               <div className="space-y-3">
                  <motion.p variants={fadeUp} className="tv-eyebrow">
                     <span className="text-primary">Your travels</span>
                  </motion.p>
                  <motion.h1
                     variants={fadeUp}
                     className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl"
                  >
                     {firstName ? `${firstName}'s journals` : 'My journals'}
                  </motion.h1>
                  <motion.p variants={fadeUp} className="text-muted-foreground">
                     Every trip you have written up, in one place.
                  </motion.p>
               </div>
               <motion.div variants={fadeUp}>
                  <Button onClick={openNew} className={`${pill} w-full sm:w-auto`}>
                     <Plus />
                     New journal
                  </Button>
               </motion.div>
            </motion.header>

            <JournalStats
               userId={userId}
               posts={posts}
               totalPosts={totalPosts}
               lastPage={lastPage}
            />

            <section ref={gridRef} aria-label="Your journals" className="scroll-mt-20 pt-8">
               {!loading && error && posts.length === 0 && (
                  <EmptyState
                     icon={CloudOff}
                     title="Your journals could not be loaded"
                     description={error}
                     action={
                        <Button variant="outline" className={pill} onClick={feed.reload}>
                           <RotateCw />
                           Try again
                        </Button>
                     }
                  />
               )}
               {!loading && !error && posts.length === 0 && (
                  <EmptyState
                     icon={NotebookPen}
                     title="No journals yet"
                     description="Write up your first trip: a photo, a few lines and the place."
                     action={
                        <Button className={pill} onClick={openNew}>
                           <Plus />
                           Write your first journal
                        </Button>
                     }
                  />
               )}
               {(loading || posts.length > 0) && (
                  <PostGrid
                     posts={posts}
                     loading={loading}
                     skeletons={3}
                     editable
                     onEdit={openEdit}
                     onDelete={askDelete}
                  />
               )}
               <Pagination page={page} lastPage={lastPage} onPageChange={changePage} />
            </section>

            <PostForm
               open={form.open}
               onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
               editPost={form.post}
               onSubmit={handleSubmit}
            />
            <ConfirmDialog
               open={removal.open}
               onOpenChange={(open) => setRemoval((r) => ({ ...r, open }))}
               title="Delete this journal?"
               description={
                  removal.post &&
                  `"${removal.post.title}" and its comments will be removed for good.`
               }
               onConfirm={confirmDelete}
            />
         </div>
      </PageTransition>
   );
}
