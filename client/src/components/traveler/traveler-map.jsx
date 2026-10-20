import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import MapBase from '@/components/map/map-base';
import JournalMarker from '@/components/map/journal-marker';
import { boundsOf } from '@/components/map/map-utils';

// Starts on the whole world and flies in to frame the traveler's pins
function FitPins({ posts }) {
   const map = useMap();
   useEffect(() => {
      const bounds = boundsOf(posts);
      if (bounds) map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 8, duration: 1.2 });
   }, [map, posts]);
   return null;
}

// Lazy-loaded by the traveler page, so Leaflet only downloads for travelers with
// pins. One finger scrolls the page on a phone; pinch still zooms.
export default function TravelerMap({ posts }) {
   return (
      <MapBase
         center={[20, 0]}
         zoom={2}
         minZoom={1}
         scrollWheelZoom={false}
         dragging={!L.Browser.mobile}
         className="h-64 w-full sm:h-96"
      >
         <FitPins posts={posts} />
         {posts.map((post, i) => (
            <JournalMarker key={post._id} post={post} index={i} />
         ))}
      </MapBase>
   );
}
