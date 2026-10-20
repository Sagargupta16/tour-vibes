import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Heart, MapPin } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { imageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { reveal, spring } from '@/lib/motion';
import SectionHeading from './section-heading';

// Pin spots on the illustrated map (percent of the panel), kept away from the
// edges so the popup card always fits on a phone
const SPOTS = [
   { x: 31, y: 36 },
   { x: 48, y: 24 },
   { x: 60, y: 56 },
   { x: 71, y: 30 },
   { x: 42, y: 68 },
   { x: 76, y: 66 }
];

function MapPaper() {
   return (
      <svg
         viewBox="0 0 800 400"
         preserveAspectRatio="xMidYMid slice"
         className="absolute inset-0 size-full"
         aria-hidden="true"
      >
         <rect width="800" height="400" fill="var(--muted)" />
         <path
            d="M0 0H800V400H300C250 350 210 365 170 320S95 245 0 255Z"
            fill="var(--background)"
         />
         <path
            d="M0 255C95 245 130 290 170 320S250 350 300 400"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
         />
         <path
            d="M540 0C520 80 600 120 560 200S470 300 520 400"
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.18"
            strokeWidth="9"
            strokeLinecap="round"
         />
         <g fill="none" stroke="var(--border)" strokeLinecap="round">
            <path d="M120 60C260 90 360 40 520 110S720 150 820 120" strokeWidth="10" />
            <path d="M260 0C280 120 330 200 430 260S560 380 600 410" strokeWidth="7" />
            <path d="M380 140C470 170 620 230 820 250" strokeWidth="6" />
         </g>
         <g fill="var(--foreground)" fillOpacity="0.045">
            <rect x="620" y="40" width="110" height="70" rx="18" />
            <rect x="300" y="180" width="90" height="60" rx="16" />
         </g>
      </svg>
   );
}

function Popup({ post, below }) {
   const img = imageUrl(post.imageUrl);
   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.9, y: below ? -6 : 6 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
         transition={spring.snappy}
         className={cn(
            'absolute left-1/2 z-10 w-48 -translate-x-1/2 rounded-xl border bg-popover p-2 shadow-[0_16px_32px_-18px_rgb(0_0_0/0.5)] sm:w-56',
            below ? 'top-3' : 'bottom-10'
         )}
      >
         {img && (
            <img
               src={img}
               alt=""
               loading="lazy"
               className="tv-img-outline h-20 w-full rounded-lg object-cover sm:h-24"
            />
         )}
         <p className="mt-2 truncate px-1 text-sm font-semibold">{post.title}</p>
         <div className="flex items-center justify-between gap-2 px-1 pb-0.5 text-[11px] text-muted-foreground">
            <span className="truncate font-mono uppercase">
               {post.location?.name || 'Somewhere new'}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
               <Heart className="size-3 fill-current text-rose-500" />
               {post.likes?.length ?? 0}
            </span>
         </div>
      </motion.div>
   );
}

// Place names from the featured journals, scrolling past under the map
function PlaceMarquee({ posts }) {
   const places = [...new Set(posts.map((p) => p.location?.name).filter(Boolean))];
   if (places.length < 3) return null;
   const row = [...places, ...places];
   return (
      <div className="relative overflow-hidden border-t py-3 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
         <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {row.map((place, i) => (
               <span
                  key={`${place}-${i}`}
                  aria-hidden={i >= places.length}
                  className="tv-eyebrow flex items-center gap-2 pr-8 whitespace-nowrap"
               >
                  <MapPin className="size-3 text-primary" />
                  {place}
               </span>
            ))}
         </div>
      </div>
   );
}

export default function MapTeaser({ posts }) {
   const pinned = posts.filter((p) => p.location?.name).slice(0, SPOTS.length);
   const [active, setActive] = useState(0);
   const count = pinned.length;

   // Walk the popup from pin to pin like someone exploring the map
   useEffect(() => {
      if (count < 2) return undefined;
      const id = setInterval(() => setActive((i) => (i + 1) % count), 3200);
      return () => clearInterval(id);
   }, [count]);

   const current = count ? active % count : -1;

   return (
      <section className="tv-container py-16 sm:py-24">
         <SectionHeading
            index="03"
            eyebrow="The journal map"
            title="Wander the world one pin at a time"
            description="Every journal with a place lands on an OpenStreetMap map. Pan anywhere and only the pins in view load."
         />

         <motion.div
            {...reveal}
            variants={{
               hidden: { opacity: 0, y: 24 },
               show: { opacity: 1, y: 0, transition: spring.soft }
            }}
            className="mt-10 overflow-hidden rounded-2xl border bg-card"
         >
            <Link
               to="/map"
               aria-label="Open the journal map"
               className="group relative block aspect-[4/3] sm:aspect-[21/9]"
            >
               <MapPaper />
               {SPOTS.slice(0, Math.max(count, 4)).map((spot, i) => (
                  <div
                     key={`${spot.x}-${spot.y}`}
                     className="absolute"
                     style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  >
                     <motion.svg
                        viewBox="0 0 24 30"
                        variants={{
                           hidden: { y: -40, opacity: 0 },
                           show: {
                              y: 0,
                              opacity: 1,
                              transition: { ...spring.bouncy, delay: 0.25 + i * 0.1 }
                           }
                        }}
                        className={cn(
                           'absolute -top-8 -left-3 h-8 w-6 origin-bottom drop-shadow-[0_3px_3px_rgb(0_0_0/0.25)] transition-[color,scale] duration-300',
                           i === current ? 'scale-125 text-primary' : 'text-primary/60'
                        )}
                     >
                        <path
                           d="M12 29C8.5 23 2 17.5 2 11a10 10 0 0 1 20 0c0 6.5-6.5 12-10 18Z"
                           fill="currentColor"
                           stroke="var(--background)"
                           strokeWidth="1.5"
                        />
                        <circle cx="12" cy="11" r="3.6" fill="var(--background)" />
                     </motion.svg>
                     <AnimatePresence>
                        {i === current && (
                           <Popup key={pinned[i]._id} post={pinned[i]} below={spot.y < 50} />
                        )}
                     </AnimatePresence>
                  </div>
               ))}
               {/* Looks like a button; the whole panel is the link */}
               <span
                  className={cn(buttonVariants({ size: 'lg' }), 'absolute right-4 bottom-4 z-20')}
               >
                  Open the map
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
               </span>
            </Link>
            <PlaceMarquee posts={posts} />
         </motion.div>
      </section>
   );
}
