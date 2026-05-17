import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { FeaturedItems } from '@/components/sections/featured-items';
import { BentoCategories } from '@/components/sections/bento-categories';
import { Testimonials } from '@/components/sections/testimonials';
import { CTA } from '@/components/sections/cta';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <FeaturedItems />
        <BentoCategories />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
