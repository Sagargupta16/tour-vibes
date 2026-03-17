import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function LikeButton({ postId, likes = [] }) {
   const { userId } = useAuth();
   const [liked, setLiked] = useState(likes.some((id) => id === userId || id?._id === userId));
   const [count, setCount] = useState(likes.length);

   const toggle = async () => {
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev - 1 : prev + 1));
      try {
         const data = await api.put(`/feed/post/${postId}/like`);
         setLiked(data.liked);
         setCount(data.likesCount);
      } catch {
         setLiked((prev) => !prev);
         setCount((prev) => (liked ? prev + 1 : prev - 1));
      }
   };

   return (
      <Button variant="ghost" size="sm" onClick={toggle} className="gap-1.5">
         <motion.div whileTap={{ scale: 0.8 }}>
            <Heart
               className={`h-4 w-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`}
            />
         </motion.div>
         <span className="text-sm">{count}</span>
      </Button>
   );
}
