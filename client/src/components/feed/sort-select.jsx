import { ArrowDownUp } from 'lucide-react';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue
} from '@/components/ui/select';

// Passing labels as `items` makes the trigger show "Newest" rather than the raw value
const LABELS = {
   newest: 'Newest',
   oldest: 'Oldest',
   popular: 'Most liked',
   relevance: 'Best match'
};

// Search results come back ranked by relevance, so sorting is locked while searching
export default function SortSelect({ value, onChange, searching }) {
   return (
      <Select
         items={LABELS}
         value={searching ? 'relevance' : value}
         onValueChange={(next) => next && next !== 'relevance' && onChange(next)}
         disabled={searching}
      >
         <SelectTrigger
            aria-label="Sort journals"
            className="w-36 shrink-0 rounded-xl data-[size=default]:h-11 sm:w-40 sm:data-[size=default]:h-10"
         >
            <ArrowDownUp className="text-muted-foreground" />
            <SelectValue />
         </SelectTrigger>
         <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="popular">Most liked</SelectItem>
            {searching && <SelectItem value="relevance">Best match</SelectItem>}
         </SelectContent>
      </Select>
   );
}
