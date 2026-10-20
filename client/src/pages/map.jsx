import { useCallback, useState } from 'react';
import { Marker } from 'react-leaflet';
import { toast } from 'sonner';
import { currentPosition } from '@/lib/geocode';
import useMapPosts from '@/hooks/use-map-posts';
import MapBase from '@/components/map/map-base';
import JournalMarker from '@/components/map/journal-marker';
import MapControls from '@/components/map/map-controls';
import MapCountChip from '@/components/map/map-count-chip';
import MapJournalList from '@/components/map/map-journal-list';
import ViewportLoader from '@/components/map/viewport-loader';
import { meIcon } from '@/components/map/pin-icon';
import PageTransition from '@/components/shared/page-transition';

const WORLD = { center: [20, 0], zoom: 2 };

// Full-height journal map, open to everyone. Phones: map on top, a card rail under
// it. Desktop: the list of journals in view beside the map. A card flies the map to
// its pin; a pin highlights its card.
export default function MapPage() {
   const { posts, truncated, loading, error, load } = useMapPosts();
   const [map, setMap] = useState(null);
   const [ready, setReady] = useState(false);
   const [allBounds, setAllBounds] = useState(null);
   const [selectedId, setSelectedId] = useState(null);
   // n changes on every card click, so picking the same card again flies again
   const [focus, setFocus] = useState({ id: null, n: 0 });
   const [me, setMe] = useState(null);
   const [locating, setLocating] = useState(false);

   const handleAll = useCallback((bounds) => {
      setAllBounds(bounds);
      setReady(true);
   }, []);

   const handleClose = useCallback(
      (id) => setSelectedId((current) => (current === id ? null : current)),
      []
   );

   const focusJournal = useCallback((post) => {
      setSelectedId(post._id);
      setFocus((f) => ({ id: post._id, n: f.n + 1 }));
   }, []);

   const fitAll = () => {
      if (!map) return;
      if (allBounds) map.flyToBounds(allBounds, { padding: [56, 56], maxZoom: 6, duration: 1 });
      else map.flyTo(WORLD.center, WORLD.zoom, { duration: 1 });
   };

   const locate = async () => {
      setLocating(true);
      try {
         const here = await currentPosition();
         setMe(here);
         map?.flyTo(here, Math.max(map.getZoom(), 11), { duration: 1.1 });
      } catch (err) {
         toast.error(err.message);
      } finally {
         setLocating(false);
      }
   };

   return (
      <PageTransition>
         <title>Journal map | Tour Vibes</title>
         <div className="flex h-[calc(100dvh-4rem-1px)] min-h-[520px] flex-col lg:flex-row">
            <aside className="order-2 flex shrink-0 flex-col border-t bg-background lg:order-1 lg:w-[23rem] lg:border-t-0 lg:border-r">
               <div className="lg:px-5 lg:pt-6 lg:pb-4">
                  <p className="hidden font-mono text-[11px] font-medium tracking-[0.14em] text-primary uppercase lg:block">
                     Explore
                  </p>
                  <h1 className="sr-only lg:not-sr-only lg:mt-2 lg:text-2xl lg:font-semibold lg:tracking-tight">
                     Journal map
                  </h1>
                  <p className="hidden text-sm text-pretty text-muted-foreground lg:mt-1 lg:block">
                     Every pinned journal from the community. Pan or zoom and the list follows the
                     map.
                  </p>
               </div>
               <MapJournalList
                  posts={posts}
                  ready={ready}
                  selectedId={selectedId}
                  onSelect={focusJournal}
                  onFitAll={fitAll}
               />
            </aside>

            <div className="relative order-1 min-h-0 flex-1 lg:order-2">
               <MapBase
                  ref={setMap}
                  center={WORLD.center}
                  zoom={WORLD.zoom}
                  minZoom={2}
                  zoomControl={false}
                  className="absolute inset-0 rounded-none ring-0"
               >
                  <ViewportLoader load={load} onAll={handleAll} />
                  {posts.map((post, i) => (
                     <JournalMarker
                        key={post._id}
                        post={post}
                        index={i}
                        active={post._id === selectedId}
                        focusN={focus.id === post._id ? focus.n : 0}
                        onSelect={setSelectedId}
                        onClose={handleClose}
                     />
                  ))}
                  {me && (
                     <Marker position={me} icon={meIcon} interactive={false} keyboard={false} />
                  )}
               </MapBase>

               {/* Chip left, controls right: the chip truncates before it can reach them */}
               <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
                  <MapCountChip
                     ready={ready}
                     loading={loading}
                     error={error}
                     count={posts.length}
                     truncated={truncated}
                  />
                  <MapControls
                     map={map}
                     locating={locating}
                     onLocate={locate}
                     onFitAll={fitAll}
                     className="shrink-0"
                  />
               </div>
            </div>
         </div>
      </PageTransition>
   );
}
