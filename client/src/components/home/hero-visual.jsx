import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ease, spring } from '@/lib/motion';
import { MAP_H, MAP_W, arcPath, project, stopsFrom, toPercent } from './map-geo';
import WorldDotsLayer from './world-dots-layer';
import PhotoStack from './photo-stack';

// Timeline: each pin drops, then the dashed route flies to the next one
const PIN_GAP = 0.6;
const pinDelay = (i) => 0.35 + i * PIN_GAP;

function kmBetween(a, b) {
   const rad = Math.PI / 180;
   const dLat = (b.lat - a.lat) * rad;
   const dLng = (b.lng - a.lng) * rad;
   const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
   return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function Pin({ stop, point, index, active, onSelect }) {
   // Real journals link to their page; the fallback route is decoration only
   const Tag = stop.post ? Link : 'span';
   const linkProps = stop.post
      ? { to: `/journals/${stop.id}`, onFocus: onSelect }
      : { role: 'img' };

   return (
      <div className="absolute" style={toPercent(point)}>
         <motion.div
            initial={{ opacity: 0, y: -36, scale: 0.4 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring.bouncy, delay: pinDelay(index) }}
            className="relative -translate-x-1/2 -translate-y-full"
         >
            {active && (
               <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 size-10 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-primary"
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: ease.out }}
               />
            )}
            <Tag
               {...linkProps}
               onMouseEnter={onSelect}
               aria-label={stop.country ? `${stop.name}, ${stop.country}` : stop.name}
               className={cn(
                  'tv-hit block origin-bottom text-primary transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-110',
                  active && 'scale-110'
               )}
            >
               <svg
                  aria-hidden="true"
                  viewBox="0 0 24 30"
                  className="h-7 w-[22px] drop-shadow-[0_3px_3px_rgb(0_0_0/0.25)]"
               >
                  <path
                     d="M12 29C8.5 23 2 17.5 2 11a10 10 0 0 1 20 0c0 6.5-6.5 12-10 18Z"
                     fill="currentColor"
                     stroke="var(--background)"
                     strokeWidth="1.5"
                  />
                  <circle cx="12" cy="11" r="3.6" fill="var(--background)" />
               </svg>
            </Tag>
         </motion.div>
      </div>
   );
}

// The hero's world map: land dots, the most-loved journals pinned on it, a route
// drawn between them and a photo stack that follows the highlighted stop
export default function HeroVisual({ posts, status }) {
   const stops = useMemo(() => stopsFrom(posts), [posts]);
   const points = useMemo(() => stops.map((s) => project(s.lat, s.lng)), [stops]);
   const withPhotos = useMemo(
      () => stops.filter((s) => s.post?.imageUrl).map((s) => s.post),
      [stops]
   );
   const [active, setActive] = useState(0);
   const ready = status !== 'loading';
   const routeKey = stops.map((s) => s.id).join('|');
   const sample = !stops[0]?.post;
   const current = stops[active % stops.length];
   const totalKm = stops.slice(1).reduce((sum, s, i) => sum + kmBetween(stops[i], s), 0);

   // Once the route is drawn, the highlight walks from stop to stop
   useEffect(() => {
      if (!ready || stops.length < 2) return undefined;
      let timer;
      const start = setTimeout(
         () => {
            timer = setInterval(() => setActive((i) => (i + 1) % stops.length), 3600);
         },
         pinDelay(stops.length) * 1000 + 600
      );
      return () => {
         clearTimeout(start);
         clearInterval(timer);
      };
   }, [ready, stops.length, routeKey]);

   return (
      <div className="relative">
         <div className="relative">
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block w-full" aria-hidden="true">
               <motion.g
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: ease.out }}
               >
                  <WorldDotsLayer className="text-foreground/[0.13] dark:text-foreground/[0.16]" />
               </motion.g>
               {ready && (
                  <g key={routeKey}>
                     {points.slice(1).map((to, i) => {
                        const d = arcPath(points[i], to);
                        const delay = pinDelay(i) + 0.15;
                        return (
                           <g key={d}>
                              <mask id={`tv-hero-route-${i}`} maskUnits="userSpaceOnUse">
                                 <motion.path
                                    d={d}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="14"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.6, delay, ease: ease.inOut }}
                                 />
                              </mask>
                              <path
                                 d={d}
                                 fill="none"
                                 stroke="var(--primary)"
                                 strokeWidth="2.5"
                                 strokeLinecap="round"
                                 strokeDasharray="1 7"
                                 vectorEffect="non-scaling-stroke"
                                 mask={`url(#tv-hero-route-${i})`}
                              />
                           </g>
                        );
                     })}
                  </g>
               )}
            </svg>

            {ready &&
               stops.map((stop, i) => (
                  <Pin
                     key={`${routeKey}-${stop.id}`}
                     stop={stop}
                     point={points[i]}
                     index={i}
                     active={current?.id === stop.id}
                     onSelect={() => setActive(i)}
                  />
               ))}

            {/* Label for the highlighted stop, swapped as the highlight moves */}
            <AnimatePresence mode="wait">
               {ready && current && (
                  <motion.div
                     key={current.id}
                     initial={{ opacity: 0, y: 6, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.15 } }}
                     transition={{ ...spring.snappy, delay: 0.05 }}
                     style={toPercent(points[active % stops.length])}
                     aria-hidden="true"
                     className="pointer-events-none absolute z-10"
                  >
                     <div className="-translate-x-1/2 translate-y-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold whitespace-nowrap shadow-[0_6px_16px_-10px_rgb(0_0_0/0.45)]">
                        {current.name}
                        {current.country && (
                           <span className="ml-1.5 font-mono text-[10px] font-medium text-muted-foreground uppercase">
                              {current.country}
                           </span>
                        )}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* On lg the photo stack overhangs the bottom left, so the caption moves right */}
         <div className="mt-3 flex items-center justify-between gap-4 border-t pt-3 lg:justify-end lg:gap-8">
            <p className="tv-eyebrow">
               {stops.length} stops <span className="text-primary">/</span>{' '}
               {sample ? 'sample route' : 'most-loved route'}
            </p>
            {ready && (
               <p className="tv-eyebrow tabular-nums">
                  {Math.round(totalKm).toLocaleString('en-US')} km
               </p>
            )}
         </div>

         {withPhotos.length > 0 && (
            <PhotoStack
               posts={withPhotos}
               activeId={current?.post?._id}
               className="relative z-20 mx-auto mt-6 w-44 sm:w-52 lg:absolute lg:-bottom-20 lg:left-[3%] lg:mt-0 lg:w-56"
            />
         )}
      </div>
   );
}
