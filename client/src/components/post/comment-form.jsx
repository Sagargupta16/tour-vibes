import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, SendHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { initialOf } from '@/components/feed/format';
import { useAuth } from '@/contexts/auth-context';
import { api, imageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

// Matches the server's 1-500 character rule
const MAX = 500;

export default function CommentForm({ postId, onCommentAdded }) {
   const { userName, avatar } = useAuth();
   const [text, setText] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const trimmed = text.trim();
   const left = MAX - text.length;

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!trimmed || submitting) return;
      setSubmitting(true);
      try {
         const data = await api.post(`/feed/post/${postId}/comments`, { text: trimmed });
         onCommentAdded(data.comment);
         setText('');
      } catch (err) {
         toast.error(err.message || 'Could not post the comment');
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
         <Avatar className="mt-2.5 hidden sm:flex">
            {avatar && <AvatarImage src={imageUrl(avatar)} alt="" />}
            <AvatarFallback className="text-xs">{initialOf(userName)}</AvatarFallback>
         </Avatar>
         <div className="flex-1 space-y-1.5">
            <div className="relative">
               <Textarea
                  aria-label="Write a comment"
                  placeholder="Share a tip or ask about the trip"
                  rows={1}
                  maxLength={MAX}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                     // Enter posts, Shift+Enter breaks the line
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                     }
                  }}
                  className="min-h-[3.25rem] resize-none rounded-xl py-3.5 pr-14"
               />
               <button
                  type="submit"
                  aria-label="Post comment"
                  disabled={!trimmed || submitting}
                  className="absolute right-1 bottom-1 grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground transition-[opacity,scale] active:scale-[0.96] disabled:opacity-40"
               >
                  {submitting ? (
                     <Loader2 className="size-4 animate-spin" />
                  ) : (
                     <SendHorizontal className="size-4" />
                  )}
               </button>
            </div>
            <p
               className={cn(
                  'text-right text-xs text-muted-foreground tabular-nums transition-opacity',
                  left > 60 && 'opacity-0'
               )}
               aria-live="polite"
            >
               {left} characters left
            </p>
         </div>
      </form>
   );
}
