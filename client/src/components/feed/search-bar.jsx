import { useEffect, useEffectEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { duration, ease } from '@/lib/motion';

const pop = {
   initial: { opacity: 0, scale: 0.6 },
   animate: { opacity: 1, scale: 1 },
   exit: { opacity: 0, scale: 0.6 },
   transition: { duration: duration.micro, ease: ease.out }
};

// `value` is the committed query (the URL); the box keeps its own text and commits
// it debounced, so typing never waits on the router
export default function SearchBar({ value, onSearch, busy }) {
   const [text, setText] = useState(value);
   const [synced, setSynced] = useState(value);
   const debounced = useDebounce(text);

   // The query changed from outside (back button, a tag link, Clear filters): show it.
   // Our own debounced commit matches `debounced`, so it never overwrites fresh typing.
   if (value !== synced) {
      setSynced(value);
      if (value !== debounced.trim()) setText(value);
   }

   const commit = useEffectEvent((next) => {
      if (next !== value) onSearch(next);
   });

   useEffect(() => {
      commit(debounced.trim());
   }, [debounced]);

   const clear = () => {
      setText('');
      if (value) onSearch('');
   };

   return (
      <div className="relative">
         <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">
            {busy && value ? (
               <Loader2 className="size-4 animate-spin" />
            ) : (
               <Search className="size-4" />
            )}
         </span>
         <Input
            type="search"
            aria-label="Search journals"
            placeholder="Search places, stories, tags"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === 'Escape' && text) {
                  e.preventDefault();
                  clear();
               }
            }}
            enterKeyHint="search"
            className="h-11 rounded-xl pr-11 pl-10 text-base sm:h-10 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
         />
         <AnimatePresence>
            {text && (
               <motion.button
                  key="clear"
                  type="button"
                  aria-label="Clear search"
                  onClick={clear}
                  {...pop}
                  className="absolute top-0 right-0 grid size-11 place-items-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:size-10"
               >
                  <X className="size-4" />
               </motion.button>
            )}
         </AnimatePresence>
      </div>
   );
}
