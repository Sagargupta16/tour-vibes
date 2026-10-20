import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Expand, MapPin } from 'lucide-react';
import { placeOf } from '@/components/feed/format';
import { imageUrl } from '@/lib/api';
import { duration, ease, fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/utils';

const settle = { duration: duration.entrance * 2, ease: ease.out };

// Full-bleed photo with the title over a dark scrim; tapping the photo opens the
// lightbox. Without a usable photo it falls back to a plain title block.
export default function PostHero({ post, back, onOpenPhoto }) {
   const [failed, setFailed] = useState(false);
   const src = imageUrl(post.imageUrl);
   const hasPhoto = Boolean(src) && !failed;
   const place = placeOf(post.location);

   return (
      <section
         className={cn(
            'relative isolate overflow-hidden',
            hasPhoto ? 'h-[62svh] max-h-[42rem] min-h-[22rem] bg-black' : 'border-b bg-muted/40'
         )}
      >
         {hasPhoto && (
            <>
               <motion.button
                  type="button"
                  onClick={onOpenPhoto}
                  aria-label="View the full photo"
                  initial={{ scale: 1.08, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={settle}
                  className="group absolute inset-0 block cursor-zoom-in focus-visible:outline-none"
               >
                  <img
                     src={src}
                     alt={post.title}
                     fetchPriority="high"
                     onError={() => setFailed(true)}
                     className="size-full object-cover"
                  />
                  <span className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full bg-black/50 text-white transition-[background-color,scale] group-hover:scale-105 group-hover:bg-black/70 group-focus-visible:ring-2 group-focus-visible:ring-white">
                     <Expand className="size-4" />
                  </span>
               </motion.button>
               <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />
            </>
         )}

         <div
            className={cn(
               'pointer-events-none relative mx-auto flex h-full max-w-5xl flex-col px-4 pt-4',
               hasPhoto ? 'pb-16' : 'pb-10'
            )}
         >
            <Link
               to={back.to}
               className={cn(
                  'pointer-events-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  hasPhoto
                     ? 'bg-black/50 text-white hover:bg-black/70'
                     : 'border bg-background hover:bg-muted'
               )}
            >
               <ArrowLeft className="size-4" />
               {back.label}
            </Link>

            <motion.div
               variants={stagger(0.08, 0.15)}
               initial="hidden"
               animate="show"
               className={cn('mt-auto max-w-3xl space-y-3', hasPhoto ? 'text-white' : 'pt-12')}
            >
               {place && (
                  <motion.p
                     variants={fadeUp}
                     className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                        hasPhoto ? 'bg-black/50' : 'bg-primary/10 text-primary'
                     )}
                  >
                     <MapPin className="size-4" />
                     {place}
                  </motion.p>
               )}
               <motion.h1
                  variants={fadeUp}
                  className="text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl"
               >
                  {post.title}
               </motion.h1>
            </motion.div>
         </div>
      </section>
   );
}
