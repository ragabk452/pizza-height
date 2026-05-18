import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Pizza Height collects, uses, and protects your data.',
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="bg-mesh-gold pt-32 pb-12 sm:pt-40">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <p className="text-primary text-xs font-medium tracking-[0.3em] uppercase">Legal</p>
            <h1 className="font-display text-foreground mt-2 text-4xl sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-muted mt-3 text-sm">Last updated: May 18, 2026</p>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="prose-pizza space-y-8 text-base leading-relaxed">
            <Section title="The short version">
              <p className="text-foreground">
                We collect only what we need to take your order and bring it to your door. We never
                sell your data. You can ask us to delete your account at any time.
              </p>
            </Section>

            <Section title="What we collect">
              <ul className="text-muted ml-5 list-disc space-y-2">
                <li>
                  Name, phone number, optional email — to identify your account and contact you
                  about your order.
                </li>
                <li>Delivery addresses — so we can find your door.</li>
                <li>
                  Order history and item preferences — to show you a sensible &quot;reorder&quot;
                  experience.
                </li>
                <li>Anonymous device + browser info — for security and to debug crashes.</li>
                <li>
                  Payment card details are <strong>never</strong> stored on our servers. They live
                  with Paymob (our PCI-compliant payment processor).
                </li>
              </ul>
            </Section>

            <Section title="How we use it">
              <ul className="text-muted ml-5 list-disc space-y-2">
                <li>Process and deliver your orders.</li>
                <li>Send SMS or email about order status. Marketing messages are opt-in only.</li>
                <li>Improve the menu by understanding what people order together.</li>
                <li>Detect fraud and abuse (rate limits, suspicious patterns).</li>
              </ul>
            </Section>

            <Section title="Who we share it with">
              <p className="text-muted">Three categories only:</p>
              <ul className="text-muted mt-3 ml-5 list-disc space-y-2">
                <li>
                  <strong>Our payment processor</strong> (Paymob) — only the data needed to charge
                  your card.
                </li>
                <li>
                  <strong>Our delivery dispatcher</strong> — your name, phone, and address for the
                  active order, never historical data.
                </li>
                <li>
                  <strong>Egyptian authorities</strong> — only when legally compelled.
                </li>
              </ul>
              <p className="text-muted mt-3">
                We don&rsquo;t sell, rent, or trade your data with anyone else. Ever.
              </p>
            </Section>

            <Section title="Cookies + tracking">
              <p className="text-muted">
                We use a single first-party cookie to keep you logged in. We don&rsquo;t use
                third-party advertising trackers. If you opt into analytics (Google Analytics / Meta
                Pixel), the IDs are anonymous.
              </p>
            </Section>

            <Section title="Your rights">
              <p className="text-muted">You can, at any time:</p>
              <ul className="text-muted mt-3 ml-5 list-disc space-y-2">
                <li>See exactly what we hold about you (request a data export).</li>
                <li>Correct anything that&rsquo;s wrong.</li>
                <li>
                  Delete your account — we remove everything except what we&rsquo;re legally
                  required to keep (e.g. tax invoices for past orders).
                </li>
                <li>Withdraw marketing consent in one tap.</li>
              </ul>
              <p className="text-muted mt-3">
                Write to{' '}
                <Link href="/contact" className="text-primary hover:underline">
                  privacy@pizzaheight.com
                </Link>{' '}
                and we&rsquo;ll handle it within 7 days.
              </p>
            </Section>

            <Section title="Changes to this policy">
              <p className="text-muted">
                If we change anything material, we&rsquo;ll email logged-in customers and post a
                notice on this page. The &quot;last updated&quot; date at the top reflects the most
                recent change.
              </p>
            </Section>

            <div className="border-border bg-surface/40 mt-12 rounded-2xl border p-6 text-sm">
              <p className="text-muted">
                Questions? Reach us via the{' '}
                <Link href="/contact" className="text-primary font-medium hover:underline">
                  contact page
                </Link>{' '}
                or read our{' '}
                <Link href="/terms" className="text-primary font-medium hover:underline">
                  terms of service
                </Link>
                .
              </p>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-foreground mb-3 text-2xl">{title}</h2>
      {children}
    </section>
  );
}
