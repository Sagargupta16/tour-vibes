import { AnimatePresence } from 'framer-motion';
import SkeletonCard from '@/components/shared/skeleton-card';
import { cn } from '@/lib/utils';
import PostCard from './post-card';

const GRID = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3';

// Skeletons only on a cold load; after that the old cards stay (dimmed) until the
// new ones arrive, so a filter change animates card to card instead of blinking
export default function PostGrid({ posts, loading, skeletons = 6, editable, onEdit, onDelete }) {
   if (loading && posts.length === 0) {
      return (
         <div className={GRID} aria-busy="true" aria-label="Loading journals">
            {Array.from({ length: skeletons }, (_, i) => (
               <SkeletonCard key={i} />
            ))}
         </div>
      );
   }

   return (
      <div
         className={cn(
            GRID,
            'relative transition-opacity duration-300',
            loading && 'pointer-events-none opacity-60'
         )}
         aria-busy={loading}
      >
         <AnimatePresence mode="popLayout">
            {posts.map((post, i) => (
               <PostCard
                  key={post._id}
                  index={i}
                  post={post}
                  editable={editable}
                  onEdit={onEdit}
                  onDelete={onDelete}
               />
            ))}
         </AnimatePresence>
      </div>
   );
}
