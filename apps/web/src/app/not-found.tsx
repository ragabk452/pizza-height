import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="bg-mesh-gold relative grid min-h-screen place-items-center overflow-hidden pt-24 pb-16"
      >
        <div className="mx-auto max-w-xl px-6 text-center">
          <div className="text-[10rem] leading-none">🍕</div>
          <p className="text-primary mt-4 text-xs tracking-[0.3em] uppercase">404 — Off the menu</p>
          <h1 className="font-display text-foreground mt-3 text-5xl sm:text-6xl">
            This page{' '}
            <span className="text-gradient-gold">isn&rsquo;t on tonight&rsquo;s board.</span>
          </h1>
          <p className="text-muted mt-4 text-lg">
            Maybe you meant to browse the wood-fired classics instead?
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/menu">See the menu</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
