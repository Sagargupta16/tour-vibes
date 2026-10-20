import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Compass, MapPin, Maximize } from 'lucide-react';
import { imageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { duration, ease } from '@/lib/motion';
import { placeOf, shortDate } from './map-utils';

// Enough to scan; past this the user zooms in rather than scrolls
const LIST_LIMIT = 60;

function JournalRow({ post, index, active, onSelect }) {
   const place = placeOf(post.location);
   return (
      <motion.li
         data-journal={post._id}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: duration.base, ease: ease.out, delay: Math.min(index, 10) * 0.03 }}
         className="w-[17rem] shrink-0 snap-start lg:w-auto"
      >
         <div
            className={cn(
               'group relative flex items-center gap-3 rounded-xl border bg-card p-2.5 transition-[border-color,background-color] duration-200',
               active ? 'border-primary bg-primary/5' : 'hover:border-foreground/20'
            )}
         >
            {/* The whole card flies the map; the arrow opens the journal */}
            <button
               type="button"
               onClick={() => onSelect(post)}
               aria-pressed={active}
               className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-primary/30"
            >
               <span className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
                  {post.imageUrl && (
                     <img
                        src={imageUrl(post.imageUrl)}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                     />
                  )}
               </span>
               <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm leading-snug font-semibold">
                     {post.title}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                     <MapPin
                        className={cn('size-3 shrink-0', active && 'text-primary')}
                        aria-hidden="true"
                     />
                     <span className="truncate">{place || 'Pinned on the map'}</span>
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground tabular-nums">
                     {shortDate(post.createdAt)}
                  </span>
               </span>
            </button>
            <Link
               to={`/journals/${post._id}`}
               aria-label={`Open ${post.title}`}
               className="relative z-10 grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
               <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
         </div>
      </motion.li>
   );
}

function EmptyView({ onFitAll, ready }) {
   return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-dashed bg-card/50 p-4 lg:flex-col lg:py-10 lg:text-center">
         <Compass className="size-6 shrink-0 text-muted-foreground lg:size-8" aria-hidden="true" />
         <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
               {ready ? 'No journals in this view' : 'Loading journals'}
            </p>
            <p className="text-xs text-muted-foreground">
               {ready ? 'Zoom out or show every pin.' : 'Pins appear as they arrive.'}
            </p>
         </div>
         {ready && (
            <button
               type="button"
               onClick={onFitAll}
               className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium transition-[background-color,scale] hover:bg-muted active:scale-[0.96]"
            >
               <Maximize className="size-3.5" aria-hidden="true" />
               Show all
            </button>
         )}
      </div>
   );
}

// Journals in view. Phones: a horizontal snap rail under the map. Desktop: a
// scrolling column beside it. Picking a pin scrolls its card into view.
export default function MapJournalList({ posts, ready, selectedId, onSelect, onFitAll }) {
   const shown = posts.slice(0, LIST_LIMIT);

   useEffect(() => {
      if (!selectedId) return;
      const el = document.querySelector(`[data-journal="${CSS.escape(selectedId)}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
   }, [selectedId]);

   if (!shown.length) {
      return (
         <div className="flex p-3 lg:px-4">
            <EmptyView onFitAll={onFitAll} ready={ready} />
         </div>
      );
   }

   return (
      <div className="min-h-0 flex-1">
         <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain p-3 [scrollbar-width:none] lg:h-full lg:snap-none lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:px-4 lg:pt-1 lg:pb-6 lg:[scrollbar-width:thin]">
            {shown.map((post, i) => (
               <JournalRow
                  key={post._id}
                  post={post}
                  index={i}
                  active={post._id === selectedId}
                  onSelect={onSelect}
               />
            ))}
            {posts.length > LIST_LIMIT && (
               <li className="flex w-40 shrink-0 items-center px-2 text-xs text-muted-foreground lg:w-auto lg:py-2">
                  Showing {LIST_LIMIT} of {posts.length}. Zoom in to narrow it down.
               </li>
            )}
         </ul>
      </div>
   );
}
