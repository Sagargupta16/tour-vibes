import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { imageUrl } from '@/lib/api';
import { placeOf } from './map-utils';

// Popup card for a pin: photo flush to the edges, title, place and a link. Colours
// sit on spans because Leaflet's own `.leaflet-container a` rule outranks a utility
// class on the link itself.
export default function JournalPopup({ post }) {
   const place = placeOf(post.location);

   return (
      <Link to={`/journals/${post._id}`} className="group block no-underline">
         {post.imageUrl && (
            <span className="block aspect-[16/10] overflow-hidden bg-muted">
               <img
                  src={imageUrl(post.imageUrl)}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
               />
            </span>
         )}
         <span className="block space-y-1 p-3.5">
            <span className="line-clamp-2 block text-sm leading-snug font-semibold text-popover-foreground">
               {post.title}
            </span>
            {place && (
               <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{place}</span>
               </span>
            )}
            <span className="flex items-center gap-1 pt-1 text-xs font-medium text-primary">
               Read journal
               <ArrowUpRight
                  className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
               />
            </span>
         </span>
      </Link>
   );
}
