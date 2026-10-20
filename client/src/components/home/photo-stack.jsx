import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin } from 'lucide-react';
import { imageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';

// Pose by depth in the stack: the top card sits nearly straight, the ones
// behind fan out to either side
const POSES = [
   { rotate: -3, x: 0, y: 0, scale: 1 },
   { rotate: 6, x: 22, y: 10, scale: 0.94 },
   { rotate: -10, x: -20, y: 18, scale: 0.88 },
   { rotate: 12, x: 34, y: 24, scale: 0.84 }
];

function StackCard({ post, depth, count }) {
   const pose = POSES[depth];
   const toBack = depth === count - 1 && count > 1;

   return (
      <motion.div
         initial={false}
         // The card that leaves the top swings out to the left before tucking in behind
         animate={
            toBack
               ? {
                    ...pose,
                    x: [null, -90, pose.x],
                    rotate: [null, -22, pose.rotate],
                    transition: { duration: 0.75, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] }
                 }
               : { ...pose, transition: spring.soft }
         }
         style={{ zIndex: count - depth }}
         className="absolute inset-0"
      >
         <Link
            to={`/journals/${post._id}`}
            tabIndex={depth === 0 ? 0 : -1}
            aria-hidden={depth !== 0}
            className="flex h-full flex-col gap-2 rounded-2xl border bg-card p-2 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_18px_40px_-24px_rgb(0_0_0/0.55)]"
         >
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-muted">
               <img
                  src={imageUrl(post.imageUrl)}
                  alt={post.title}
                  loading={depth === 0 ? 'eager' : 'lazy'}
                  draggable="false"
                  className="tv-img-outline size-full rounded-xl object-cover"
               />
               <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                  <Heart className="size-3 fill-current text-rose-500" />
                  {post.likes?.length ?? 0}
               </span>
            </div>
            <div className="px-1 pb-1">
               <p className="truncate text-sm font-semibold tracking-tight">{post.title}</p>
               {post.location?.name && (
                  <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                     <MapPin className="size-3 shrink-0 text-primary" />
                     {post.location.name}
                  </p>
               )}
            </div>
         </Link>
      </motion.div>
   );
}

// A fanned stack of journal photos; `activeId` decides which card is on top and
// changing it shuffles the deck
export default function PhotoStack({ posts, activeId, className }) {
   const items = posts.slice(0, POSES.length);
   const top = Math.max(
      0,
      items.findIndex((post) => post._id === activeId)
   );
   const ordered = items.map((post, i) => ({
      post,
      depth: (i - top + items.length) % items.length
   }));

   return (
      <motion.div
         initial={{ opacity: 0, y: 40, rotate: 8 }}
         animate={{ opacity: 1, y: 0, rotate: 0 }}
         transition={{ ...spring.soft, delay: 0.5 }}
         className={cn('relative aspect-[4/5]', className)}
      >
         {ordered.map(({ post, depth }) => (
            <StackCard key={post._id} post={post} depth={depth} count={items.length} />
         ))}
      </motion.div>
   );
}
