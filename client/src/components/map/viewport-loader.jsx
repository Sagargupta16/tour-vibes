import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { boundsOf } from './map-utils';

// First load fetches every pin and flies the map out to fit them; after that each
// pan or zoom refetches only what is inside the visible box. onAll gets the bounds
// of the full set once (null when there are no pins or the load failed), for the
// fit-all control. Pass a stable onAll: a new one reloads everything.
export default function ViewportLoader({ load, onAll }) {
   const map = useMap();
   // moveend can fire while the first load runs; it must not abort that load
   const ready = useRef(false);

   useEffect(() => {
      const first = async () => {
         try {
            const posts = await load();
            // null: aborted by a newer first load (a remount), which reports instead
            if (posts === null) return;
            ready.current = true;
            const bounds = boundsOf(posts);
            onAll?.(bounds);
            if (bounds) {
               map.flyToBounds(bounds, { padding: [56, 56], maxZoom: 6, duration: 1.2 });
            }
         } catch (err) {
            ready.current = true;
            onAll?.(null);
            toast.error(err.message, { id: 'map-load' });
         }
      };
      void first();
   }, [load, map, onAll]);

   useMapEvents({
      moveend: async () => {
         if (!ready.current) return;
         try {
            await load(map.getBounds().toBBoxString());
         } catch (err) {
            // One toast for a run of failed pans, not one per pan
            toast.error(err.message, { id: 'map-load' });
         }
      }
   });

   return null;
}
