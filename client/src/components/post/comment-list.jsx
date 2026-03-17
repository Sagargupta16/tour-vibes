import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import CommentForm from './comment-form';

export default function CommentList({ postId }) {
   const { userId } = useAuth();
   const [comments, setComments] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      api.get(`/feed/post/${postId}/comments`)
         .then((data) => setComments(data.comments || []))
         .catch(() => {})
         .finally(() => setLoading(false));
   }, [postId]);

   const handleDelete = async (commentId) => {
      try {
         await api.delete(`/feed/comment/${commentId}`);
         setComments((prev) => prev.filter((c) => c._id !== commentId));
         toast.success('Comment deleted');
      } catch (err) {
         toast.error(err.message);
      }
   };

   const handleAdd = (comment) => {
      setComments((prev) => [comment, ...prev]);
   };

   const timeAgo = (date) => {
      const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
   };

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
         <CommentForm postId={postId} onCommentAdded={handleAdd} />
         <Separator />
         {loading ? (
            <p className="text-sm text-muted-foreground">Loading comments...</p>
         ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
         ) : (
            <div className="space-y-4">
               {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                     <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">
                           {c.author?.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium">{c.author?.name}</span>
                           <span className="text-xs text-muted-foreground">
                              {timeAgo(c.createdAt)}
                           </span>
                        </div>
                        <p className="mt-0.5 text-sm">{c.text}</p>
                     </div>
                     {c.author?._id === userId && (
                        <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 shrink-0"
                           onClick={() => handleDelete(c._id)}
                        >
                           <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
