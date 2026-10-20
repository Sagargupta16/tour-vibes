import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { duration, ease } from '@/lib/motion';

const messageMotion = {
   initial: { opacity: 0, y: -4 },
   animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
   exit: { opacity: 0, y: -4, transition: { duration: duration.micro } }
};

// One reserved line under a field for its error or hint, so a message appearing
// never pushes the rest of the form down
export function FieldMessage({ id, error, hint }) {
   let content = null;
   if (error) {
      content = (
         <motion.p
            key={`error-${error}`}
            id={`${id}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-destructive"
            {...messageMotion}
         >
            <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
            {error}
         </motion.p>
      );
   } else if (hint) {
      content = (
         <motion.p
            key="hint"
            id={`${id}-hint`}
            className="text-muted-foreground"
            {...messageMotion}
         >
            {hint}
         </motion.p>
      );
   }
   return (
      <div className="min-h-5 text-xs leading-5">
         <AnimatePresence mode="wait" initial={false}>
            {content}
         </AnimatePresence>
      </div>
   );
}

// Label, a 44px input with a leading icon that lights up on focus, an optional
// trailing control (the password eye) and the message line
export default function FormField({
   id,
   label,
   icon: Icon,
   error,
   hint,
   labelAside,
   trailing,
   className,
   inputClassName,
   ...props
}) {
   let describedBy;
   if (error) describedBy = `${id}-error`;
   else if (hint) describedBy = `${id}-hint`;

   return (
      <div className={cn('space-y-2', className)}>
         <div className="flex min-h-4 items-center justify-between gap-2">
            <Label htmlFor={id}>{label}</Label>
            {labelAside}
         </div>
         <div className="group/field relative">
            {Icon && (
               <Icon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-[color,scale] duration-200 ease-out group-focus-within/field:scale-110 group-focus-within/field:text-primary"
               />
            )}
            <Input
               id={id}
               aria-invalid={error ? true : undefined}
               aria-describedby={describedBy}
               className={cn(
                  'h-11 rounded-xl px-3.5 transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-primary focus-visible:ring-primary/20',
                  Icon && 'pl-10',
                  trailing && 'pr-12',
                  inputClassName
               )}
               {...props}
            />
            {trailing}
         </div>
         <FieldMessage id={id} error={error} hint={hint} />
      </div>
   );
}
