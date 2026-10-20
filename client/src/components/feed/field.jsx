import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { duration, ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Label, optional hint and an animated error line. The control itself should set
// aria-invalid and aria-describedby={`${id}-error`} when `error` is shown.
export default function Field({ id, label, hint, error, className, children }) {
   return (
      <div className={cn('space-y-2', className)}>
         <div className="flex items-baseline justify-between gap-3">
            <Label id={`${id}-label`} htmlFor={id}>
               {label}
            </Label>
            {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
         </div>
         {children}
         <AnimatePresence initial={false}>
            {error && (
               <motion.p
                  key="error"
                  id={`${id}-error`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: duration.micro, ease: ease.out }}
                  className="text-xs font-medium text-destructive"
               >
                  {error}
               </motion.p>
            )}
         </AnimatePresence>
      </div>
   );
}
