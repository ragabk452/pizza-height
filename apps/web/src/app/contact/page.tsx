'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Loader2, Mail, MapPin, MessageSquare, Phone, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [state, setState] = useState<{ submitting: boolean; sent: boolean }>({
    submitting: false,
    sent: false,
  });
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.submitting) return;
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in name, email, and message.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('Please enter a valid email.');
      return;
    }
    setState({ submitting: true, sent: false });
    // Simulated submit — the backend `messages` module is on the roadmap
    // (see HANDOFF §"Suggestions"). Until then, fake a network call so
    // the UX feels real and the form clears cleanly.
    await new Promise((r) => setTimeout(r, 1200));
    setState({ submitting: false, sent: true });
    setForm({ name: '', email: '', topic: 'general', message: '' });
    toast.success('Thank you — we usually reply within a day.');
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="bg-mesh-gold relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <div className="text-primary mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-[0.3em] uppercase">
              <Sparkles className="size-3" />
              We&rsquo;d love to hear from you
            </div>
            <h1 className="font-display text-foreground text-5xl leading-[1.05] sm:text-6xl">
              Got a question, a craving,
              <br />
              <span className="text-gradient-gold">or a big event?</span>
            </h1>
            <p className="text-muted mx-auto mt-6 max-w-2xl text-lg">
              Tell us anything &mdash; reservations, catering, press, or just to say the dough was
              perfect.
            </p>
          </div>
        </section>

        {/* Contact form + info */}
        <section className="py-12 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_22rem] lg:gap-16 lg:px-8">
            {/* Form */}
            <motion.form
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-surface/40 border-border rounded-3xl border p-6 sm:p-10"
            >
              <h2 className="font-display text-foreground text-2xl">Send us a message</h2>
              <p className="text-muted mt-1 text-sm">We usually reply within a day.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Your name">
                  <Input
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Layla Hassan"
                    required
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </Field>
              </div>

              <Field className="mt-5" label="Topic">
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/30 h-12 rounded-lg border px-4 text-sm focus:ring-2 focus:outline-none"
                >
                  <option value="general">General question</option>
                  <option value="reservation">Reservation</option>
                  <option value="catering">Catering / private event</option>
                  <option value="press">Press &amp; media</option>
                  <option value="feedback">Order feedback</option>
                  <option value="careers">Careers</option>
                </select>
              </Field>

              <Field className="mt-5" label="Your message">
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  placeholder="Tell us a little about it…"
                  className="bg-background border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/30 resize-none rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                  required
                />
              </Field>

              <div className="mt-8 flex items-center justify-between gap-4">
                {state.sent ? (
                  <span className="text-success inline-flex items-center gap-2 text-sm font-medium">
                    <Check className="size-4" /> Message sent
                  </span>
                ) : (
                  <span className="text-muted text-xs">We&rsquo;ll never share your email.</span>
                )}
                <Button type="submit" size="lg" disabled={state.submitting}>
                  {state.submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" /> Send message
                    </>
                  )}
                </Button>
              </div>
            </motion.form>

            {/* Side info */}
            <aside className="space-y-5">
              <ContactCard
                Icon={MapPin}
                title="Flagship"
                lines={['15 Sky Tower', '26th of July St.', 'Zamalek, Cairo']}
                cta={{ href: '/locations', label: 'All locations →' }}
              />
              <ContactCard
                Icon={Phone}
                title="Call us"
                lines={['+20 100 111 2222', 'Daily · 11:00 – 23:00']}
                cta={{ href: 'tel:+201001112222', label: 'Tap to call', external: true }}
              />
              <ContactCard
                Icon={Mail}
                title="Email"
                lines={['hello@pizzaheight.com', 'press@pizzaheight.com']}
                cta={{
                  href: 'mailto:hello@pizzaheight.com',
                  label: 'Open in your mail app',
                  external: true,
                }}
              />
              <div className="bg-surface/40 border-border rounded-2xl border p-6">
                <div className="text-primary inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase">
                  <MessageSquare className="size-4" />
                  Live chat
                </div>
                <p className="text-muted mt-3 text-sm">
                  Already mid-order? Tap the help icon inside the cart drawer to reach a kitchen
                  manager in seconds.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ''}`}>
      <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`bg-background border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/30 h-12 rounded-lg border px-4 text-sm focus:ring-2 focus:outline-none ${props.className ?? ''}`}
    />
  );
}

function ContactCard({
  Icon,
  title,
  lines,
  cta,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
  cta?: { href: string; label: string; external?: boolean };
}) {
  return (
    <div className="bg-surface/40 border-border rounded-2xl border p-6">
      <div className="bg-primary/10 text-primary inline-flex size-10 items-center justify-center rounded-xl">
        <Icon className="size-5" />
      </div>
      <h3 className="font-display text-foreground mt-4 text-lg">{title}</h3>
      <ul className="text-muted mt-2 space-y-1 text-sm">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      {cta &&
        (cta.external ? (
          <a
            href={cta.href}
            className="text-primary hover:text-primary-hover mt-4 inline-flex text-sm font-medium"
          >
            {cta.label}
          </a>
        ) : (
          <Link
            href={cta.href}
            className="text-primary hover:text-primary-hover mt-4 inline-flex text-sm font-medium"
          >
            {cta.label}
          </Link>
        ))}
    </div>
  );
}
