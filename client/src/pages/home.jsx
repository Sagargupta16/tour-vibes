import PageTransition from '@/components/shared/page-transition';
import Hero from '@/components/home/hero';
import FeaturedJournals from '@/components/home/featured-journals';
import HowItWorks from '@/components/home/how-it-works';
import MapTeaser from '@/components/home/map-teaser';
import ClosingCta from '@/components/home/closing-cta';
import useFeaturedPosts from '@/components/home/use-featured-posts';

// Landing page: one popular-feed request feeds the hero map, the featured strip
// and the map teaser
export default function Home() {
   const { posts, total, status } = useFeaturedPosts();

   return (
      <PageTransition>
         <Hero posts={posts} total={total} status={status} />
         <FeaturedJournals posts={posts} status={status} />
         <HowItWorks />
         <MapTeaser posts={posts} />
         <ClosingCta />
      </PageTransition>
   );
}
