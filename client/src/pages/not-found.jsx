import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/shared/page-transition';
import { fadeUp, stagger } from '@/lib/motion';

const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

// A compass that spins wildly, then wobbles to rest pointing somewhere wrong
function LostCompass() {
   return (
      <motion.div
         initial={{ scale: 0.6, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ type: 'spring', stiffness: 260, damping: 20 }}
         whileHover={{ rotate: -8 }}
         className="relative mx-auto size-44 sm:size-52"
      >
         <svg viewBox="0 0 200 200" className="size-full" aria-hidden="true">
            <circle
               cx="100"
               cy="100"
               r="94"
               fill="var(--card)"
               stroke="var(--border)"
               strokeWidth="2"
            />
            <circle
               cx="100"
               cy="100"
               r="78"
               fill="none"
               stroke="var(--border)"
               strokeDasharray="2 6"
            />
            {TICKS.map((deg) => (
               <line
                  key={deg}
                  x1="100"
                  y1={deg % 90 === 0 ? 12 : 16}
                  x2="100"
                  y2="22"
                  stroke={deg % 90 === 0 ? 'var(--foreground)' : 'var(--muted-foreground)'}
                  strokeOpacity={deg % 90 === 0 ? 0.8 : 0.4}
                  strokeWidth={deg % 90 === 0 ? 2.5 : 1.5}
                  transform={`rotate(${deg} 100 100)`}
               />
            ))}
            {[
               ['N', 100, 44],
               ['E', 158, 104],
               ['S', 100, 164],
               ['W', 42, 104]
            ].map(([label, x, y]) => (
               <text
                  key={label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono text-[13px] font-semibold"
               >
                  {label}
               </text>
            ))}
            <motion.g
               initial={{ rotate: -720 }}
               animate={{ rotate: 128 }}
               transition={{ type: 'spring', stiffness: 28, damping: 5, mass: 1.2, delay: 0.2 }}
               style={{ originX: '50%', originY: '50%' }}
            >
               <path d="M100 34l11 66h-22z" fill="var(--primary)" />
               <path d="M100 166l-11-66h22z" fill="var(--muted-foreground)" fillOpacity="0.35" />
            </motion.g>
            <circle
               cx="100"
               cy="100"
               r="7"
               fill="var(--background)"
               stroke="var(--primary)"
               strokeWidth="3"
            />
         </svg>
      </motion.div>
   );
}

export default function NotFound() {
   return (
      <PageTransition>
         <section className="tv-container flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center py-16 text-center">
            <LostCompass />
            <motion.div
               variants={stagger(0.08, 0.35)}
               initial="hidden"
               animate="show"
               className="mt-8"
            >
               <motion.p variants={fadeUp} className="tv-eyebrow">
                  Error 404 <span className="text-primary">/</span> 404.0N 404.0W
               </motion.p>
               <motion.h1
                  variants={fadeUp}
                  className="mt-3 text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.02] font-extrabold"
               >
                  This page is off the map
               </motion.h1>
               <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-md text-muted-foreground">
                  Those coordinates do not exist, and neither does this page. It may have moved, or
                  the link took a wrong turn.
               </motion.p>
               <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
               >
                  <Button size="lg" asChild>
                     <Link to="/">
                        <ArrowLeft />
                        Back home
                     </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                     <Link to="/journals">
                        <Compass />
                        Explore journals
                     </Link>
                  </Button>
               </motion.div>
            </motion.div>
         </section>
      </PageTransition>
   );
}
