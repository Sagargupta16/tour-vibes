import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { api, imageUrl } from '@/lib/api';
import LikeButton from '@/components/post/like-button';
import CommentList from '@/components/post/comment-list';
import SkeletonPost from '@/components/shared/skeleton-post';
import PageTransition from '@/components/shared/page-transition';

export default function SinglePost() {
   const { postId } = useParams();
   const [post, setPost] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      api.get(`/feed/post/${postId}`)
         .then((data) => setPost(data.post))
         .catch(() => {})
         .finally(() => setLoading(false));
   }, [postId]);

   if (loading) return <SkeletonPost />;
   if (!post) {
      return (
         <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg">Post not found</p>
            <Button variant="link" asChild className="mt-2">
               <Link to="/journals">Back to journals</Link>
            </Button>
         </div>
      );
   }

   const date = new Date(post.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
   });

   return (
      <PageTransition>
         <article className="mx-auto max-w-3xl px-4 py-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
               <Link to="/journals">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
               </Link>
            </Button>

            <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
               <span>By {post.creator?.name}</span>
               <span>&middot;</span>
               <span>{date}</span>
               {post.location?.name && (
                  <>
                     <span>&middot;</span>
                     <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {post.location.name}
                        {post.location.country ? `, ${post.location.country}` : ''}
                     </span>
                  </>
               )}
               {post.travelDate && (
                  <>
                     <span>&middot;</span>
                     <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.travelDate).toLocaleDateString('en-US', {
                           month: 'long',
                           year: 'numeric'
                        })}
                     </span>
                  </>
               )}
            </div>

            {post.tags?.length > 0 && (
               <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                     <Badge key={tag} variant="secondary">
                        {tag}
                     </Badge>
                  ))}
               </div>
            )}

            {post.imageUrl && (
               <img
                  src={imageUrl(post.imageUrl)}
                  alt={post.title}
                  className="mt-6 w-full rounded-lg object-cover"
               />
            )}

            <div className="prose prose-neutral dark:prose-invert mt-6 max-w-none">
               <p className="whitespace-pre-line">{post.content}</p>
            </div>

            <div className="mt-6">
               <LikeButton postId={post._id} likes={post.likes || []} />
            </div>

            <Separator className="my-8" />
            <CommentList postId={post._id} />
         </article>
      </PageTransition>
   );
}
