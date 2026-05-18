import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Sparkles } from 'lucide-react';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Quick answers about Pizza Height — ordering, delivery, ingredients, allergies, payments.',
  alternates: { canonical: `${SITE_URL}/faq` },
};

const faqs = [
  {
    q: 'How long does delivery take?',
    a: 'On a typical evening, 25–45 minutes from the time you place the order. Fridays + Saturdays after 8 PM are slower — we&rsquo;d rather take an extra 10 minutes than rush a pie.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Yes — free to cancel until we mark it &quot;Preparing.&quot; Once the dough hits the oven, we can&rsquo;t roll it back.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Cash on delivery, Visa / Mastercard / Meeza via Paymob (PCI-compliant). Apple Pay and Vodafone Cash are on the roadmap.',
  },
  {
    q: 'Are your ingredients halal?',
    a: 'Yes. All meats are 100% halal-certified. The wine selection is the only exception and is clearly labeled.',
  },
  {
    q: 'Do you offer vegan / gluten-free options?',
    a: 'Vegan: yes — see the menu badges. Gluten-free crust: not yet (the wood oven cross-contaminates). We&rsquo;re working on a dedicated gluten-free station.',
  },
  {
    q: 'Can I customize a pizza?',
    a: 'Within reason. Most pies come with a size picker, crust choice, and extra-toppings modifier group. We don&rsquo;t do &quot;build your own&quot; — every pie on the menu is a recipe the chef stands behind.',
  },
  {
    q: 'How do I redeem a promo code?',
    a: 'Enter it on the checkout page in the &quot;Have a code?&quot; field. One code per order. WELCOME20 is first-order only.',
  },
  {
    q: 'Do you cater private events?',
    a: 'We cater events of 30+ people in Cairo. Reach out via the contact page with your date and headcount and we&rsquo;ll send a tasting menu.',
  },
  {
    q: 'Where are you located?',
    a: 'Three locations — Zamalek (flagship), New Cairo, and 6th of October. Hours and maps on the locations page.',
  },
  {
    q: 'Is the menu the same at every location?',
    a: 'Same recipes, same starter, same fire. The wine list varies slightly by location.',
  },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="bg-mesh-gold pt-32 pb-16 sm:pt-40 sm:pb-20">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <div className="text-primary mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.3em] uppercase">
              <Sparkles className="size-3" />
              Frequently asked
            </div>
            <h1 className="font-display text-foreground text-5xl sm:text-6xl">
              Quick answers,
              <br />
              <span className="text-gradient-gold">no waiting on hold.</span>
            </h1>
          </div>
        </section>

        <section className="py-12 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="bg-surface/40 border-border hover:border-primary/40 group rounded-2xl border transition-colors"
                >
                  <summary className="text-foreground hover:text-primary cursor-pointer list-none px-6 py-5 text-base font-medium transition-colors marker:hidden">
                    <span className="flex items-start justify-between gap-4">
                      <span>{faq.q}</span>
                      <span
                        className="text-muted group-open:text-primary mt-1 inline-block transition-all group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <div
                    className="text-muted px-6 pb-6 text-sm leading-relaxed"
                    // The strings hold &rsquo; / &quot; entities — render as HTML so they decode.
                    dangerouslySetInnerHTML={{ __html: faq.a }}
                  />
                </details>
              ))}
            </div>

            <div className="border-border bg-surface/40 mt-12 rounded-2xl border p-6 text-center">
              <p className="text-foreground font-medium">Still stuck?</p>
              <p className="text-muted mt-1 text-sm">
                Reach us via the{' '}
                <Link href="/contact" className="text-primary font-medium hover:underline">
                  contact page
                </Link>
                . We reply within a day.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
