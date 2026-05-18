import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules for ordering from Pizza Height.',
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="bg-mesh-gold pt-32 pb-12 sm:pt-40">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <p className="text-primary text-xs font-medium tracking-[0.3em] uppercase">Legal</p>
            <h1 className="font-display text-foreground mt-2 text-4xl sm:text-5xl">
              Terms of Service
            </h1>
            <p className="text-muted mt-3 text-sm">Last updated: May 18, 2026</p>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="space-y-8 text-base leading-relaxed">
            <p className="text-foreground">
              By using Pizza Height (the website, mobile site, or any of our locations), you agree
              to these terms. We&rsquo;ve kept them short and human.
            </p>

            <Section title="Ordering + payment">
              <ul className="text-muted ml-5 list-disc space-y-2">
                <li>
                  Prices and availability can change. We&rsquo;ll honor the price you saw at the
                  time you placed the order.
                </li>
                <li>
                  Card payments are processed by Paymob. Cash on delivery is accepted at
                  participating locations.
                </li>
                <li>
                  You must be 18 or older to order alcohol (wine selection). We may ask for ID at
                  the door.
                </li>
              </ul>
            </Section>

            <Section title="Cancellations + refunds">
              <ul className="text-muted ml-5 list-disc space-y-2">
                <li>
                  You can cancel for free until we mark the order &quot;Preparing.&quot; After that,
                  the dough is in the oven.
                </li>
                <li>
                  If something is wrong with your order (wrong item, cold, missing), reach us within
                  an hour and we&rsquo;ll remake or refund &mdash; your call.
                </li>
                <li>Card refunds typically land back in your account within 5 business days.</li>
              </ul>
            </Section>

            <Section title="Delivery">
              <ul className="text-muted ml-5 list-disc space-y-2">
                <li>
                  Estimated delivery times are estimates. Wood-fired pizza on a Friday night is
                  rarely &quot;exactly 30 minutes.&quot;
                </li>
                <li>
                  Delivery is currently within ~7 km of each location. You&rsquo;ll see the area at
                  checkout.
                </li>
                <li>
                  If we can&rsquo;t reach you after 3 phone attempts at the door, we&rsquo;ll take
                  the order back.
                </li>
              </ul>
            </Section>

            <Section title="Account + conduct">
              <ul className="text-muted ml-5 list-disc space-y-2">
                <li>
                  Keep your password to yourself. You&rsquo;re responsible for orders placed from
                  your account.
                </li>
                <li>
                  Don&rsquo;t use the site to harass our staff or other customers. We&rsquo;ll close
                  your account.
                </li>
                <li>
                  One promo code per order. Coupons can&rsquo;t be combined unless we explicitly say
                  so.
                </li>
              </ul>
            </Section>

            <Section title="Content + IP">
              <p className="text-muted">
                The brand, recipes, photography, and code are owned by Pizza Height. Don&rsquo;t
                copy them. (Photos of your own pizza on Instagram &mdash; please do, we&rsquo;ll
                repost.)
              </p>
            </Section>

            <Section title="Liability">
              <p className="text-muted">
                We&rsquo;ll be liable for what we&rsquo;re directly responsible for &mdash; an
                undelivered order, a billing error. We&rsquo;re not liable for losses from things
                outside our control (network outages, force majeure). Egyptian consumer-protection
                law applies and your statutory rights are unaffected.
              </p>
            </Section>

            <Section title="Changes">
              <p className="text-muted">
                We may update these terms occasionally. Material changes will be announced via email
                to logged-in customers. Continued use after a change means you accept it.
              </p>
            </Section>

            <div className="border-border bg-surface/40 mt-12 rounded-2xl border p-6 text-sm">
              <p className="text-muted">
                Reach us via the{' '}
                <Link href="/contact" className="text-primary font-medium hover:underline">
                  contact page
                </Link>{' '}
                with any questions, or read our{' '}
                <Link href="/privacy" className="text-primary font-medium hover:underline">
                  privacy policy
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
