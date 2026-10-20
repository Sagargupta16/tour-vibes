import { useId } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

// First, last and two either side of the current page; gaps collapse to an ellipsis
const pageList = (page, lastPage) => {
   const pages = [];
   for (let p = 1; p <= lastPage; p++) {
      if (p === 1 || p === lastPage || Math.abs(p - page) <= 1) pages.push(p);
      // A gap is keyed by the first page it hides, so React keys stay stable
      else if (typeof pages.at(-1) !== 'string') pages.push(`gap-${p}`);
   }
   return pages;
};

const step = 'h-11 rounded-full px-4 sm:h-10';

export default function Pagination({ page, lastPage, onPageChange }) {
   const pillId = useId();
   if (lastPage <= 1) return null;

   return (
      <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-10">
         <Button
            variant="outline"
            className={step}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
         >
            <ChevronLeft />
            <span className="max-sm:sr-only">Previous</span>
         </Button>

         <ol className="hidden items-center gap-1 sm:flex">
            {pageList(page, lastPage).map((p) =>
               typeof p === 'string' ? (
                  <li key={p} aria-hidden className="grid w-6 place-items-center">
                     <MoreHorizontal className="size-4 text-muted-foreground" />
                  </li>
               ) : (
                  <li key={p}>
                     <motion.button
                        type="button"
                        aria-current={p === page ? 'page' : undefined}
                        aria-label={`Page ${p}`}
                        onClick={() => p !== page && onPageChange(p)}
                        whileTap={{ scale: 0.94 }}
                        className={cn(
                           'relative grid size-10 place-items-center rounded-full text-sm font-medium tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                           p === page
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                     >
                        {p === page && (
                           <motion.span
                              layoutId={pillId}
                              transition={spring.snappy}
                              className="absolute inset-0 rounded-full bg-primary"
                           />
                        )}
                        <span className="relative">{p}</span>
                     </motion.button>
                  </li>
               )
            )}
         </ol>

         <p className="min-w-24 text-center text-sm text-muted-foreground tabular-nums sm:hidden">
            {page} of {lastPage}
         </p>

         <Button
            variant="outline"
            className={step}
            disabled={page >= lastPage}
            onClick={() => onPageChange(page + 1)}
         >
            <span className="max-sm:sr-only">Next</span>
            <ChevronRight />
         </Button>
      </nav>
   );
}
