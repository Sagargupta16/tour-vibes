import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './header';
import PageLoader from '@/components/shared/page-loader';

export default function RootLayout() {
   const location = useLocation();

   return (
      <div className="flex min-h-screen flex-col">
         <Header />
         <main className="flex-1">
            <AnimatePresence mode="wait">
               <div key={location.pathname}>
                  <Suspense fallback={<PageLoader />}>
                     <Outlet />
                  </Suspense>
               </div>
            </AnimatePresence>
         </main>
         <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            Tour Vibes &middot; Share your travel stories
         </footer>
      </div>
   );
}
