import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { resetDemo } from '@/lib/demo/index';
import { duration, ease, fadeUp, scaleIn, stagger } from '@/lib/motion';

const DISMISSED_KEY = 'tv-demo:banner-dismissed';

// Mounted only by the static demo build (see main.jsx): the site runs without a
// server, so say so, and offer a way back to the seeded journals
export default function DemoBanner() {
   const [open, setOpen] = useState(() => sessionStorage.getItem(DISMISSED_KEY) !== '1');

   const dismiss = () => {
      sessionStorage.setItem(DISMISSED_KEY, '1');
      setOpen(false);
   };

   const confirmReset = () =>
      toast('Reset the demo data?', {
         description: 'Journals, likes, comments and accounts made in this browser are removed.',
         action: { label: 'Reset', onClick: () => void resetDemo() }
      });

   return (
      <AnimatePresence>
         {open && (
            <motion.aside
               key="demo-banner"
               aria-label="Live demo"
               initial={{ height: 0, opacity: 0 }}
               animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: { duration: duration.entrance, ease: ease.out }
               }}
               exit={{
                  height: 0,
                  opacity: 0,
                  transition: { duration: duration.base, ease: ease.inOut }
               }}
               className="overflow-hidden border-b bg-background"
            >
               <motion.div
                  variants={stagger(0.08, 0.2)}
                  initial="hidden"
                  animate="show"
                  className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2"
               >
                  <motion.span
                     variants={scaleIn}
                     aria-hidden="true"
                     className="relative flex size-2 shrink-0"
                  >
                     <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                     <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </motion.span>
                  <motion.p
                     variants={fadeUp}
                     className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground sm:text-sm"
                  >
                     <span className="font-medium text-primary">Live demo</span> with no server:
                     what you post stays in this browser.
                  </motion.p>
                  <motion.div variants={fadeUp} className="flex shrink-0 items-center gap-1">
                     <Button variant="outline" size="xs" className="tv-hit" onClick={confirmReset}>
                        <RotateCcw className="transition-transform duration-300 group-hover/button:-rotate-180" />
                        <span className="sm:hidden">Reset</span>
                        <span className="hidden sm:inline">Reset demo data</span>
                     </Button>
                     <Button
                        variant="ghost"
                        size="icon-xs"
                        className="tv-hit"
                        aria-label="Dismiss the demo notice"
                        onClick={dismiss}
                     >
                        <X />
                     </Button>
                  </motion.div>
               </motion.div>
            </motion.aside>
         )}
      </AnimatePresence>
   );
}
