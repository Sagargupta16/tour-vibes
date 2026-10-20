import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { reveal, stagger } from '@/lib/motion';
import SectionHeading from './section-heading';
import FeaturedCard, { FeaturedCardSkeleton } from './featured-card';

const SKELETONS = [0, 1, 2, 3, 4];

// The five most-liked journals. Hidden entirely if the request fails or the
// feed is empty, so the landing page never shows a broken strip.
export default function FeaturedJournals({ posts, status }) {
   const withPhotos = posts.filter((post) => post.imageUrl);
   const items = (withPhotos.length >= 3 ? withPhotos : posts).slice(0, 5);
   if (status === 'error' || (status === 'ready' && items.length === 0)) return null;

   const loading = status === 'loading';
   const bento = loading || items.length === 5;

   return (
      <section className="tv-container py-16 sm:py-24">
         <SectionHeading
            index="01"
            eyebrow="Most loved"
            title="Journals travelers keep coming back to"
            description="The stories with the most likes so far. Tap one to read the whole trip."
            action={
               <Button variant="outline" asChild>
                  <Link to="/journals?sort=popular">
                     See all journals
                     <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />
                  </Link>
               </Button>
            }
         />

         <motion.ul
            {...reveal}
            variants={stagger(0.08, 0.1)}
            aria-busy={loading}
            className={cn(
               'tv-no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 md:pb-0',
               bento ? 'md:grid-cols-4 md:grid-rows-2' : 'md:grid-cols-3'
            )}
         >
            {loading
               ? SKELETONS.map((i) => <FeaturedCardSkeleton key={i} big={i === 0} />)
               : items.map((post, i) => (
                    <FeaturedCard key={post._id} post={post} big={bento && i === 0} />
                 ))}
         </motion.ul>
      </section>
   );
}
