import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { ease, fadeUp, stagger } from '@/lib/motion';
import HeroVisual from './hero-visual';

// Each word knows its place in the whole headline, so the rise staggers across lines
const LINES = [
   ['Write', 'the', 'trip.'],
   ['Pin', 'it', 'to', 'the', 'map.']
].map((line, li, all) =>
   line.map((text, wi) => ({ text, order: all.slice(0, li).flat().length + wi }))
);

const word = {
   hidden: { y: '110%' },
   show: (order) => ({
      y: '0%',
      transition: { duration: 0.75, ease: ease.out, delay: 0.1 + order * 0.07 }
   })
};

// Real count from the API, ticking up once it arrives
function JournalCount({ total, status }) {
   const count = useMotionValue(0);
   const text = useTransform(count, (v) => Math.round(v).toLocaleString('en-US'));

   useEffect(() => {
      if (!total) return undefined;
      const controls = animate(count, total, { duration: 1.2, ease: ease.out });
      return () => controls.stop();
   }, [count, total]);

   return (
      <motion.p
         variants={fadeUp}
         className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-2 text-xs font-medium text-muted-foreground"
      >
         <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative size-2 rounded-full bg-primary" />
         </span>
         {status === 'ready' && total > 0 ? (
            <span>
               <motion.span className="font-semibold text-foreground tabular-nums">
                  {text}
               </motion.span>{' '}
               journals shared by travelers
            </span>
         ) : (
            <span>Travel journals, pinned to a map</span>
         )}
      </motion.p>
   );
}

// The word "map." gets a hand-drawn route underneath once the headline lands
function MapWord({ children }) {
   return (
      <span className="relative inline-block text-primary">
         {children}
         <svg
            viewBox="0 0 120 16"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute -bottom-[0.12em] left-0 h-[0.22em] w-full overflow-visible"
         >
            <motion.path
               d="M2 10C22 2 38 15 60 8s38-4 56 1"
               fill="none"
               stroke="currentColor"
               strokeWidth="2.6"
               strokeLinecap="round"
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 1 }}
               transition={{ delay: 1.05, duration: 0.7, ease: ease.inOut }}
            />
         </svg>
      </span>
   );
}

function Headline() {
   return (
      <h1 className="font-display text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.95] font-extrabold tracking-[-0.045em]">
         {LINES.map((line) => (
            <span key={line[0].order} className="block">
               {line.map(({ text, order }) => (
                  // The clip box reaches below the baseline so descenders and the
                  // route under "map." are not cut while the words rise. The real
                  // space after each word keeps the heading text readable.
                  <Fragment key={order}>
                     <span className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] align-bottom">
                        <motion.span
                           className="inline-block"
                           variants={word}
                           custom={order}
                           initial="hidden"
                           animate="show"
                        >
                           {text === 'map.' ? <MapWord>{text}</MapWord> : text}
                        </motion.span>
                     </span>{' '}
                  </Fragment>
               ))}
            </span>
         ))}
      </h1>
   );
}

export default function Hero({ posts, total, status }) {
   const { isAuth, demoLogin } = useAuth();
   const navigate = useNavigate();
   const [demoBusy, setDemoBusy] = useState(false);

   const tryDemo = async () => {
      setDemoBusy(true);
      try {
         const data = await demoLogin();
         toast.success(`Signed in as ${data?.name || 'the demo traveler'}`);
         navigate('/journals');
      } catch (err) {
         toast.error(err.message || 'The demo account is not available right now');
      } finally {
         setDemoBusy(false);
      }
   };

   return (
      <section className="tv-container pt-10 pb-16 sm:pt-16 lg:pb-32">
         <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="space-y-6">
            <JournalCount total={total} status={status} />
            <Headline />
         </motion.div>

         <motion.div
            variants={stagger(0.08, 0.45)}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
         >
            <motion.p
               variants={fadeUp}
               className="max-w-md text-lg leading-relaxed text-muted-foreground"
            >
               Keep the photos, notes and places from every trip in one journal. Pin each story
               where it happened, then let anyone wander your map.
            </motion.p>
            <div className="space-y-4 lg:text-right">
               <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
                  <Button size="xl" asChild>
                     <Link to="/journals">
                        Explore journals
                        <ArrowRight className="transition-transform duration-200 group-hover/button:translate-x-1" />
                     </Link>
                  </Button>
                  {isAuth ? (
                     <Button size="xl" variant="outline" asChild>
                        <Link to="/journals">
                           <Plus />
                           New journal
                        </Link>
                     </Button>
                  ) : (
                     <Button size="xl" variant="outline" asChild>
                        <Link to="/signup">Start your journal</Link>
                     </Button>
                  )}
               </motion.div>
               {!isAuth && (
                  <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
                     Want to try posting first?{' '}
                     <button
                        type="button"
                        onClick={tryDemo}
                        disabled={demoBusy}
                        className="tv-link tv-hit inline-flex items-center gap-1.5 font-medium text-foreground disabled:opacity-60"
                     >
                        {demoBusy && <Loader2 className="size-3.5 animate-spin" />}
                        Use the demo account
                     </button>
                  </motion.p>
               )}
            </div>
         </motion.div>

         <div className="mt-12 sm:mt-16">
            <HeroVisual posts={posts} status={status} />
         </div>
      </section>
   );
}
