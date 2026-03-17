import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 12 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -12 }}
         transition={{ duration: 0.2, ease: 'easeOut' }}
      >
         {children}
      </motion.div>
   );
}
