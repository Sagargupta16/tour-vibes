import { motion } from 'framer-motion';
import { ease } from '@/lib/motion';

// Shown while a lazily loaded page chunk downloads. It waits a beat before
// appearing, so a fast chunk never flashes a spinner.
export default function PageLoader() {
   return (
      <motion.div
         role="status"
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.2, duration: 0.3, ease: ease.out }}
         className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
      >
         <svg viewBox="0 0 48 48" className="size-14 text-primary" aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" stroke="var(--border)" strokeWidth="2" />
            <motion.circle
               cx="24"
               cy="24"
               r="21"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeDasharray="28 104"
               animate={{ rotate: 360 }}
               transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
               style={{ originX: '50%', originY: '50%' }}
            />
            {/* The needle hunts for north: swings, overshoots, settles, repeats */}
            <motion.g
               animate={{ rotate: [0, 140, 100, 380, 360] }}
               transition={{ duration: 2.4, repeat: Infinity, ease: ease.inOut }}
               style={{ originX: '50%', originY: '50%' }}
            >
               <path d="M24 10l4 14h-8z" fill="currentColor" />
               <path d="M24 38l-4-14h8z" fill="var(--muted-foreground)" opacity="0.45" />
            </motion.g>
            <circle cx="24" cy="24" r="2.2" fill="var(--background)" stroke="currentColor" />
         </svg>
         <p className="tv-eyebrow">Loading the next stop</p>
      </motion.div>
   );
}
