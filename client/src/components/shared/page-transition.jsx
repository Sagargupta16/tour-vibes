import { motion } from 'framer-motion';
import { duration, ease } from '@/lib/motion';

// Every page's entrance: the page rises in, and any child using a shared variant
// (fadeUp, fadeIn, scaleIn from lib/motion) staggers in after it. The route exit
// lives in RootLayout, so pages do not need an exit of their own.
const page = {
   hidden: { opacity: 0, y: 14 },
   show: {
      opacity: 1,
      y: 0,
      transition: {
         duration: duration.entrance,
         ease: ease.out,
         staggerChildren: 0.07,
         delayChildren: 0.05
      }
   }
};

export default function PageTransition({ children, className }) {
   return (
      <motion.div variants={page} initial="hidden" animate="show" className={className}>
         {children}
      </motion.div>
   );
}
