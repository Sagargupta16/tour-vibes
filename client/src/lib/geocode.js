// One lookup per button press against OpenStreetMap's Nominatim, which allows
// light, user-triggered use (no autocomplete). Returns { lat, lng } or null.
export async function geocode(query) {
   const params = new URLSearchParams({ q: query, format: 'jsonv2', limit: '1' });
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
