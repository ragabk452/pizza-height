'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Mounts a `MotionConfig` with `reducedMotion="user"` so every Framer
 * `motion.*` element reads `prefers-reduced-motion: reduce` and short-
 * circuits its own transition. The plain CSS rule in globals.css can't
 * reach Framer's WAAPI/inline-style animations — this is the bridge.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
