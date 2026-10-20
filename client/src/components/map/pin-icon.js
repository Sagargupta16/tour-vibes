import L from 'leaflet';

const PIN_PATH =
   '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" fill="currentColor" stroke="white" stroke-width="1.5"/><circle cx="12" cy="9" r="2.6" fill="white"/>';

// Leaflet's default marker points at PNGs a bundler does not copy, so the pin is
// an inline SVG divIcon that follows the theme through currentColor. index.css
// drops the svg in when the marker is created; delayMs staggers a batch of pins.
export const makePinIcon = (delayMs = 0) => {
   const delay = Math.round(Number(delayMs) || 0);
   return L.divIcon({
      className: 'tv-pin',
      html: `<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" style="animation-delay:${delay}ms">${PIN_PATH}</svg>`,
      iconSize: [32, 32],
      iconAnchor: [16, 30],
      popupAnchor: [0, -26]
   });
};

export const pinIcon = makePinIcon();

// Pulsing "you are here" dot for the locate control
export const meIcon = L.divIcon({
   className: 'tv-me',
   html: '<span class="tv-me-ring"></span><span class="tv-me-dot"></span>',
   iconSize: [18, 18],
   iconAnchor: [9, 9]
});
