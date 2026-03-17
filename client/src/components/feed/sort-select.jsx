import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue
} from '@/components/ui/select';

export default function SortSelect({ value, onChange }) {
   return (
      <Select value={value} onValueChange={onChange}>
         <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
         </SelectTrigger>
         <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
         </SelectContent>
      </Select>
   );
}
