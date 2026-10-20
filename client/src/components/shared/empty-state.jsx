import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, spring, stagger } from '@/lib/motion';

// Optional props: icon (a lucide component), action (a node, e.g. a Button),
// className. The icon floats on a dotted tile so an empty list still moves.
export default function EmptyState({
   title = 'No posts found',
   description = '',
   icon: Icon = FileText,
   action = null,
   className
}) {
   return (
      <motion.div
         variants={stagger(0.08)}
         initial="hidden"
         animate="show"
         className={cn(
            'flex flex-col items-center justify-center px-4 py-16 text-center',
            className
         )}
      >
         <motion.div
            variants={{
               hidden: { opacity: 0, scale: 0.6, rotate: -8 },
               show: { opacity: 1, scale: 1, rotate: 0, transition: spring.bouncy }
            }}
            className="tv-dot-grid relative mb-6 grid size-24 place-items-center rounded-3xl border bg-card"
         >
            <motion.div
               animate={{ y: [0, -6, 0], rotate: [0, -4, 0] }}
               transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
               className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/15"
            >
               <Icon className="size-6" strokeWidth={1.75} />
            </motion.div>
            <motion.span
               aria-hidden="true"
               animate={{ scaleX: [1, 0.7, 1], opacity: [0.35, 0.18, 0.35] }}
               transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute bottom-4 h-1.5 w-8 rounded-full bg-foreground/20"
            />
         </motion.div>
         <motion.p variants={fadeUp} className="font-display text-lg font-semibold tracking-tight">
            {title}
         </motion.p>
         {description && (
            <motion.p variants={fadeUp} className="mt-1.5 max-w-sm text-sm text-muted-foreground">
               {description}
            </motion.p>
         )}
         {action && (
            <motion.div variants={fadeUp} className="mt-6">
               {action}
            </motion.div>
         )}
      </motion.div>
   );
}
