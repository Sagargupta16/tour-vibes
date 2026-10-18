import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { imageUrl } from '@/lib/api';
import useMapPosts from '@/hooks/use-map-posts';
import MapBase from '@/components/map/map-base';
import { pinIcon } from '@/components/map/pin-icon';
import PageTransition from '@/components/shared/page-transition';

// First load fetches every pin and fits the map to them; after that each pan or
// zoom refetches only what is inside the visible box.
function ViewportLoader({ load }) {
   const map = useMap();
   // moveend can fire while the first load runs; it must not abort that load
   const ready = useRef(false);

   useEffect(() => {
      load()
         .then((posts) => {
            ready.current = true;
            if (posts?.length) {
               map.fitBounds(
                  posts.map((p) => [p.location.lat, p.location.lng]),
                  { padding: [40, 40], maxZoom: 6 }
               );
            }
         })
         .catch((err) => {
            ready.current = true;
            toast.error(err.message);
         });
   }, [load, map]);

   useMapEvents({
      moveend: () => {
         if (!ready.current) return;
         load(map.getBounds().toBBoxString()).catch((err) => toast.error(err.message));
      }
   });
   return null;
}

function JournalMarker({ post }) {
   const { lat, lng, name, country } = post.location;
   return (
      <Marker position={[lat, lng]} icon={pinIcon} title={post.title}>
         <Popup minWidth={200} maxWidth={240}>
            <Link to={`/journals/${post._id}`} className="block text-inherit no-underline">
               <img
                  src={imageUrl(post.imageUrl)}
                  alt={post.title}
                  className="mb-2 aspect-video w-full rounded object-cover"
               />
               <span className="block text-sm font-semibold leading-tight">{post.title}</span>
               {name && (
                  <span className="mt-0.5 block text-xs opacity-70">
                     {name}
                     {country ? `, ${country}` : ''}
                  </span>
               )}
            </Link>
         </Popup>
      </Marker>
   );
}

export default function MapPage() {
   const { posts, truncated, loading, load } = useMapPosts();

   return (
      <PageTransition>
         <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
               <div>
                  <h1 className="text-2xl font-bold">Journal Map</h1>
                  <p className="text-sm text-muted-foreground">
                     Every pinned journal from the community. Pan or zoom to load what is in view.
                  </p>
               </div>
               <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {loading ? 'Loading...' : `${posts.length}${truncated ? '+' : ''} in view`}
               </span>
            </div>
            <MapBase
               center={[20, 0]}
               zoom={2}
               minZoom={2}
               className="h-[65dvh] min-h-[360px] w-full"
            >
               <ViewportLoader load={load} />
               {posts.map((post) => (
                  <JournalMarker key={post._id} post={post} />
               ))}
            </MapBase>
         </div>
      </PageTransition>
   );
}
