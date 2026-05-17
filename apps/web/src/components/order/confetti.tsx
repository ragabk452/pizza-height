'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = ['#C9A961', '#F5D589', '#B8431F', '#FAFAF9', '#D4B872'];

interface ConfettiProps {
  count?: number;
}

export function Confetti({ count = 80 }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        // Use deterministic pseudo-randomness keyed off `i` so SSR and CSR
        // produce identical markup (no hydration mismatch).
        left: ((i * 9301 + 49297) % 233280) / 2332.8, // 0–100
        delay: ((i * 7) % 100) / 100,
        duration: 2.4 + ((i * 3) % 18) / 10,
        rotate: ((i * 53) % 360) - 180,
        size: 6 + ((i * 11) % 9),
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [0, 1, 1, 0],
            rotate: piece.rotate,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut',
          }}
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 1.6,
            background: piece.color,
          }}
          className="absolute top-0 inline-block rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
        />
      ))}
    </div>
  );
}
