import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { duration, ease, fadeUp, scaleIn, stagger } from '@/lib/motion';
import PageTransition from '@/components/shared/page-transition';
import AuthVisual from './auth-visual';

// Split layout for login and signup: the form column staggers in on the left and
// the travel panel fills the right on desktop; phones get the form alone. Children
// that use motion variants (fadeUp) join the same stagger.
export default function AuthShell({ eyebrow, title, subtitle, footer, children }) {
   return (
      <PageTransition>
         <div className="mx-auto grid min-h-[calc(100dvh-4rem-1px)] w-full max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8 lg:p-6">
            <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:py-6">
               <motion.div
                  variants={stagger(0.07, 0.05)}
                  initial="hidden"
                  animate="show"
                  className="w-full max-w-sm"
               >
                  <motion.span
                     variants={scaleIn}
                     className="mb-6 grid size-11 place-items-center rounded-xl border bg-card text-primary"
                  >
                     <Compass className="size-5" aria-hidden="true" />
                  </motion.span>
                  <motion.p
                     variants={fadeUp}
                     className="font-mono text-[11px] font-medium tracking-[0.14em] text-primary uppercase"
                  >
                     {eyebrow}
                  </motion.p>
                  <motion.h1
                     variants={fadeUp}
                     className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl"
                  >
                     {title}
                  </motion.h1>
                  <motion.p variants={fadeUp} className="mt-3 text-pretty text-muted-foreground">
                     {subtitle}
                  </motion.p>
                  <div className="mt-8">{children}</div>
                  {footer && (
                     <motion.div
                        variants={fadeUp}
                        className="mt-8 text-center text-sm text-muted-foreground"
                     >
                        {footer}
                     </motion.div>
                  )}
               </motion.div>
            </div>
            <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: duration.entrance, ease: ease.out }}
               className="hidden lg:block"
            >
               <AuthVisual />
            </motion.div>
         </div>
      </PageTransition>
   );
}
