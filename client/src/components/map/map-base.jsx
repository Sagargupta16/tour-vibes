import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { cn } from '@/lib/utils';

// Shared map shell: OpenStreetMap tiles with the required attribution. The
// `isolate` class keeps Leaflet's own z-indexes below the sticky header.
export default function MapBase({ className, children, ...props }) {
   return (
      <MapContainer
         className={cn('tv-map isolate z-0 rounded-xl ring-1 ring-foreground/10', className)}
         worldCopyJump
         {...props}
      >
         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
         />
         {children}
      </MapContainer>
   );
}
