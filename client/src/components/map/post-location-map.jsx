import L from 'leaflet';
import { Marker } from 'react-leaflet';
import MapBase from './map-base';
import { pinIcon } from './pin-icon';

// Small read-only map under a single journal that has a pin. On a phone one finger
// scrolls the page instead of panning the map (pinch still zooms), so the map is
// never a scroll trap halfway down a journal.
export default function PostLocationMap({ lat, lng }) {
   return (
      <MapBase
         center={[lat, lng]}
         zoom={9}
         scrollWheelZoom={false}
         dragging={!L.Browser.mobile}
         className="h-56 w-full sm:h-72"
      >
         <Marker position={[lat, lng]} icon={pinIcon} />
      </MapBase>
   );
}
