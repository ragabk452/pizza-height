'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useRef, type MouseEvent } from 'react';

const testimonials = [
  {
    quote:
      "Best pizza I've had outside Naples. The truffle bianca is unreal — and it arrived hot enough to fog my glasses.",
    name: 'Layla Hassan',
    role: 'Food Writer · Cairo Bites',
    rating: 5,
  },
  {
    quote:
      'You can taste the obsession. Crust like a cloud, sauce that sings. This is what every pizza place wishes it was.',
    name: 'Marco Rossi',
    role: 'Chef · Roma Trattoria',
    rating: 5,
  },
  {
    quote:
      'Ordered Friday, ordered Saturday, will order again tonight. My kids think I have a pizza problem. They&apos;re right.',
    name: 'Sara Khalil',
    role: 'Regular since day one',
    rating: 5,
  },
];

function TestimonialCard({ t, index }: { t: (typeof testimonials)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ['7.5deg', '-7.5deg']), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ['-7.5deg', '7.5deg']), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="group border-border bg-surface hover:border-primary/30 relative flex flex-col rounded-3xl border p-8 transition-colors"
    >
      {/* Glow on hover */}
      <div
        className="from-primary/0 via-primary/0 to-primary/20 absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ transform: 'translateZ(-1px)' }}
      />

      <Quote
        className="text-primary/30 group-hover:text-primary/50 size-10 transition-colors"
        style={{ transform: 'translateZ(20px)' }}
      />

      <p
        className="text-foreground/90 mt-6 flex-1 text-base leading-relaxed"
        style={{ transform: 'translateZ(15px)' }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>

      <div
        className="mt-8 flex items-center justify-between"
        style={{ transform: 'translateZ(30px)' }}
      >
        <div>
          <div className="font-display text-foreground text-lg">{t.name}</div>
          <div className="text-muted mt-0.5 text-xs">{t.role}</div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="fill-primary text-primary size-4" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32" style={{ perspective: '1200px' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <div className="text-primary mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
            <Star className="fill-primary size-3" />
            Loved by 50,000+ pizza lovers
          </div>
          <h2 className="font-display text-foreground text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Words from the <span className="text-gradient-gold">faithful.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
