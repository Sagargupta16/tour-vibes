import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { duration, ease, fadeUp, stagger } from '@/lib/motion';
import { plural } from './format';

const summaryOf = ({ total, query, ready }) => {
   if (!ready) return 'Loading journals...';
   if (query.searchQuery) return `${plural(total, 'result')} for "${query.searchQuery}"`;
   if (query.tag) return `${plural(total, 'journal')} tagged #${query.tag}`;
   return `${plural(total, 'journal')} from travelers around the world`;
};

// `query` is the filter set the visible results belong to, so the count never
// describes a search that is still loading
export default function FeedHero({ total, query, ready, onNew }) {
   const summary = summaryOf({ total, query, ready });

   return (
      <motion.header
         variants={stagger(0.08)}
         initial="hidden"
         animate="show"
         className="flex flex-col gap-6 pt-8 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pt-14 sm:pb-8"
      >
         <div className="space-y-3">
            <motion.p variants={fadeUp} className="tv-eyebrow">
               <span className="text-primary">Travel journals</span>
            </motion.p>
            <motion.h1
               variants={fadeUp}
               className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl"
            >
               Stories from the road
            </motion.h1>
            <motion.p
               variants={fadeUp}
               aria-live="polite"
               className="relative h-6 overflow-hidden text-muted-foreground"
            >
               <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                     key={summary}
                     initial={{ opacity: 0, y: 12 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -12 }}
                     transition={{ duration: duration.base, ease: ease.out }}
                     className="block truncate tabular-nums"
                  >
                     {summary}
                  </motion.span>
               </AnimatePresence>
            </motion.p>
         </div>
         <motion.div variants={fadeUp}>
            <Button onClick={onNew} className="h-11 w-full rounded-full px-5 sm:w-auto">
               <Plus />
               New journal
            </Button>
         </motion.div>
      </motion.header>
   );
}
