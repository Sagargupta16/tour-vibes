import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { imageUrl } from '@/lib/api';

export default function PostCard({ post, editable, onEdit, onDelete }) {
   const img = imageUrl(post.imageUrl);
   const date = new Date(post.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
   });

   return (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
         <Card className="group overflow-hidden">
            {img && (
               <Link to={`/journals/${post._id}`}>
                  <div className="aspect-video overflow-hidden">
                     <img
                        src={img}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                     />
                  </div>
               </Link>
            )}
            <CardHeader className="pb-2">
               <Link
                  to={`/journals/${post._id}`}
                  className="text-lg font-semibold leading-tight hover:underline"
               >
                  {post.title}
               </Link>
               <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.creator?.name}</span>
                  <span>&middot;</span>
                  <span>{date}</span>
                  {post.location?.name && (
                     <>
                        <span>&middot;</span>
                        <span className="flex items-center gap-0.5">
                           <MapPin className="h-3 w-3" />
                           {post.location.name}
                        </span>
                     </>
                  )}
               </div>
            </CardHeader>
            <CardContent className="space-y-3">
               <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
               <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                     {post.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                           {tag}
                        </Badge>
                     ))}
                  </div>
                  <div className="flex items-center gap-3">
                     {post.likes && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Heart className="h-3.5 w-3.5" />
                           {post.likes.length}
                        </span>
                     )}
                     {post.travelDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Calendar className="h-3.5 w-3.5" />
                           {new Date(post.travelDate).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                           })}
                        </span>
                     )}
                  </div>
               </div>
               {editable && (
                  <div className="flex gap-2 pt-1">
                     <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                     </Button>
                     <Button variant="outline" size="sm" onClick={() => onDelete(post._id)}>
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                     </Button>
                  </div>
               )}
            </CardContent>
         </Card>
      </motion.div>
   );
}
