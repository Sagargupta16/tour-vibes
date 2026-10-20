import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { duration, ease } from '@/lib/motion';

// Full-width 44px submit that presses in on tap and slides its label out for a
// spinner while the request runs
export default function SubmitButton({
   loading,
   loadingText = 'Working',
   disabled,
   variant,
   className,
   children,
   ...props
}) {
   return (
      <Button
         type="submit"
         variant={variant}
         disabled={loading || disabled}
         aria-busy={loading || undefined}
         className={cn(
            // Tailwind 4 presses with the `scale` property, so it has to be in the list
            'h-11 w-full overflow-hidden rounded-xl text-sm font-semibold transition-[background-color,border-color,color,scale,opacity] duration-150 active:scale-[0.96]',
            className
         )}
         {...props}
      >
         <AnimatePresence mode="wait" initial={false}>
            <motion.span
               key={loading ? 'busy' : 'idle'}
               className="inline-flex items-center gap-2"
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -8 }}
               transition={{ duration: duration.micro, ease: ease.out }}
            >
               {loading ? (
                  <>
                     <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                     {loadingText}
                  </>
               ) : (
                  children
               )}
            </motion.span>
         </AnimatePresence>
      </Button>
   );
}
