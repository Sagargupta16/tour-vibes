import { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { makePinIcon } from './pin-icon';
import JournalPopup from './journal-popup';

// Keeps an auto-panned popup clear of the count chip (top left) and the controls
// (top right)
const POPUP_OPTIONS = {
   minWidth: 240,
   maxWidth: 240,
   autoPanPaddingTopLeft: [16, 72],
   autoPanPaddingBottomRight: [72, 16]
};

const FLY_ZOOM = 9;

// One pin with its photo popup. The icon is made once per marker, so a bbox
// refetch never rebuilds the element and replays the drop; `active` only toggles a
// class. A new `focusN` (a list click) flies the map here, then opens the popup.
export default function JournalMarker({ post, index = 0, active, focusN = 0, onSelect, onClose }) {
   const map = useMap();
   const ref = useRef(null);
   const [icon] = useState(() => makePinIcon(Math.min(index, 20) * 35));
   const { lat, lng } = post.location;

   useEffect(() => {
      const marker = ref.current;
      if (!marker) return;
      marker.getElement()?.classList.toggle('is-active', Boolean(active));
      marker.setZIndexOffset(active ? 1000 : 0);
   }, [active]);

   // The focus a marker mounts with is old news: a pin that left the view on a pan
   // and comes back must not fly the map to itself again
   const handledFocus = useRef(focusN);

   useEffect(() => {
      const marker = ref.current;
      if (!focusN || focusN === handledFocus.current || !marker) return undefined;
      handledFocus.current = focusN;
      const open = () => marker.openPopup();
      map.once('moveend', open);
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), FLY_ZOOM), { duration: 0.9 });
      // A second click elsewhere before this fly lands must not open this popup
      return () => map.off('moveend', open);
   }, [focusN, map]);

   const handlers = useMemo(
      () => ({
         click: () => onSelect?.(post._id),
         popupclose: () => onClose?.(post._id)
      }),
      [onSelect, onClose, post._id]
   );

   return (
      <Marker
         ref={ref}
         position={[lat, lng]}
         icon={icon}
         title={post.title}
         alt={post.title}
         eventHandlers={handlers}
      >
         <Popup className="tv-popup" {...POPUP_OPTIONS}>
            <JournalPopup post={post} />
         </Popup>
      </Marker>
   );
}
