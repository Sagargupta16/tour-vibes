import { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function CommentForm({ postId, onCommentAdded }) {
   const [text, setText] = useState('');
   const [submitting, setSubmitting] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!text.trim()) return;
      setSubmitting(true);
      try {
         const data = await api.post(`/feed/post/${postId}/comments`, { text: text.trim() });
         onCommentAdded(data.comment);
         setText('');
      } catch (err) {
         toast.error(err.message);
      }
      setSubmitting(false);
   };

   return (
      <form onSubmit={handleSubmit} className="flex gap-2">
         <Input
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
         />
         <Button type="submit" size="icon" disabled={submitting || !text.trim()}>
            <Send className="h-4 w-4" />
         </Button>
      </form>
   );
}
