import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import useFeed from '@/hooks/use-feed';
import FeedEmpty from '@/components/feed/feed-empty';
import FeedHero from '@/components/feed/feed-hero';
import Pagination from '@/components/feed/pagination';
import PostForm from '@/components/feed/post-form';
import PostGrid from '@/components/feed/post-grid';
import SearchBar from '@/components/feed/search-bar';
import SortSelect from '@/components/feed/sort-select';
import TagFilter from '@/components/feed/tag-filter';
import useFeedParams from '@/components/feed/use-feed-params';
import PageTransition from '@/components/shared/page-transition';

export default function Feed() {
   const { isAuth } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
   const { q, tag, sort, page, update } = useFeedParams();
   const [formOpen, setFormOpen] = useState(false);
   const resultsRef = useRef(null);

   // The search endpoint cannot filter by tag or sort, so a search stands alone
   const activeTag = q ? '' : tag;
   const feed = useFeed({ searchQuery: q, tag: activeTag, sort: q ? 'newest' : sort, page });
   const { posts, loading, error, lastPage } = feed;
   // A shared link can point past the last page (or a page emptied since): step back
   const pastEnd = !loading && lastPage > 0 && page > lastPage;

   useEffect(() => {
      if (pastEnd) update({ page: lastPage }, { replace: true });
   }, [pastEnd, lastPage, update]);

   // Bring the results into view when the filters or page change below the fold,
   // e.g. after tapping a tag on a card halfway down the grid
   const filterKey = `${q}|${activeTag}|${sort}|${page}`;
   useEffect(() => {
      const el = resultsRef.current;
      if (el && el.getBoundingClientRect().top < 0) {
         el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
   }, [filterKey]);

   const openNew = () => {
      if (!isAuth) {
         navigate('/login', { state: { from: location } });
         return;
      }
      setFormOpen(true);
   };

   const handleCreate = async (formData) => {
      await feed.createPost(formData);
      // Newest first, unfiltered, page 1 is where the new journal shows up
      update({ q: '', tag: '', sort: '', page: '' });
   };

   const clearFilters = () => update({ q: '', tag: '', page: '' });

   return (
      <PageTransition>
         <div className="tv-container pb-16">
            <FeedHero
               total={feed.totalPosts}
               query={feed.resultQuery}
               ready={!loading || posts.length > 0}
               onNew={openNew}
            />

            {/* Sticky under the 64px header on phones, where the grid is one long column */}
            <div className="sticky top-16 z-30 -mx-4 space-y-3 border-b bg-background px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-6">
               <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                     <SearchBar
                        value={q}
                        busy={loading}
                        onSearch={(text) =>
                           update({ q: text, tag: '', page: '' }, { replace: true })
                        }
                     />
                  </div>
                  <SortSelect
                     value={sort}
                     searching={Boolean(q)}
                     onChange={(next) => update({ sort: next, page: '' })}
                  />
               </div>
               <TagFilter
                  activeTag={activeTag}
                  onTagChange={(next) => update({ tag: next, q: '', page: '' })}
               />
            </div>

            <section
               ref={resultsRef}
               aria-label="Journals"
               className="scroll-mt-48 pt-5 sm:scroll-mt-20 sm:pt-0"
            >
               {!loading && !pastEnd && posts.length === 0 ? (
                  <FeedEmpty
                     error={error}
                     q={q}
                     tag={activeTag}
                     onRetry={feed.reload}
                     onClear={clearFilters}
                     onNew={openNew}
                  />
               ) : (
                  <PostGrid posts={posts} loading={loading || pastEnd} />
               )}
               <Pagination
                  page={page}
                  lastPage={lastPage}
                  onPageChange={(next) => update({ page: next })}
               />
            </section>

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
