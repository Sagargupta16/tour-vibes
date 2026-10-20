import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, LoaderCircle, MapPin } from 'lucide-react';
import { spring } from '@/lib/motion';

function Status({ ready, error, count, truncated }) {
   if (error) return <span>Could not load pins</span>;
   if (!ready) return <span className="text-muted-foreground">Finding journals</span>;
   const value = `${count}${truncated ? '+' : ''}`;
   return (
      <>
         {/* The number rolls up to its new value on every refetch */}
         <span className="relative inline-flex overflow-hidden font-mono font-semibold tabular-nums">
            <AnimatePresence mode="popLayout" initial={false}>
               <motion.span
                  key={value}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={spring.snappy}
               >
                  {value}
               </motion.span>
            </AnimatePresence>
         </span>
         <span className="text-muted-foreground">
            {count === 1 ? 'journal' : 'journals'} in view
         </span>
      </>
   );
}

// Floating count of the journals inside the current view, top left of the map
export default function MapCountChip({ ready, loading, error, count, truncated }) {
   let icon = <MapPin className="size-3.5" aria-hidden="true" />;
   if (loading) icon = <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />;
   else if (error) icon = <CircleAlert className="size-3.5" aria-hidden="true" />;

   return (
      <motion.div
         role="status"
         aria-live="polite"
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ ...spring.soft, delay: 0.15 }}
         className="pointer-events-auto inline-flex h-11 min-w-0 items-center gap-2 rounded-full border bg-card pr-4 pl-2.5 text-sm shadow-sm"
      >
         <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            {icon}
         </span>
         <span className="flex min-w-0 items-center gap-1.5 truncate">
            <Status ready={ready} error={error} count={count} truncated={truncated} />
         </span>
      </motion.div>
   );
}
