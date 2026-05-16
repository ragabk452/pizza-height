/**
 * Pizza Height - Modern Luxe Design System
 *
 * Shared Tailwind theme tokens for web + admin apps.
 * Tailwind v4 uses CSS-first config, but these tokens can be
 * imported and inlined into each app's globals.css @theme block.
 */

export const colors = {
  // Brand - Modern Luxe Palette
  background: '#1C1917', // Almost Black
  surface: '#292524', // Warm Charcoal (cards)
  primary: '#C9A961', // Antique Gold
  primaryHover: '#D4B872',
  text: '#FAFAF9', // Pure Cream
  textMuted: '#A8A29E',
  accent: '#B8431F', // Burnt Sienna

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const fonts = {
  display: 'var(--font-dm-serif)',
  body: 'var(--font-manrope)',
  arabic: 'var(--font-cairo)',
} as const;

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  glow: '0 0 40px rgba(201, 169, 97, 0.15)',
  gold: '0 4px 24px rgba(201, 169, 97, 0.25)',
  card: '0 8px 32px rgba(0, 0, 0, 0.4)',
} as const;
