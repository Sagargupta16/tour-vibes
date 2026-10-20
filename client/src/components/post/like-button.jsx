import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { hasLiked } from '@/components/feed/format';
import { api } from '@/lib/api';
import { duration, ease, spring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import useRequireAuth from './use-require-auth';

const SPARKS = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
const burstOut = { duration: duration.entrance, ease: ease.out };

// A ring and eight sparks fly out of the heart; remounted (by key) on every like
function HeartBurst() {
   return (
      <span aria-hidden className="pointer-events-none absolute inset-0">
         <motion.span
            className="absolute inset-0 rounded-full border-2 border-rose-500"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={burstOut}
         />
         {SPARKS.map((angle) => (
            <motion.span
               key={angle}
               className="absolute top-1/2 left-1/2 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-rose-500"
               initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
               animate={{ x: Math.cos(angle) * 20, y: Math.sin(angle) * 20, scale: 0, opacity: 0 }}
               transition={burstOut}
            />
         ))}
      </span>
   );
}

// Optimistic: flips at once, settles to the server's numbers, rolls back on error.
// Parents key it by user so a sign-in or sign-out re-reads who has liked.
export default function LikeButton({ postId, likes = [] }) {
   const { userId } = useAuth();
   const requireAuth = useRequireAuth();
   const [state, setState] = useState(() => ({
      liked: hasLiked(likes, userId),
      count: likes.length
   }));
   const [bursts, setBursts] = useState(0);
   const inFlight = useRef(false);

   const toggle = async () => {
      if (!requireAuth('Sign in to like journals')) return;
      // One request at a time; a second tap mid-flight would race the first
      if (inFlight.current) return;
      inFlight.current = true;
      const before = state;
      setState({
         liked: !before.liked,
         count: Math.max(0, before.count + (before.liked ? -1 : 1))
      });
      if (!before.liked) setBursts((n) => n + 1);
      try {
         const data = await api.put(`/feed/post/${postId}/like`);
         setState({ liked: data.liked, count: data.likesCount });
      } catch (err) {
         setState(before);
         toast.error(err.message || 'Could not update the like');
      } finally {
         inFlight.current = false;
      }
   };

   const { liked, count } = state;

   return (
      <motion.button
         type="button"
         onClick={toggle}
         aria-pressed={liked}
         aria-label={liked ? `Unlike, ${count} likes` : `Like, ${count} likes`}
         whileTap={{ scale: 0.94 }}
         className={cn(
            'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            liked
               ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
               : 'bg-background hover:bg-muted'
         )}
      >
         <span className="relative grid size-5 place-items-center">
            <motion.span
               key={bursts}
               initial={bursts ? { scale: 0.5 } : false}
               animate={{ scale: 1 }}
               transition={spring.bouncy}
               className="grid place-items-center"
            >
               <Heart
                  className={cn('size-5 transition-colors', liked && 'fill-rose-500 text-rose-500')}
               />
            </motion.span>
            {bursts > 0 && <HeartBurst key={bursts} />}
         </span>
         <motion.span
            key={count}
            initial={{ opacity: 0, y: liked ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, ease: ease.out }}
            className="min-w-[1ch] tabular-nums"
         >
            {count}
         </motion.span>
      </motion.button>
   );
}
