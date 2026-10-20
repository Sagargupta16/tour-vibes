import { motion } from 'framer-motion';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import SectionHeading from './section-heading';
import { PinVisual, ShareVisual, WriteVisual } from './step-visuals';

const STEPS = [
   {
      title: 'Write',
      body: 'Give the trip a title, a photo and the story while it is still fresh. Tags like food or hiking help the right people find it.',
      Visual: WriteVisual
   },
   {
      title: 'Pin',
      body: 'Tap the map or look the city up by name. The journal lands on the world map the moment you save it.',
      Visual: PinVisual
   },
   {
      title: 'Share',
      body: 'Anyone can read along. Travelers who sign in can like and comment, and every journal links back to its author.',
      Visual: ShareVisual
   }
];

export default function HowItWorks() {
   return (
      <section className="border-y bg-card">
         <div className="tv-container py-16 sm:py-24">
            <SectionHeading
               index="02"
               eyebrow="How it works"
               title="From camera roll to map pin in three steps"
            />

            <motion.ol
               {...reveal}
               variants={stagger(0.12, 0.1)}
               className="relative mt-12 grid gap-12 md:grid-cols-3 md:gap-8"
            >
               {/* The route between the step numbers draws itself left to right */}
               <motion.span
                  aria-hidden="true"
                  variants={{
                     hidden: { scaleX: 0 },
                     show: { scaleX: 1, transition: { duration: 1.2, ease: ease.inOut } }
                  }}
                  className="absolute top-[18px] right-[16%] left-[2%] hidden h-px origin-left border-t-2 border-dashed border-primary/40 md:block"
               />
               {STEPS.map(({ title, body, Visual }, i) => (
                  <motion.li key={title} variants={fadeUp} className="relative">
                     {/* Solid card background masks the dashed route behind the title */}
                     <div className="relative flex w-fit items-center gap-3 bg-card pr-4">
                        <span className="relative grid size-9 place-items-center rounded-full border bg-background font-mono text-xs font-semibold text-primary">
                           {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-2xl font-bold tracking-tight">{title}</h3>
                     </div>
                     <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {body}
                     </p>
                     <div className="mt-6">
                        <Visual />
                     </div>
                  </motion.li>
               ))}
            </motion.ol>
         </div>
      </section>
   );
}
