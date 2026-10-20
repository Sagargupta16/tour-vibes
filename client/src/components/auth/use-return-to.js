import { useLocation } from 'react-router-dom';

const AUTH_PAGES = new Set(['/login', '/signup']);

// Where to go after signing in: the page that sent the user here (ProtectedRoute
// passes state.from as a location, a link may pass a plain path), else the feed.
// Only same-app paths count, so state can never redirect off the site.
export default function useReturnTo(fallback = '/journals') {
   const { state } = useLocation();
   const from = state?.from;
   const path =
      typeof from === 'string'
         ? from
         : `${from?.pathname ?? ''}${from?.search ?? ''}${from?.hash ?? ''}`;
   if (!path.startsWith('/') || path.startsWith('//')) return fallback;
   if (AUTH_PAGES.has(path.split(/[?#]/)[0])) return fallback;
   return path;
}
