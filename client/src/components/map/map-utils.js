// Leaflet-free helpers, so a page can sort out pins before the map chunk loads

export const hasPin = (post) =>
   Number.isFinite(post?.location?.lat) && Number.isFinite(post?.location?.lng);

export const placeOf = (location) => [location?.name, location?.country].filter(Boolean).join(', ');

// Leaflet takes a plain array of [lat, lng] points anywhere it wants bounds
export const boundsOf = (posts) => {
   const points = posts.filter(hasPin).map((p) => [p.location.lat, p.location.lng]);
   return points.length ? points : null;
};

export const shortDate = (value) =>
   value ? new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
