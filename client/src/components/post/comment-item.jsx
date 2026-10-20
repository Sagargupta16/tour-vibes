import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initialOf, timeAgo, travelerHref } from '@/components/feed/format';
import { imageUrl } from '@/lib/api';
import { duration, ease, spring } from '@/lib/motion';

// `ref` comes from AnimatePresence popLayout so the row can leave without a jump
export default function CommentItem({ comment, now, canDelete, onDelete, ref }) {
   const [deleting, setDeleting] = useState(false);
   const author = comment.author;
   const href = travelerHref(author);

   const remove = async () => {
      setDeleting(true);
      try {
         await onDelete(comment._id);
      } catch (err) {
         toast.error(err.message || 'Could not delete the comment');
         setDeleting(false);
      }
   };

   const avatar = (
      <Avatar>
         {author?.avatar && <AvatarImage src={imageUrl(author.avatar)} alt="" />}
         <AvatarFallback className="text-xs">{initialOf(author?.name)}</AvatarFallback>
      </Avatar>
   );
   const name = author?.name || 'Traveler';

   return (
      <motion.li
         ref={ref}
         layout
         initial={{ opacity: 0, y: -10, scale: 0.98 }}
         animate={{ opacity: deleting ? 0.5 : 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, x: -24, transition: { duration: duration.base, ease: ease.out } }}
         transition={spring.soft}
         className="-mx-3 flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
      >
         {href ? (
            <Link to={href} aria-label={name} className="shrink-0">
               {avatar}
            </Link>
         ) : (
            <span className="shrink-0">{avatar}</span>
         )}
         <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
               {href ? (
                  <Link to={href} className="text-sm font-medium hover:underline">
                     {name}
                  </Link>
               ) : (
                  <span className="text-sm font-medium">{name}</span>
               )}
               <time dateTime={comment.createdAt} className="text-xs text-muted-foreground">
                  {timeAgo(comment.createdAt, now)}
               </time>
            </div>
            <p className="mt-0.5 text-sm leading-relaxed break-words whitespace-pre-line">
               {comment.text}
            </p>
         </div>
         {canDelete && (
            <button
               type="button"
               aria-label="Delete comment"
               disabled={deleting}
               onClick={remove}
               className="-my-1.5 -mr-1.5 grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            >
               {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
               ) : (
                  <Trash2 className="size-4" />
               )}
            </button>
         )}
      </motion.li>
   );
}
