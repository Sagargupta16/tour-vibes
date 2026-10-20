import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import FormField from './form-field';

// Contextual icon swap: scale, opacity and blur together, spring with no bounce
const iconSwap = {
   initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
   animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
   exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
   transition: { type: 'spring', duration: 0.3, bounce: 0 }
};

export default function PasswordField(props) {
   const [visible, setVisible] = useState(false);

   return (
      <FormField
         icon={Lock}
         {...props}
         type={visible ? 'text' : 'password'}
         trailing={
            <button
               type="button"
               onClick={() => setVisible((v) => !v)}
               aria-label={visible ? 'Hide password' : 'Show password'}
               aria-pressed={visible}
               className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-primary/30"
            >
               <AnimatePresence initial={false}>
                  <motion.span
                     key={visible ? 'hide' : 'show'}
                     className="col-start-1 row-start-1"
                     {...iconSwap}
                  >
                     {visible ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                     ) : (
                        <Eye className="size-4" aria-hidden="true" />
                     )}
                  </motion.span>
               </AnimatePresence>
            </button>
         }
      />
   );
}
