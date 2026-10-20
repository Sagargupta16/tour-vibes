import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { fadeUp, reveal, stagger } from '@/lib/motion';
import { MAP_H, MAP_W } from './map-geo';
import WorldDotsLayer from './world-dots-layer';

export default function ClosingCta() {
   const { isAuth } = useAuth();

   return (
      <section className="tv-container pb-20 sm:pb-28">
         <motion.div
            {...reveal}
            variants={stagger(0.08)}
            className="relative overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center sm:px-12 sm:py-20"
         >
            {/* The hero's world map again, faint, so the page ends where it began */}
            <svg
               viewBox={`0 0 ${MAP_W} ${MAP_H}`}
               preserveAspectRatio="xMidYMid slice"
               aria-hidden="true"
               className="absolute inset-0 size-full text-foreground/[0.07]"
            >
               <WorldDotsLayer />
            </svg>
            <div className="relative mx-auto max-w-2xl">
               <motion.h2
                  variants={fadeUp}
                  className="text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] font-extrabold"
               >
                  {isAuth
                     ? 'Back from somewhere new?'
                     : 'Your next trip deserves more than a camera roll.'}
               </motion.h2>
               <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-lg text-muted-foreground">
                  {isAuth
                     ? 'Write it up while the details are sharp, pin it, and see who stops by.'
                     : 'Free to start. Write your first journal in a couple of minutes and pin it where it happened.'}
               </motion.p>
               <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
               >
                  <Button size="xl" asChild>
                     <Link to={isAuth ? '/myjournals' : '/signup'}>
                        {isAuth ? 'Open My Journals' : 'Start your journal'}
                        <ArrowRight className="transition-transform duration-200 group-hover/button:translate-x-1" />
                     </Link>
                  </Button>
                  <Button size="xl" variant="outline" asChild>
                     <Link to="/map">Browse the map</Link>
                  </Button>
               </motion.div>
            </div>
         </motion.div>
      </section>
   );
}
