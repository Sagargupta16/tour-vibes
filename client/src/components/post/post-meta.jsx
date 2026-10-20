import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
   initialOf,
   placeOf,
   shortDate,
   tagHref,
   travelMonth,
   travelerHref
} from '@/components/feed/format';
import { imageUrl } from '@/lib/api';
import { fadeUp } from '@/lib/motion';

const chip =
   'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium text-muted-foreground';

// Author, dates and place, then the tags as links back into the filtered feed
export default function PostMeta({ post }) {
   const author = post.creator;
   const href = travelerHref(author);
   const place = placeOf(post.location);
   const name = author?.name || 'Traveler';

   const avatar = (
      <Avatar className="size-11">
         {author?.avatar && <AvatarImage src={imageUrl(author.avatar)} alt="" />}
         <AvatarFallback>{initialOf(author?.name)}</AvatarFallback>
      </Avatar>
   );

   return (
      <motion.div variants={fadeUp} className="space-y-4">
         <div className="flex items-center gap-3">
            {href ? (
               <Link to={href} aria-label={`${name}'s journals`} className="rounded-full">
                  {avatar}
               </Link>
            ) : (
               avatar
            )}
            <div className="min-w-0">
               {href ? (
                  <Link to={href} className="font-medium hover:underline">
                     {name}
                  </Link>
               ) : (
                  <p className="font-medium">{name}</p>
               )}
               <p className="text-sm text-muted-foreground">
                  Published <time dateTime={post.createdAt}>{shortDate(post.createdAt)}</time>
               </p>
            </div>
         </div>

         {(post.travelDate || place) && (
            <div className="flex flex-wrap gap-2">
               {post.travelDate && (
                  <span className={chip}>
                     <CalendarDays className="size-3.5" />
                     Traveled {travelMonth(post.travelDate)}
                  </span>
               )}
               {place && (
                  <span className={chip}>
                     <MapPin className="size-3.5" />
                     {place}
                  </span>
               )}
            </div>
         )}

         {post.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
               {post.tags.map((tag) => (
                  <li key={tag}>
                     <Link
                        to={tagHref(tag)}
                        className="inline-flex h-11 items-center rounded-full sm:h-9 bg-secondary px-3.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                     >
                        #{tag}
                     </Link>
                  </li>
               ))}
            </ul>
         )}
      </motion.div>
   );
}
