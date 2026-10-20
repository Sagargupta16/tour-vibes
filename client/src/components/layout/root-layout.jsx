import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './header';
import SiteFooter from './site-footer';
import PageLoader from '@/components/shared/page-loader';
import { duration, ease } from '@/lib/motion';

// The old page fades up and out, then the new one fades in (each page's own
// PageTransition adds the rise). Scrolling resets between the two, so the
// leaving page never jumps.
const routeMotion = {
   initial: { opacity: 0 },
   animate: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
   exit: { opacity: 0, y: -10, transition: { duration: 0.18, ease: ease.inOut } }
};

const scrollToTop = () => globalThis.scrollTo({ top: 0, left: 0, behavior: 'instant' });

export default function RootLayout() {
   const { pathname } = useLocation();
   // The element is captured per render, so the leaving page keeps showing its own
   // route while it animates out instead of the next one
   const outlet = useOutlet();

   return (
      <div className="flex min-h-svh flex-col">
         <a
            href="#main"
            className="sr-only z-[60] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
         >
            Skip to content
         </a>
         <Header />
         <main id="main" className="flex-1">
            <AnimatePresence mode="wait" initial={false} onExitComplete={scrollToTop}>
               <motion.div key={pathname} {...routeMotion}>
                  <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
               </motion.div>
            </AnimatePresence>
         </main>
         <SiteFooter />
      </div>
   );
}
