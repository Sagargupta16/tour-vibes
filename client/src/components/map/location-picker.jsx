import { useEffect, useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { LoaderCircle, LocateFixed, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentPosition, geocode, round } from '@/lib/geocode';
import MapBase from './map-base';
import { pinIcon } from './pin-icon';

function ClickToPin({ onPick }) {
   useMapEvents({
      click: (e) => onPick({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) })
   });
   return null;
}

// Pans to the pin whenever it changes from outside the map (Find city, my location)
function FollowPin({ value }) {
   const map = useMap();
   useEffect(() => {
      if (value) map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 10));
   }, [map, value]);
   return null;
}

// The dialog animates in, so Leaflet measures the container mid-transition;
// re-measure once it has settled or the tiles render off-center
function FixSize() {
   const map = useMap();
   useEffect(() => {
      const timer = setTimeout(() => map.invalidateSize(), 300);
      return () => clearTimeout(timer);
   }, [map]);
   return null;
}

const actionClass = 'h-10 rounded-lg px-3 text-xs sm:h-8';

export default function LocationPicker({ value, onChange, query }) {
   const [busy, setBusy] = useState(null);
   const [flyTarget, setFlyTarget] = useState(null);
   // Bumped on a tap, a find or a locate (not a drag) so the pin drops in again
   const [drop, setDrop] = useState(0);

   const pick = (point, fly = false) => {
      onChange(point);
      setDrop((n) => n + 1);
      if (fly) setFlyTarget(point);
   };

   const find = async () => {
      setBusy('find');
      try {
         const hit = await geocode(query);
         if (hit) pick(hit, true);
         else toast.error(`No place found for "${query}"`);
      } catch (err) {
         toast.error(err.message);
      } finally {
         setBusy(null);
      }
   };

   const locate = async () => {
      setBusy('locate');
      try {
         const [lat, lng] = await currentPosition();
         pick({ lat, lng }, true);
      } catch (err) {
         toast.error(err.message);
      } finally {
         setBusy(null);
      }
   };

   const center = value ? [value.lat, value.lng] : [20, 0];

   return (
      <div className="space-y-2">
         <MapBase center={center} zoom={value ? 10 : 1} className="h-48 w-full sm:h-56">
            <FixSize />
            <ClickToPin onPick={(point) => pick(point)} />
            <FollowPin value={flyTarget} />
            {value && (
               <Marker
                  key={drop}
                  position={[value.lat, value.lng]}
                  icon={pinIcon}
                  draggable
                  eventHandlers={{
                     dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        onChange({ lat: round(lat), lng: round(lng) });
                     }
                  }}
               />
            )}
         </MapBase>
         <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="mr-auto basis-full font-mono tabular-nums sm:basis-auto">
               {value
                  ? `Pinned at ${value.lat}, ${value.lng}`
                  : 'Tap the map to pin this journal, or find the city'}
            </span>
            <Button
               type="button"
               variant="outline"
               size="sm"
               className={actionClass}
               disabled={!query || busy !== null}
               onClick={find}
            >
               {busy === 'find' ? (
                  <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" />
               ) : (
                  <LocateFixed className="mr-1 h-3.5 w-3.5" />
               )}
               {busy === 'find' ? 'Finding...' : 'Find city'}
            </Button>
            <Button
               type="button"
               variant="outline"
               size="sm"
               className={actionClass}
               disabled={busy !== null}
               onClick={locate}
            >
               {busy === 'locate' ? (
                  <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" />
               ) : (
                  <Navigation className="mr-1 h-3.5 w-3.5" />
               )}
               My location
            </Button>
            {value && (
               <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={actionClass}
                  onClick={() => onChange(null)}
               >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Clear pin
               </Button>
            )}
         </div>
      </div>
   );
}
