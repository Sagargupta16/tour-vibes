import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CloudOff, Compass, MapPinOff, Pencil, RotateCw, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { api, imageUrl } from '@/lib/api';
import { fadeUp, reveal, stagger } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { placeOf } from '@/components/feed/format';
import PostForm from '@/components/feed/post-form';
import CommentList from '@/components/post/comment-list';
import ConfirmDialog from '@/components/post/confirm-dialog';
import LikeButton from '@/components/post/like-button';
import PhotoLightbox from '@/components/post/photo-lightbox';
import PostHero from '@/components/post/post-hero';
import PostMeta from '@/components/post/post-meta';
import ShareButton from '@/components/post/share-button';
import EmptyState from '@/components/shared/empty-state';
import PageTransition from '@/components/shared/page-transition';
import SkeletonPost from '@/components/shared/skeleton-post';

const PostLocationMap = lazy(() => import('@/components/map/post-location-map'));

// Lists that link here pass { from: location }; going back keeps their filters
const BACK_LABELS = { '/journals': 'Journals', '/myjournals': 'My journals', '/map': 'Map' };
const backOf = (from) => {
   const path = from?.pathname;
   const to = { pathname: path, search: from?.search ?? '' };
   if (path?.startsWith('/travelers/')) return { to, label: 'Traveler', known: true };
   if (BACK_LABELS[path]) return { to, label: BACK_LABELS[path], known: true };
   return { to: '/journals', label: 'Journals', known: false };
};

const roundBtn = 'h-11 rounded-full px-4';

export default function SinglePost() {
   const { postId } = useParams();
   const location = useLocation();
   const navigate = useNavigate();
   const { userId } = useAuth();
   const [version, setVersion] = useState(0);
   const [state, setState] = useState({ key: null, post: null, error: null });
   const [lightbox, setLightbox] = useState(false);
   const [editing, setEditing] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const requestKey = `${postId}#${version}`;
   const back = backOf(location.state?.from);

   useEffect(() => {
      const controller = new AbortController();
      const load = async () => {
         try {
            const data = await api.get(`/feed/post/${postId}`, { signal: controller.signal });
            if (!controller.signal.aborted)
               setState({ key: requestKey, post: data.post, error: null });
         } catch (err) {
            if (controller.signal.aborted || err.name === 'AbortError') return;
            setState({ key: requestKey, post: null, error: err });
         }
      };
      void load();
      return () => controller.abort();
   }, [postId, requestKey]);

   if (state.key !== requestKey) return <SkeletonPost />;

   const { post, error } = state;
   if (!post) {
      // 400 is a malformed id, 404 a deleted journal; anything else may be temporary
      const missing = !error || error.status === 404 || error.status === 400;
      return (
         <PageTransition>
            <EmptyState
               className="py-24"
               icon={missing ? MapPinOff : CloudOff}
               title={missing ? 'This journal is gone' : 'This journal could not be loaded'}
               description={missing ? 'It may have been deleted by its author.' : error.message}
               action={
                  missing ? (
                     <Link to="/journals" className={cn(buttonVariants(), roundBtn)}>
                        <Compass />
                        Browse journals
                     </Link>
                  ) : (
                     <Button
                        variant="outline"
                        className={roundBtn}
                        onClick={() => setVersion((v) => v + 1)}
                     >
                        <RotateCw />
                        Try again
                     </Button>
                  )
               }
            />
         </PageTransition>
      );
   }

   const isOwner = Boolean(userId) && post.creator?._id === userId;
   const hasPin = post.location?.lat != null && post.location?.lng != null;
   const place = placeOf(post.location);

   const handleUpdate = async (formData) => {
      const data = await api.put(`/feed/post/${post._id}`, formData);
      setState((s) => ({ ...s, post: data.post }));
   };

   const handleDelete = async () => {
      await api.delete(`/feed/post/${post._id}`);
      toast.success('Journal deleted');
      // Back to the list it was opened from, else to the owner's own journals
      navigate(back.known ? back.to : '/myjournals', { replace: true });
   };

   return (
      <PageTransition>
         <article>
            <PostHero post={post} back={back} onOpenPhoto={() => setLightbox(true)} />

            <motion.div
               variants={stagger(0.08, 0.25)}
               initial="hidden"
               animate="show"
               className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:py-10"
            >
               <PostMeta post={post} />

               <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap items-center gap-2 border-y py-3"
               >
                  <LikeButton
                     key={`${post._id}-${userId ?? 'guest'}`}
                     postId={post._id}
                     likes={post.likes || []}
                  />
                  <ShareButton
                     title={post.title}
                     text={place ? `${post.title} - ${place}` : post.title}
                  />
                  {isOwner && (
                     <div className="ml-auto flex gap-2">
                        <Button
                           variant="outline"
                           className={roundBtn}
                           onClick={() => setEditing(true)}
                        >
                           <Pencil />
                           <span className="max-sm:sr-only">Edit</span>
                        </Button>
                        <Button
                           variant="ghost"
                           className={cn(
                              roundBtn,
                              'text-destructive hover:bg-destructive/10 hover:text-destructive'
                           )}
                           onClick={() => setDeleting(true)}
                        >
                           <Trash2 />
                           <span className="max-sm:sr-only">Delete</span>
                        </Button>
                     </div>
                  )}
               </motion.div>

               <motion.div
                  variants={fadeUp}
                  className="text-base leading-relaxed text-pretty whitespace-pre-line text-foreground/90 sm:text-lg sm:leading-8"
               >
                  {post.content}
               </motion.div>
            </motion.div>

            <div className="mx-auto max-w-3xl space-y-12 px-4 pb-16">
               {hasPin && (
                  <motion.section
                     {...reveal}
                     variants={fadeUp}
                     aria-labelledby="where-title"
                     className="space-y-3"
                  >
                     <div className="flex items-baseline justify-between gap-3">
                        <h2 id="where-title" className="text-xl font-semibold tracking-tight">
                           Where it happened
                        </h2>
                        {place && (
                           <span className="truncate text-sm text-muted-foreground">{place}</span>
                        )}
                     </div>
                     <div className="overflow-hidden rounded-xl border">
                        <Suspense
                           fallback={<div className="h-56 animate-pulse bg-muted sm:h-72" />}
                        >
                           <PostLocationMap lat={post.location.lat} lng={post.location.lng} />
                        </Suspense>
                     </div>
                  </motion.section>
               )}

               <motion.div {...reveal} variants={fadeUp}>
                  <CommentList postId={post._id} />
               </motion.div>
            </div>
         </article>

         <PhotoLightbox
            open={lightbox}
            onOpenChange={setLightbox}
            src={imageUrl(post.imageUrl)}
            alt={post.title}
            caption={place}
         />
         {isOwner && (
            <>
               <PostForm
                  open={editing}
                  onOpenChange={setEditing}
                  editPost={post}
                  onSubmit={handleUpdate}
               />
               <ConfirmDialog
                  open={deleting}
                  onOpenChange={setDeleting}
                  title="Delete this journal?"
                  description={`"${post.title}" and its comments will be removed for good.`}
                  onConfirm={handleDelete}
               />
            </>
         )}
      </PageTransition>
   );
}
