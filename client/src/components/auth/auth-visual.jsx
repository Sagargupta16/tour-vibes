import { motion } from 'framer-motion';
import { Heart, MapPin, MapPinned, Mountain } from 'lucide-react';
import { ease, fadeUp, spring, stagger } from '@/lib/motion';

// Topographic contour rings: a closed wobbly ellipse per radius. Neighbouring
// rings share almost the same phase, so they nest instead of crossing.
const ring = (cx, cy, r, phase) => {
   const steps = 72;
   let d = '';
   for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const k = 1 + 0.05 * Math.sin(a * 3 + phase) + 0.03 * Math.sin(a * 5 + phase * 2);
      const x = cx + Math.cos(a) * r * k;
      const y = cy + Math.sin(a) * r * 0.78 * k;
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
   }
   return `${d}Z`;
};

const CONTOURS = [
   ...Array.from({ length: 9 }, (_, i) => ring(116, 130, 22 + i * 24, 0.6 + i * 0.12)),
   ...Array.from({ length: 8 }, (_, i) => ring(392, 390, 18 + i * 24, 2.2 + i * 0.1))
];

// Kept in the top 60% of the panel: the caption card covers the bottom
const ROUTE = 'M104 120 C180 50 296 92 330 196 C354 272 300 300 236 340';

// The middle label sits left of its pin so a narrow panel never crops it
const PINS = [
   { x: 104, y: 120, name: 'KYOTO', coords: '35.01N 135.77E', delay: 0.3, left: false },
   { x: 330, y: 196, name: 'LISBON', coords: '38.72N 9.14W', delay: 1.25, left: true },
   { x: 236, y: 340, name: 'CUSCO', coords: '13.53S 71.97W', delay: 2.05, left: false }
];

const PIN_PATH = 'M0 0C-2-6-9-10-9-17A9 9 0 1 1 9-17C9-10 2-6 0 0Z';
const PLANE_PATH =
   'M11 0L4-1.6-1-9H-3.6L-.6-1.6H-6.5L-9-4.6H-10.6L-9.2 0-10.6 4.6H-9L-6.5 1.6H-.6L-3.6 9H-1L4 1.6Z';

function Pin({ x, y, name, coords, delay, left }) {
   const labelX = left ? -132 : 14;
   return (
      <g transform={`translate(${x} ${y})`}>
         <motion.g
            initial={{ opacity: 0, y: -22, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring.bouncy, delay }}
         >
            <ellipse cx="0" cy="0" rx="6" ry="2" className="fill-foreground/20" />
            <path d={PIN_PATH} className="fill-primary" />
            <circle cx="0" cy="-17" r="3.4" className="fill-primary-foreground" />
            <rect
               x={labelX}
               y="-34"
               width="118"
               height="28"
               rx="8"
               className="fill-card stroke-border"
            />
            <text
               x={labelX + 10}
               y="-16"
               className="fill-foreground font-mono text-[10px] font-semibold"
            >
               {name}
               <tspan dx="6" className="fill-muted-foreground font-normal">
                  {coords}
               </tspan>
            </text>
         </motion.g>
      </g>
   );
}

// The travel panel beside the auth forms on desktop: contour map, a route that
// draws itself between three pins, and a plane that keeps flying it
export default function AuthVisual() {
   return (
      <div className="relative h-full min-h-[560px] overflow-hidden rounded-2xl border bg-muted/30">
         <svg
            viewBox="0 0 480 600"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 size-full"
            aria-hidden="true"
         >
            <g fill="none" className="stroke-foreground/[0.09]" strokeWidth="1">
               {CONTOURS.map((d, i) => (
                  <motion.path
                     key={d}
                     d={d}
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1 }}
                     transition={{ duration: 1.4, delay: (i % 9) * 0.06, ease: ease.out }}
                  />
               ))}
            </g>
            <path
               d={ROUTE}
               fill="none"
               strokeWidth="2"
               strokeDasharray="1 7"
               strokeLinecap="round"
               className="stroke-foreground/30"
            />
            <motion.path
               d={ROUTE}
               fill="none"
               strokeWidth="2.5"
               strokeLinecap="round"
               className="stroke-primary"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: 1 }}
               transition={{ duration: 1.8, delay: 0.35, ease: ease.inOut }}
            />
            {PINS.map((pin) => (
               <Pin key={pin.name} {...pin} />
            ))}
            <motion.g
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 2.3, duration: 0.4 }}
            >
               <g>
                  <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path={ROUTE} />
                  <animate
                     attributeName="opacity"
                     values="0;1;1;0"
                     keyTimes="0;0.08;0.9;1"
                     dur="9s"
                     repeatCount="indefinite"
                  />
                  <path d={PLANE_PATH} className="fill-foreground" />
               </g>
            </motion.g>
         </svg>

         <motion.div
            variants={stagger(0.08, 0.9)}
            initial="hidden"
            animate="show"
            className="absolute inset-x-0 bottom-0 space-y-4 p-6 xl:p-8"
         >
            <motion.p
               variants={fadeUp}
               className="font-mono text-[11px] font-medium tracking-[0.14em] text-primary uppercase"
            >
               Field notes / 3 stops
            </motion.p>
            <motion.h2
               variants={fadeUp}
               className="max-w-sm text-3xl leading-tight font-semibold tracking-tight text-balance"
            >
               Pin the places that changed you.
            </motion.h2>
            <motion.div
               variants={fadeUp}
               className="flex items-center gap-4 rounded-xl border bg-card p-3.5"
            >
               <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Mountain className="size-6" aria-hidden="true" />
               </span>
               <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Sunrise above Fushimi Inari</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                     <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        Kyoto, Japan
                     </span>
                     <span className="flex items-center gap-1 tabular-nums">
                        <Heart className="size-3.5" aria-hidden="true" />
                        24
                     </span>
                  </p>
               </div>
               <span className="hidden items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase xl:flex">
                  <MapPinned className="size-3 text-primary" aria-hidden="true" />
                  Pinned
               </span>
            </motion.div>
         </motion.div>
      </div>
   );
}
