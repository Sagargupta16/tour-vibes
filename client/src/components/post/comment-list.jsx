import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { duration, ease } from '@/lib/motion';
import CommentForm from './comment-form';
import CommentItem from './comment-item';
import SignInPrompt from './sign-in-prompt';

export default function CommentList({ postId }) {
   const { isAuth, userId } = useAuth();
   const [version, setVersion] = useState(0);
   const [state, setState] = useState({ key: null, comments: [], error: null });
   // Read the clock once per mount: Date.now() in render is impure
   const [now] = useState(Date.now);
   const requestKey = `${postId}#${version}`;

   useEffect(() => {
      const controller = new AbortController();
      const load = async () => {
         try {
            const data = await api.get(`/feed/post/${postId}/comments`, {
               signal: controller.signal
            });
            if (controller.signal.aborted) return;
            setState({ key: requestKey, comments: data.comments || [], error: null });
         } catch (err) {
            if (controller.signal.aborted || err.name === 'AbortError') return;
            setState({ key: requestKey, comments: [], error: err.message });
         }
      };
      void load();
      return () => controller.abort();
   }, [postId, requestKey]);

   const loading = state.key !== requestKey;
   const { comments, error } = state;

   const handleAdd = (comment) => {
      setState((prev) => ({ ...prev, comments: [comment, ...prev.comments] }));
   };

   // Errors are toasted by the row, which also restores itself
   const handleDelete = async (commentId) => {
      await api.delete(`/feed/comment/${commentId}`);
      setState((prev) => ({ ...prev, comments: prev.comments.filter((c) => c._id !== commentId) }));
      toast.success('Comment deleted');
   };

   return (
      <section aria-labelledby="comments-title" className="space-y-5">
         <h2
            id="comments-title"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
         >
            <span>Comments</span>
            <span className="relative inline-grid min-w-7 place-items-center overflow-hidden rounded-full bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground tabular-nums">
               <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                     key={comments.length}
                     initial={{ y: 10, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ y: -10, opacity: 0 }}
                     transition={{ duration: duration.base, ease: ease.out }}
                  >
                     {loading ? '-' : comments.length}
                  </motion.span>
               </AnimatePresence>
            </span>
         </h2>

         {isAuth ? (
            <CommentForm postId={postId} onCommentAdded={handleAdd} />
         ) : (
            <SignInPrompt
               title="Join the conversation"
               description="Sign in to leave a comment or ask about this trip."
            />
         )}

         {loading && (
            <div className="space-y-4" aria-label="Loading comments">
               {[0, 1].map((i) => (
                  <div key={i} className="flex gap-3">
                     <Skeleton className="size-8 shrink-0 rounded-full" />
                     <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3.5 w-4/5" />
                     </div>
                  </div>
               ))}
            </div>
         )}

         {!loading && error && (
            <div className="flex items-center justify-between gap-3 rounded-xl border p-4 text-sm">
               <span className="text-muted-foreground">Comments could not be loaded.</span>
               <button
                  type="button"
                  onClick={() => setVersion((v) => v + 1)}
                  className="h-11 rounded-full px-4 font-medium text-primary hover:bg-primary/10"
               >
                  Try again
               </button>
            </div>
         )}

         {!loading && !error && comments.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
               <MessageCircle className="size-6 opacity-60" />
               No comments yet. Start the conversation.
            </div>
         )}

         <ul className="relative space-y-1">
            <AnimatePresence mode="popLayout" initial={false}>
               {comments.map((c) => (
                  <CommentItem
                     key={c._id}
                     comment={c}
                     now={now}
                     canDelete={Boolean(userId) && c.author?._id === userId}
                     onDelete={handleDelete}
                  />
               ))}
            </AnimatePresence>
         </ul>
      </section>
   );
}
