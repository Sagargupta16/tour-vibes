import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useFeed from '@/hooks/use-feed';
import { useDebounce } from '@/hooks/use-debounce';
import PostCard from '@/components/feed/post-card';
import PostForm from '@/components/feed/post-form';
import SearchBar from '@/components/feed/search-bar';
import TagFilter from '@/components/feed/tag-filter';
import SortSelect from '@/components/feed/sort-select';
import Pagination from '@/components/feed/pagination';
import SkeletonCard from '@/components/shared/skeleton-card';
import EmptyState from '@/components/shared/empty-state';
import PageTransition from '@/components/shared/page-transition';

export default function Feed() {
   const [search, setSearch] = useState('');
   const [tag, setTag] = useState('');
   const [sort, setSort] = useState('newest');
   const [formOpen, setFormOpen] = useState(false);
   const debouncedSearch = useDebounce(search);

   const { posts, loading, page, lastPage, goToPage, createPost } = useFeed({
      searchQuery: debouncedSearch,
      tag,
      sort
   });

   const handleCreate = async (formData) => {
      await createPost(formData);
   };

   return (
      <PageTransition>
         <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
               <h1 className="text-2xl font-bold">Journals</h1>
               <Button onClick={() => setFormOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  New Journal
               </Button>
            </div>

            <div className="mb-6 space-y-4">
               <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                     <SearchBar value={search} onChange={setSearch} />
                  </div>
                  <SortSelect value={sort} onChange={setSort} />
               </div>
               <TagFilter activeTag={tag} onTagChange={setTag} />
            </div>

            {loading ? (
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                     <SkeletonCard key={i} />
                  ))}
               </div>
            ) : posts.length === 0 ? (
               <EmptyState
                  title="No journals found"
                  description={
                     search ? 'Try a different search term' : 'Be the first to share a story!'
                  }
               />
            ) : (
               <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                     {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                     ))}
                  </div>
                  <Pagination page={page} lastPage={lastPage} onPageChange={goToPage} />
               </>
            )}

            <PostForm
               open={formOpen}
               onOpenChange={setFormOpen}
               editPost={null}
               onSubmit={handleCreate}
            />
         </div>
      </PageTransition>
   );
}
