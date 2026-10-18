import { useEffect, useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { LocateFixed, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { geocode, round } from '@/lib/geocode';
import MapBase from './map-base';
import { pinIcon } from './pin-icon';

function ClickToPin({ onChange }) {
   useMapEvents({
      click: (e) => onChange({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) })
   });
   return null;
}

// Pans to the pin whenever it changes from outside the map (the Find button)
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

export default function LocationPicker({ value, onChange, query }) {
   const [finding, setFinding] = useState(false);
   const [flyTarget, setFlyTarget] = useState(null);

   const find = async () => {
      setFinding(true);
      try {
         const hit = await geocode(query);
         if (hit) {
            onChange(hit);
            setFlyTarget(hit);
         } else {
            toast.error(`No place found for "${query}"`);
         }
      } catch (err) {
         toast.error(err.message);
      }
      setFinding(false);
   };

   const center = value ? [value.lat, value.lng] : [20, 0];

   return (
      <div className="space-y-2">
         <MapBase center={center} zoom={value ? 10 : 1} className="h-48 w-full sm:h-56">
            <FixSize />
            <ClickToPin onChange={onChange} />
            <FollowPin value={flyTarget} />
            {value && (
               <Marker
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
            <span className="mr-auto">
               {value
                  ? `Pinned at ${value.lat}, ${value.lng}`
                  : 'Tap the map to pin this journal, or find the city'}
            </span>
            <Button
               type="button"
               variant="outline"
               size="sm"
               disabled={!query || finding}
               onClick={find}
            >
               <LocateFixed className="mr-1 h-3.5 w-3.5" />
               {finding ? 'Finding...' : 'Find city'}
            </Button>
            {value && (
               <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  Clear pin
               </Button>
            )}
         </div>
      </div>
   );
}
