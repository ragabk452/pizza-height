import type { Metadata } from 'next';
import Link from 'next/link';
import { Flame, Leaf, Trophy, Heart, Clock, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'How Pizza Height was born — the obsession with wood-fire, the search for the perfect dough, and the people who built the brand.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'Our Story · Pizza Height',
    description: 'Hand-crafted, wood-fired, ritually obsessed pizza.',
    url: `${SITE_URL}/about`,
    type: 'article',
  },
};

const values = [
  {
    Icon: Flame,
    title: 'Wood-fire only',
    body: 'Every pie meets 480°C oak embers. No conveyor, no shortcut.',
  },
  {
    Icon: Leaf,
    title: 'Sourced honestly',
    body: 'DOP San Marzano. Fior di latte from a farm we visit twice a year. Olive oil from a family in Puglia.',
  },
  {
    Icon: Clock,
    title: '48-hour dough',
    body: 'Slow ferment with a sourdough starter that’s older than our youngest cook.',
  },
  {
    Icon: Trophy,
    title: 'Trained in Naples',
    body: 'Our head pizzaiolo earned his stripes at the Associazione Verace Pizza Napoletana.',
  },
];

const timeline = [
  {
    year: '2022',
    title: 'The obsession',
    body: 'A six-month sabbatical in Italy. 117 pizzerias visited. One starter brought home.',
  },
  {
    year: '2023',
    title: 'First pop-up',
    body: 'A weekend in Zamalek. Sold out in 90 minutes. The line went around the block.',
  },
  {
    year: '2024',
    title: 'Sky Tower flagship',
    body: '300 m² of warm wood and gold light. A proper Stefano Ferrara oven imported.',
  },
  {
    year: '2026',
    title: 'Three locations, one obsession',
    body: 'Zamalek, New Cairo, and 6th of October. Same starter. Same fire.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="bg-mesh-gold relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <div className="text-primary mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.3em] uppercase">
              <Sparkles className="size-3" />
              The Pizza Height story
            </div>
            <h1 className="font-display text-foreground text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              We didn&rsquo;t want a restaurant.
              <br />
              <span className="text-gradient-gold">We wanted a ritual.</span>
            </h1>
            <p className="text-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
              Pizza Height was born from one stubborn belief: pizza should be a small ceremony
              &mdash; wood, time, hands, and silence between the first bite and the second.
            </p>
          </div>
        </section>

        {/* Manifesto block */}
        <section className="relative py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <p className="text-primary text-xs font-medium tracking-[0.3em] uppercase">
                The obsession
              </p>
              <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl">
                A 48-hour dough.
                <br />A 90-second bake.
              </h2>
              <div className="text-muted mt-6 space-y-4 text-base leading-relaxed">
                <p>
                  We don&rsquo;t time our doughs in hours. We time them in <em>fermentation</em>{' '}
                  &mdash; 48 hours of slow life inside a chilled chamber, letting wild yeasts do the
                  work that speed never can.
                </p>
                <p>
                  Then 90 seconds in a Stefano Ferrara oven, climbing past 480&deg;C. The
                  leoparding, the cornicione, the tiny burst of char on the rim &mdash; those
                  aren&rsquo;t accidents. They&rsquo;re the proof.
                </p>
              </div>
            </div>
            <div className="bg-surface/40 border-border relative grid place-items-center rounded-3xl border p-12">
              <div className="text-[14rem] leading-none">🍕</div>
              <div className="text-primary mt-4 text-center text-xs tracking-[0.3em] uppercase">
                Made with fire.
                <br />
                Served with love.
              </div>
            </div>
          </div>
        </section>

        {/* Values grid */}
        <section className="bg-surface/30 relative py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-medium tracking-[0.3em] uppercase">
                What we believe
              </p>
              <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl">
                Four rules we won&rsquo;t bend.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="bg-background/60 border-border hover:border-primary/40 group rounded-2xl border p-6 transition-all hover:-translate-y-0.5"
                >
                  <div className="bg-primary/10 text-primary inline-flex size-12 items-center justify-center rounded-xl">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-foreground mt-5 text-xl">{title}</h3>
                  <p className="text-muted mt-2 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-medium tracking-[0.3em] uppercase">
                Our timeline
              </p>
              <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl">
                From a 117-pizzeria pilgrimage to three locations.
              </h2>
            </div>
            <ol className="mt-12 space-y-8">
              {timeline.map((entry, i) => (
                <li key={entry.year} className="group flex gap-6 sm:gap-10">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-background font-display grid size-14 shrink-0 place-items-center rounded-full text-sm shadow-[var(--shadow-gold)]">
                      {entry.year}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="bg-primary/20 mt-2 w-px flex-1" aria-hidden="true" />
                    )}
                  </div>
                  <div className="pb-4">
                    <h3 className="font-display text-foreground text-2xl">{entry.title}</h3>
                    <p className="text-muted mt-2 leading-relaxed">{entry.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-mesh-gold relative py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <Heart className="text-primary mx-auto size-8" />
            <h2 className="font-display text-foreground mt-6 text-4xl sm:text-5xl">
              The best way to read a story
              <br />
              <span className="text-gradient-gold">is to taste it.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/menu">See the menu</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/locations">Find a location</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
