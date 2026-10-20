import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { fadeUp, reveal } from '@/lib/motion';
import { hasPin } from '@/components/map/map-utils';
import PostCard from '@/components/feed/post-card';
import PageTransition from '@/components/shared/page-transition';
import TravelerHeader from '@/components/traveler/traveler-header';
import TravelerStats from '@/components/traveler/traveler-stats';
import useTraveler, { statsOf } from '@/components/traveler/use-traveler';
import {
   TravelerEmpty,
   TravelerError,
   TravelerMissing,
   TravelerSkeleton
} from '@/components/traveler/traveler-states';

// Leaflet only downloads for a traveler who has pins
const TravelerMap = lazy(() => import('@/components/traveler/traveler-map'));

function SectionHeading({ eyebrow, title, aside }) {
   return (
      <div className="mb-4 flex items-end justify-between gap-4">
         <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-primary uppercase">
               {eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
               {title}
            </h2>
         </div>
         {aside}
      </div>
   );
}

// Public traveler page: who they are, what they have shared, and where
export default function Traveler() {
   const { userId } = useParams();
   const { userId: me } = useAuth();
   const traveler = useTraveler(userId);
   const { status, user, posts, total, hasMore, loadingMore } = traveler;
   const stats = useMemo(() => statsOf(posts), [posts]);
   const pinned = useMemo(() => posts.filter(hasPin), [posts]);

   if (status === 'loading') return <TravelerSkeleton />;
   if (status === 'missing') return <TravelerMissing />;
   if (status === 'error' || !user) return <TravelerError onRetry={traveler.retry} />;

   const isSelf = Boolean(me) && me === userId;
   const firstName = String(user.name || 'This traveler').split(' ')[0];

   return (
      <PageTransition>
         <title>{`${user.name} | Tour Vibes`}</title>
         <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
            <TravelerHeader user={user} isSelf={isSelf} />
            <TravelerStats
               journals={total}
               places={stats.places}
               likes={stats.likes}
               partial={hasMore}
               className="mt-8"
            />

            {pinned.length > 0 && (
               <motion.section {...reveal} variants={fadeUp} className="mt-12">
                  <SectionHeading
                     eyebrow="Map"
                     title={isSelf ? 'Where you have been' : `Where ${firstName} has been`}
                  />
                  <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl sm:h-96" />}>
                     <TravelerMap posts={pinned} />
                  </Suspense>
               </motion.section>
            )}

            <section className="mt-12">
               <SectionHeading
                  eyebrow="Journals"
                  title={isSelf ? 'Your journals' : `Journals by ${firstName}`}
                  aside={
                     total > 0 && (
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                           {posts.length} of {total}
                        </span>
                     )
                  }
               />
               {posts.length === 0 ? (
                  <TravelerEmpty isSelf={isSelf} name={firstName} />
               ) : (
                  // PostCard runs its own staggered entrance from `index`
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                     {posts.map((post, i) => (
                        <PostCard key={post._id} post={post} index={i % 10} />
                     ))}
                  </div>
               )}
               {hasMore && (
                  <div className="mt-10 flex justify-center">
                     <Button
                        variant="outline"
                        onClick={traveler.loadMore}
                        disabled={loadingMore}
                        className="h-11 gap-2 rounded-xl px-6 transition-[background-color,scale] active:scale-[0.96]"
                     >
                        {loadingMore && (
                           <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                        )}
                        {loadingMore ? 'Loading journals' : 'Show more journals'}
                     </Button>
                  </div>
               )}
            </section>
         </div>
      </PageTransition>
   );
}
