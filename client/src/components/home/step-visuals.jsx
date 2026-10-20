import { motion } from 'framer-motion';
import { Camera, Heart, MessageCircle } from 'lucide-react';
import { ease, spring } from '@/lib/motion';

// Small illustrations for the three steps. Each plays once when it scrolls in.
const inView = {
   initial: 'hidden',
   whileInView: 'show',
   viewport: { once: true, margin: '-60px' }
};

const panel =
   'relative h-44 overflow-hidden rounded-xl border bg-background tv-dot-grid sm:h-48 dark:bg-muted/30';

const LINES = [
   { delay: 0.45, width: 92 },
   { delay: 0.6, width: 80 },
   { delay: 0.75, width: 58 }
];

const grow = (delay) => ({
   hidden: { scaleX: 0 },
   show: { scaleX: 1, transition: { duration: 0.5, delay, ease: ease.out } }
});

export function WriteVisual() {
   return (
      <motion.div {...inView} className={panel}>
         <motion.div
            variants={{
               hidden: { y: 24, opacity: 0 },
               show: { y: 0, opacity: 1, transition: spring.soft }
            }}
            className="absolute inset-x-6 top-6 bottom-0 rounded-t-xl border border-b-0 bg-card p-3"
         >
            <div className="flex h-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
               <Camera className="size-5" />
            </div>
            <motion.div
               variants={grow(0.25)}
               className="mt-3 h-2.5 w-2/3 origin-left rounded-full bg-foreground/70"
            />
            <div className="mt-2.5 space-y-1.5">
               {LINES.map(({ delay, width }, i) => (
                  <div
                     key={delay}
                     className="flex items-center gap-1"
                     style={{ width: `${width}%` }}
                  >
                     <motion.div
                        variants={grow(delay)}
                        className="h-1.5 flex-1 origin-left rounded-full bg-foreground/15"
                     />
                     {i === LINES.length - 1 && (
                        // Caret blinking at the end of the text
                        <motion.span
                           animate={{ opacity: [1, 0, 1] }}
                           transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                           className="h-3 w-0.5 shrink-0 rounded-full bg-primary"
                        />
                     )}
                  </div>
               ))}
            </div>
         </motion.div>
      </motion.div>
   );
}

export function PinVisual() {
   return (
      <motion.div {...inView} className={panel}>
         <svg
            viewBox="0 0 200 120"
            className="absolute inset-0 size-full text-foreground/10"
            aria-hidden="true"
         >
            <path
               d="M-10 80C30 60 50 95 95 70s70-40 115-20"
               fill="none"
               stroke="currentColor"
               strokeWidth="10"
            />
            <path d="M20-10C40 30 25 60 60 130" fill="none" stroke="currentColor" strokeWidth="5" />
         </svg>
         <div className="absolute top-[52%] left-1/2">
            <motion.span
               aria-hidden="true"
               variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { delay: 0.55 } }
               }}
               className="absolute top-0 left-0 block"
            >
               <motion.span
                  animate={{ scale: [0.3, 1.8], opacity: [0.7, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: ease.out }}
                  className="absolute -top-5 -left-5 block size-10 rounded-full border-2 border-primary"
               />
            </motion.span>
            <motion.svg
               viewBox="0 0 24 30"
               variants={{
                  hidden: { y: -70, opacity: 0, scale: 0.6 },
                  show: {
                     y: 0,
                     opacity: 1,
                     scale: 1,
                     transition: { ...spring.bouncy, delay: 0.15 }
                  }
               }}
               className="absolute -top-9 -left-[14px] h-9 w-7 text-primary drop-shadow-[0_4px_4px_rgb(0_0_0/0.25)]"
            >
               <path
                  d="M12 29C8.5 23 2 17.5 2 11a10 10 0 0 1 20 0c0 6.5-6.5 12-10 18Z"
                  fill="currentColor"
                  stroke="var(--background)"
                  strokeWidth="1.5"
               />
               <circle cx="12" cy="11" r="3.6" fill="var(--background)" />
            </motion.svg>
         </div>
         <motion.div
            variants={{
               hidden: { opacity: 0, x: -12 },
               show: { opacity: 1, x: 0, transition: { delay: 0.7, ...spring.snappy } }
            }}
            className="absolute bottom-4 left-4 rounded-full border bg-card px-3 py-1 text-xs font-semibold"
         >
            Kyoto{' '}
            <span className="font-mono text-[10px] font-medium text-muted-foreground">
               35.01N 135.77E
            </span>
         </motion.div>
      </motion.div>
   );
}

export function ShareVisual() {
   return (
      <motion.div {...inView} className={panel}>
         <motion.div
            variants={{
               hidden: { y: 20, opacity: 0 },
               show: { y: 0, opacity: 1, transition: spring.soft }
            }}
            className="absolute inset-x-6 top-6 rounded-xl border bg-card p-3"
         >
            <div className="flex items-center gap-2">
               <div className="flex -space-x-2">
                  {['bg-primary', 'bg-primary/55', 'bg-foreground/30'].map((tone, i) => (
                     <motion.span
                        key={tone}
                        variants={{
                           hidden: { scale: 0 },
                           show: {
                              scale: 1,
                              transition: { ...spring.bouncy, delay: 0.3 + i * 0.1 }
                           }
                        }}
                        className={`size-6 rounded-full border-2 border-card ${tone}`}
                     />
                  ))}
               </div>
               <span className="text-xs text-muted-foreground">liked your journal</span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm font-semibold">
               <span className="flex items-center gap-1.5">
                  <span className="relative size-5">
                     <Heart className="absolute inset-0 size-5 text-muted-foreground" />
                     <motion.span
                        variants={{
                           hidden: { scale: 0 },
                           show: { scale: [0, 1.35, 1], transition: { delay: 0.9, duration: 0.45 } }
                        }}
                        className="absolute inset-0"
                     >
                        <Heart className="size-5 fill-rose-500 text-rose-500" />
                     </motion.span>
                  </span>
                  {/* The count rolls from 23 to 24 as the heart fills */}
                  <span className="inline-block h-5 overflow-hidden tabular-nums">
                     <motion.span
                        variants={{
                           hidden: { y: 0 },
                           show: { y: '-50%', transition: { delay: 0.95, ...spring.snappy } }
                        }}
                        className="flex flex-col leading-5"
                     >
                        <span>23</span>
                        <span>24</span>
                     </motion.span>
                  </span>
               </span>
               <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageCircle className="size-5" />5
               </span>
            </div>
            <motion.p
               variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                     opacity: 1,
                     y: 0,
                     transition: { delay: 1.2, duration: 0.4, ease: ease.out }
                  }
               }}
               className="mt-3 rounded-lg bg-muted px-2.5 py-1.5 text-xs"
            >
               Adding this to my list for spring!
            </motion.p>
         </motion.div>
      </motion.div>
   );
}
