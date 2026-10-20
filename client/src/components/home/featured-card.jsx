import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { imageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';

// Mobile: a snap carousel slide. md and up: a bento cell, the first one big.
const cellClass = (big) =>
   cn('w-[80%] shrink-0 snap-start sm:w-[46%] md:w-auto', big && 'md:col-span-2 md:row-span-2');

export function FeaturedCardSkeleton({ big }) {
   return (
      <li className={cellClass(big)}>
         <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
            <Skeleton
               className={cn('aspect-[4/3] w-full rounded-none', big && 'md:aspect-auto md:flex-1')}
            />
            <div className="space-y-2 p-4">
               <Skeleton className="h-3 w-1/3" />
               <Skeleton className="h-5 w-3/4" />
               <Skeleton className="h-3 w-1/2" />
            </div>
         </div>
      </li>
   );
}

export default function FeaturedCard({ post, big }) {
   const img = imageUrl(post.imageUrl);
   const place = [post.location?.name, post.location?.country].filter(Boolean).join(', ');
   const likes = post.likes?.length ?? 0;

   return (
      <motion.li variants={fadeUp} className={cellClass(big)}>
         <Link
            to={`/journals/${post._id}`}
            className="group tv-card-interactive flex h-full flex-col overflow-hidden rounded-xl border bg-card"
         >
            <div
               className={cn(
                  'relative aspect-[4/3] overflow-hidden bg-muted',
                  big && 'md:aspect-auto md:min-h-72 md:flex-1'
               )}
            >
               {img ? (
                  <img
                     src={img}
                     alt=""
                     loading="lazy"
                     className="tv-img-outline absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
               ) : (
                  <div className="tv-dot-grid absolute inset-0 grid place-items-center text-primary">
                     <MapPin className="size-8" />
                  </div>
               )}
               <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-semibold tabular-nums">
                  <Heart className="size-3.5 fill-current text-rose-500" />
                  {likes}
               </span>
               {big && (
                  <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                     Most loved
                  </span>
               )}
            </div>
            <div className={cn('flex flex-col gap-1.5 p-4', !big && 'flex-1', big && 'sm:p-5')}>
               {place && (
                  <p className="tv-eyebrow flex items-center gap-1 truncate text-primary">
                     <MapPin className="size-3 shrink-0" />
                     <span className="truncate">{place}</span>
                  </p>
               )}
               <h3
                  className={cn(
                     'font-display leading-snug font-semibold tracking-tight',
                     big ? 'text-xl sm:text-2xl' : 'line-clamp-2 text-base'
                  )}
               >
                  {post.title}
               </h3>
               {big && post.content && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
               )}
               <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                  <span className="truncate">by {post.creator?.name || 'a traveler'}</span>
                  <ArrowUpRight className="size-4 shrink-0 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
               </div>
            </div>
         </Link>
      </motion.li>
   );
}
