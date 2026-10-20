// One lookup per button press against OpenStreetMap's Nominatim, which allows
// light, user-triggered use (no autocomplete). Returns { lat, lng } or null.
export async function geocode(query) {
   const q = String(query ?? '').trim();
   if (!q) return null;
   const params = new URLSearchParams({ q, format: 'jsonv2', limit: '1' });
   const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { Accept: 'application/json' }
   });
   if (!res.ok) throw new Error(`Place lookup failed (${res.status})`);
   const [hit] = await res.json();
   if (!hit) return null;
   return { lat: round(Number(hit.lat)), lng: round(Number(hit.lon)) };
}

// 5 decimals is about 1 m, plenty for a travel pin
export const round = (value) => Math.round(value * 1e5) / 1e5;

const POSITION_ERRORS = {
   1: 'Location permission was denied',
   2: 'Your location is not available right now',
   3: 'Finding your location timed out'
};

// The browser's position as [lat, lng] for the map's locate control. Needs a
// secure origin (https or localhost) and the user's permission.
export async function currentPosition() {
   if (!('geolocation' in navigator)) {
      throw new Error('This browser cannot share its location');
   }
   try {
      const pos = await new Promise((resolve, reject) => {
         navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
         });
      });
      return [round(pos.coords.latitude), round(pos.coords.longitude)];
   } catch (err) {
      throw new Error(POSITION_ERRORS[err?.code] || 'Could not find your location');
   }
}
