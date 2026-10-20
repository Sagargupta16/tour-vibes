import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

// One scrollable row of chips; the filled pill slides between chips (shared layoutId)
export default function TagFilter({ activeTag, onTagChange }) {
   const [tags, setTags] = useState([]);
   const rowRef = useRef(null);
   const pillId = useId();

   useEffect(() => {
      const controller = new AbortController();
      const load = async () => {
         try {
            const data = await api.get('/feed/tags', { signal: controller.signal });
            if (!controller.signal.aborted) setTags((data.tags || []).filter(Boolean));
         } catch {
            // Chips are optional; the feed still works without them
         }
      };
      void load();
      return () => controller.abort();
   }, []);

   // Keep the active chip in view, e.g. after landing from a tag link on a card
   useEffect(() => {
      const row = rowRef.current;
      const chip = row?.querySelector('[aria-pressed="true"]');
      if (!chip) return;
      const left = chip.offsetLeft - (row.clientWidth - chip.clientWidth) / 2;
      row.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
   }, [activeTag, tags]);

   // A tag from a link may not be in the list yet (or ever, if it was just removed)
   const chips = activeTag && !tags.includes(activeTag) ? [activeTag, ...tags] : tags;
   if (chips.length === 0) return null;

   return (
      <fieldset
         ref={rowRef}
         aria-label="Filter by tag"
         className="relative -mx-4 flex min-w-0 gap-2 tv-no-scrollbar overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
         {['', ...chips].map((tag) => {
            const active = tag === activeTag;
            return (
               <motion.button
                  key={tag || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onTagChange(active ? '' : tag)}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                     'relative inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:h-9',
                     active
                        ? 'border-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:border-foreground/25 hover:text-foreground'
                  )}
               >
                  {active && (
                     <motion.span
                        layoutId={pillId}
                        transition={spring.snappy}
                        className="absolute inset-0 rounded-full bg-primary"
                     />
                  )}
                  <span className="relative">{tag ? `#${tag}` : 'All'}</span>
               </motion.button>
            );
         })}
      </fieldset>
   );
}
