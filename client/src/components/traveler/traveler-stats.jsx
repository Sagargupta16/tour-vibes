import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpenText, Heart, MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ease, fadeUp, stagger } from '@/lib/motion';

// Counts up from 0 on mount and glides to any new value (load more). The motion
// value renders straight into the span, so the count never re-renders React.
function CountUp({ value }) {
   const count = useMotionValue(0);
   const text = useTransform(count, (v) => Math.round(v).toLocaleString('en-US'));

   useEffect(() => {
      const controls = animate(count, value, { duration: 1, ease: ease.out });
      return () => controls.stop();
   }, [count, value]);

   return <motion.span>{text}</motion.span>;
}

function Stat({ icon: Icon, label, value, partial }) {
   return (
      <motion.div variants={fadeUp} className="rounded-xl border bg-card p-3.5 sm:p-5">
         <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase sm:text-[11px]">
            <Icon className="size-3.5 text-primary" aria-hidden="true" />
            {label}
         </div>
         <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
            <CountUp value={value} />
            {partial && <span className="text-muted-foreground">+</span>}
         </p>
      </motion.div>
   );
}

// Journals is the server's total; places and likes come from the journals loaded
// so far, so they carry a "+" until every journal is in
export default function TravelerStats({ journals, places, likes, partial, className }) {
   return (
      <motion.div
         variants={stagger(0.07, 0.15)}
         initial="hidden"
         animate="show"
         className={cn('grid grid-cols-3 gap-2.5 sm:gap-4', className)}
      >
         <Stat icon={BookOpenText} label="Journals" value={journals} />
         <Stat icon={MapPinned} label="Places" value={places} partial={partial} />
         <Stat icon={Heart} label="Likes" value={likes} partial={partial} />
      </motion.div>
   );
}
