import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, reveal, stagger } from '@/lib/motion';

// Numbered section header shared by the landing sections; reveals on scroll
export default function SectionHeading({ index, eyebrow, title, description, action, className }) {
   return (
      <motion.div
         {...reveal}
         variants={stagger(0.08)}
         className={cn(
            'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
            className
         )}
      >
         <div className="max-w-2xl space-y-3">
            <motion.p variants={fadeUp} className="tv-eyebrow flex items-center gap-2">
               <span className="text-primary">{index}</span>
               <span className="h-px w-6 bg-border" />
               {eyebrow}
            </motion.p>
            <motion.h2
               variants={fadeUp}
               className="text-[clamp(1.85rem,4.5vw,2.75rem)] leading-[1.05] font-bold"
            >
               {title}
            </motion.h2>
            {description && (
               <motion.p variants={fadeUp} className="max-w-xl text-base text-muted-foreground">
                  {description}
               </motion.p>
            )}
         </div>
         {action && (
            <motion.div variants={fadeUp} className="shrink-0">
               {action}
            </motion.div>
         )}
      </motion.div>
   );
}
