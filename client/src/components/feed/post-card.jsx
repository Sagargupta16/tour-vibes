import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Mountain, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { imageUrl } from '@/lib/api';
import { lift } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { cardMotion } from './card-motion';
import { hasLiked, initialOf, placeOf, shortDate, tagHref, travelerHref } from './format';

const MAX_TAGS = 3;

// Small links inside the card get a 44px hit area (tv-hit) and sit above the
// stretched title link (z-10)
const HIT = 'tv-hit z-10';

function Author({ person }) {
   const href = travelerHref(person);
   const body = (
      <>
         <Avatar size="sm">
            {person?.avatar && <AvatarImage src={imageUrl(person.avatar)} alt="" />}
            <AvatarFallback>{initialOf(person?.name)}</AvatarFallback>
         </Avatar>
         <span className="truncate font-medium text-foreground/90">
            {person?.name || 'Traveler'}
         </span>
      </>
   );
   if (!href) return <span className="flex min-w-0 items-center gap-2">{body}</span>;
   return (
      <Link to={href} className={cn(HIT, 'flex min-w-0 items-center gap-2 hover:text-foreground')}>
         {body}
      </Link>
   );
}

// `index` staggers the entrance; `ref` lets AnimatePresence popLayout measure the card
export default function PostCard({ post, editable, onEdit, onDelete, index = 0, ref }) {
   const location = useLocation();
   const { userId } = useAuth();
   const src = imageUrl(post.imageUrl);
   // Tied to the src, so a replaced photo fades in again instead of popping in
   const [photoState, setPhotoState] = useState({ src: null, status: 'loading' });
   const photo = photoState.src === src ? photoState.status : 'loading';
   const showPhoto = Boolean(src) && photo !== 'error';
   const place = placeOf(post.location);
   const tags = post.tags ?? [];
   const likes = post.likes?.length ?? 0;
   const liked = hasLiked(post.likes, userId);

   return (
      <motion.div
         ref={ref}
         layout="position"
         custom={index}
         variants={cardMotion}
         initial="hidden"
         animate="show"
         exit="exit"
         className="h-full"
      >
         <motion.article
            {...lift}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground transition-colors duration-300 hover:border-primary/45"
         >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
               {showPhoto ? (
                  <img
                     key={src}
                     src={src}
                     alt=""
                     loading="lazy"
                     decoding="async"
                     onLoad={() => setPhotoState({ src, status: 'loaded' })}
                     onError={() => setPhotoState({ src, status: 'error' })}
                     className={cn(
                        'size-full object-cover transition-[opacity,scale] duration-700 ease-out group-hover:scale-105',
                        photo === 'loaded' ? 'opacity-100' : 'opacity-0'
                     )}
                  />
               ) : (
                  <div className="grid size-full place-items-center bg-muted text-muted-foreground/50">
                     <Mountain className="size-12" strokeWidth={1.25} />
                  </div>
               )}
               {place && (
                  <>
                     <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                     <span className="absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{place}</span>
                     </span>
                  </>
               )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
               <div className="space-y-1.5">
                  <h3 className="text-base leading-snug font-semibold tracking-tight text-balance">
                     {/* The ::after stretches this link over the whole card */}
                     <Link
                        to={`/journals/${post._id}`}
                        state={{ from: location }}
                        className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                     >
                        {post.title}
                     </Link>
                  </h3>
                  <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
                     {post.content}
                  </p>
               </div>

               {tags.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                     {tags.slice(0, MAX_TAGS).map((tag) => (
                        <li key={tag}>
                           <Link
                              to={tagHref(tag)}
                              className={cn(
                                 HIT,
                                 'inline-flex h-7 items-center rounded-full bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                              )}
                           >
                              #{tag}
                           </Link>
                        </li>
                     ))}
                     {tags.length > MAX_TAGS && (
                        <li className="inline-flex h-7 items-center px-1 text-xs text-muted-foreground">
                           +{tags.length - MAX_TAGS}
                        </li>
                     )}
                  </ul>
               )}

               <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <Author person={post.creator} />
                  <span aria-hidden>&middot;</span>
                  <time dateTime={post.createdAt} className="shrink-0">
                     {shortDate(post.createdAt)}
                  </time>
                  <span
                     className="ml-auto inline-flex shrink-0 items-center gap-1 tabular-nums"
                     aria-label={`${likes} likes`}
                  >
                     <Heart
                        className={cn('size-3.5', liked && 'fill-rose-500 text-rose-500')}
                        aria-hidden
                     />
                     {likes}
                  </span>
               </div>
            </div>

            {editable && (
               <div className="relative z-10 grid grid-cols-2 border-t">
                  <Button
                     variant="ghost"
                     className="h-11 rounded-none"
                     onClick={() => onEdit?.(post)}
                  >
                     <Pencil />
                     Edit
                  </Button>
                  <Button
                     variant="ghost"
                     className="h-11 rounded-none border-l text-destructive hover:bg-destructive/10 hover:text-destructive"
                     onClick={() => onDelete?.(post._id)}
                  >
                     <Trash2 />
                     Delete
                  </Button>
               </div>
            )}
         </motion.article>
      </motion.div>
   );
}
