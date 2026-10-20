import { motion } from 'framer-motion';
import { LoaderCircle, LocateFixed, Maximize, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const groupClass =
   'pointer-events-auto flex flex-col divide-y overflow-hidden rounded-xl border bg-card shadow-sm';

function ControlButton({ label, onClick, disabled, children }) {
   return (
      <motion.button
         type="button"
         aria-label={label}
         title={label}
         onClick={onClick}
         disabled={disabled}
         whileTap={{ scale: 0.96 }}
         className="grid size-11 place-items-center text-foreground transition-colors duration-150 outline-none hover:bg-muted focus-visible:bg-muted disabled:opacity-60"
      >
         {children}
      </motion.button>
   );
}

// Zoom, locate-me and fit-all as 44px targets in two flat groups. Leaflet's own
// zoom control is off on this map: its 30px buttons are too small for a thumb.
export default function MapControls({ map, locating, onLocate, onFitAll, className }) {
   return (
      <div className={cn('pointer-events-none flex flex-col gap-2', className)}>
         <div className={groupClass}>
            <ControlButton label="Zoom in" onClick={() => map?.zoomIn()} disabled={!map}>
               <Plus className="size-4" aria-hidden="true" />
            </ControlButton>
            <ControlButton label="Zoom out" onClick={() => map?.zoomOut()} disabled={!map}>
               <Minus className="size-4" aria-hidden="true" />
            </ControlButton>
         </div>
         <div className={groupClass}>
            <ControlButton label="Show my location" onClick={onLocate} disabled={!map || locating}>
               {locating ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
               ) : (
                  <LocateFixed className="size-4" aria-hidden="true" />
               )}
            </ControlButton>
            <ControlButton label="Fit all journals" onClick={onFitAll} disabled={!map}>
               <Maximize className="size-4" aria-hidden="true" />
            </ControlButton>
         </div>
      </div>
   );
}
