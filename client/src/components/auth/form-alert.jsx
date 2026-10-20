import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert } from 'lucide-react';
import { duration, ease } from '@/lib/motion';

// Form-level error (wrong password, rate limit, network) that no single field owns
export default function FormAlert({ message }) {
   return (
      <AnimatePresence initial={false}>
         {message && (
            <motion.div
               key="form-alert"
               role="alert"
               initial={{ opacity: 0, y: -6, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -6, transition: { duration: duration.micro } }}
               transition={{ duration: duration.base, ease: ease.out }}
               className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
               <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
               <span className="text-pretty">{message}</span>
            </motion.div>
         )}
      </AnimatePresence>
   );
}
