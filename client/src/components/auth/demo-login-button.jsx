import { motion } from 'framer-motion';
import { ArrowRight, LoaderCircle, Plane } from 'lucide-react';
import { fadeUp } from '@/lib/motion';

// The prominent first option on a demo build (VITE_DEMO_LOGIN=true): one tap signs
// in as the seeded demo traveler, no form involved
export default function DemoLoginButton({ loading, disabled, onClick }) {
   return (
      <motion.div variants={fadeUp}>
         <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            aria-busy={loading || undefined}
            className="group flex min-h-14 w-full items-center gap-3.5 rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground outline-none transition-[background-color,scale,opacity] duration-150 hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-primary/40 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-60"
         >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-foreground/15">
               {loading ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
               ) : (
                  <Plane
                     className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                     aria-hidden="true"
                  />
               )}
            </span>
            <span className="min-w-0 flex-1">
               <span className="block text-sm font-semibold">
                  {loading ? 'Boarding the demo...' : 'Explore the live demo'}
               </span>
               <span className="block text-xs opacity-75">
                  One tap, no sign-up. Real journals, pins and likes.
               </span>
            </span>
            <ArrowRight
               className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
               aria-hidden="true"
            />
         </button>
      </motion.div>
   );
}
