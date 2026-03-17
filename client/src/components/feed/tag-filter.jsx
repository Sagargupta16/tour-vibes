import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

export default function TagFilter({ activeTag, onTagChange }) {
   const [tags, setTags] = useState([]);

   useEffect(() => {
      api.get('/feed/tags')
         .then((data) => setTags(data.tags || []))
         .catch(() => {});
   }, []);

   if (tags.length === 0) return null;

   return (
      <div className="flex flex-wrap gap-2">
         {tags.map((tag) => (
            <Badge
               key={tag}
               variant={activeTag === tag ? 'default' : 'outline'}
               className="cursor-pointer"
               onClick={() => onTagChange(activeTag === tag ? '' : tag)}
            >
               {tag}
            </Badge>
         ))}
      </div>
   );
}
