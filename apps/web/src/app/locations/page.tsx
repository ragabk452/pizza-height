import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, MapPin, Navigation, Phone, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Locations',
  description:
    'Three Pizza Height kitchens across Cairo — Zamalek flagship, New Cairo lounge, and 6th of October garden. Hours, addresses, directions.',
  alternates: { canonical: `${SITE_URL}/locations` },
  openGraph: {
    title: 'Locations · Pizza Height',
    description: 'Three kitchens. One ritual. Hand-crafted, wood-fired pizza.',
    url: `${SITE_URL}/locations`,
    type: 'website',
  },
};

const locations = [
  {
    slug: 'zamalek',
    name: 'Zamalek Flagship',
    tagline: 'Where it all started.',
    address: '15 Sky Tower, 26th of July St., Zamalek, Cairo',
    phone: '+20 100 111 2222',
    hours: ['Sun–Thu · 12:00 – 23:00', 'Fri–Sat · 12:00 – 02:00'],
    features: ['Wood-fired oven', '120 seats', 'Private dining'],
    mapsQuery: 'Pizza+Height+Zamalek+Cairo',
    accent: 'from-amber-500/20',
  },
  {
    slug: 'new-cairo',
    name: 'New Cairo Lounge',
    tagline: 'Quiet luxury, slow nights.',
    address: 'Cairo Festival City, 5th Settlement, New Cairo',
    phone: '+20 100 222 3333',
    hours: ['Daily · 13:00 – 00:00'],
    features: ['Outdoor terrace', 'Bar program', '80 seats'],
    mapsQuery: 'Pizza+Height+New+Cairo',
    accent: 'from-rose-500/20',
  },
  {
    slug: '6th-october',
    name: '6th of October Garden',
    tagline: 'Family Saturdays, oversized booths.',
    address: 'Mall of Arabia, 6th of October City, Giza',
    phone: '+20 100 333 4444',
    hours: ['Daily · 11:00 – 23:00'],
    features: ['Garden seating', 'Kids menu', '150 seats'],
    mapsQuery: 'Pizza+Height+October+City',
    accent: 'from-emerald-500/20',
  },
];

export default function LocationsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="bg-mesh-gold relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <div className="text-primary mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.3em] uppercase">
              <Sparkles className="size-3" />
              Three kitchens, one obsession
            </div>
            <h1 className="font-display text-foreground text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Find us in
              <br />
              <span className="text-gradient-gold">your part of Cairo.</span>
            </h1>
            <p className="text-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
              Same starter. Same fire. Same 90-second bake. Pick whichever oven is closer to you
              tonight.
            </p>
          </div>
        </section>

        {/* Locations grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {locations.map((loc) => (
                <article
                  key={loc.slug}
                  className="bg-surface/40 border-border hover:border-primary/40 group relative overflow-hidden rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  {/* Accent gradient */}
                  <div
                    className={`h-32 bg-gradient-to-br ${loc.accent} via-transparent to-transparent`}
                    aria-hidden="true"
                  />
                  <div className="-mt-16 p-6">
                    <div className="bg-primary text-background grid size-14 place-items-center rounded-2xl shadow-[var(--shadow-gold)]">
                      <MapPin className="size-6" />
                    </div>
                    <p className="text-primary mt-5 text-xs font-medium tracking-[0.2em] uppercase">
                      {loc.tagline}
                    </p>
                    <h2 className="font-display text-foreground mt-1 text-2xl">{loc.name}</h2>

                    <ul className="text-muted mt-6 space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                        <span>{loc.address}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Phone className="text-primary mt-0.5 size-4 shrink-0" />
                        <a
                          href={`tel:${loc.phone.replace(/\s/g, '')}`}
                          className="hover:text-primary transition-colors"
                        >
                          {loc.phone}
                        </a>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="text-primary mt-0.5 size-4 shrink-0" />
                        <div className="space-y-0.5">
                          {loc.hours.map((h) => (
                            <div key={h}>{h}</div>
                          ))}
                        </div>
                      </li>
                    </ul>

                    <div className="border-border mt-5 flex flex-wrap gap-2 border-t pt-5">
                      {loc.features.map((f) => (
                        <span
                          key={f}
                          className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-medium tracking-wide uppercase"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${loc.mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover mt-6 inline-flex items-center gap-2 text-sm font-medium"
                    >
                      <Navigation className="size-4" />
                      Open in Maps
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-mesh-gold relative py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <h2 className="font-display text-foreground text-4xl sm:text-5xl">
              Or skip the trip.
              <br />
              <span className="text-gradient-gold">We deliver.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/menu">Order delivery</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Reserve a table</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
