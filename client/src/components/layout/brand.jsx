import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';

// The mark: a pin at the end of a dashed route, on an accent tile (same as favicon.svg)
export function BrandMark({ className }) {
   return (
      <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8 text-primary', className)}>
         <rect width="32" height="32" rx="9" fill="currentColor" />
         <path
            d="M6.5 25c4.5 0 6-3.5 10.5-3.5"
            fill="none"
            stroke="var(--primary-foreground)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="0.1 3.4"
            className="opacity-80"
         />
         <circle cx="6.5" cy="25" r="1.9" fill="var(--primary-foreground)" />
         <motion.g variants={{ rest: { y: 0 }, hover: { y: -2.5 } }} transition={spring.bouncy}>
            <path
               d="M20.5 5.5a6.5 6.5 0 0 0-6.5 6.5c0 4.6 6.5 10.5 6.5 10.5S27 16.6 27 12a6.5 6.5 0 0 0-6.5-6.5Z"
               fill="var(--primary-foreground)"
            />
            <circle cx="20.5" cy="12" r="2.4" fill="currentColor" />
         </motion.g>
      </svg>
   );
}

// Logo link: the pin hops when the link is hovered or pressed
export default function Brand({ className, onClick }) {
   return (
      <motion.div initial="rest" animate="rest" whileHover="hover" whileTap="hover">
         <Link
            to="/"
            onClick={onClick}
            aria-label="Tour Vibes home"
            className={cn(
               'flex min-h-11 items-center gap-2.5 rounded-lg font-display text-[1.05rem] font-bold tracking-tight',
               className
            )}
         >
            <BrandMark />
            <span>Tour Vibes</span>
         </Link>
      </motion.div>
   );
}
