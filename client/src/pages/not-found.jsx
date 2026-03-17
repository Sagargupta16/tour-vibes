import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/shared/page-transition';

export default function NotFound() {
   return (
      <PageTransition>
         <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
            <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.3 }}
            >
               <h1 className="text-8xl font-bold text-muted-foreground/30">404</h1>
               <p className="mt-2 text-xl font-medium">Page not found</p>
               <p className="mt-1 text-muted-foreground">
                  The page you&apos;re looking for doesn&apos;t exist.
               </p>
               <Button asChild className="mt-6">
                  <Link to="/">Go Home</Link>
               </Button>
            </motion.div>
         </div>
      </PageTransition>
   );
}
