import { Marker } from 'react-leaflet';
import MapBase from './map-base';
import { pinIcon } from './pin-icon';

// Small read-only map under a single journal that has a pin
export default function PostLocationMap({ lat, lng }) {
   return (
      <MapBase center={[lat, lng]} zoom={9} scrollWheelZoom={false} className="h-56 w-full sm:h-72">
         <Marker position={[lat, lng]} icon={pinIcon} />
      </MapBase>
   );
}
