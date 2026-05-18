import { ImageResponse } from 'next/og';

// Twitter cards + Open Graph share preview (1200×630). Sweep-rendered
// at request time by Next.js + cached at the edge.
// NOTE: ImageResponse uses Satori under the hood — every <div> with
// multiple children needs an explicit `display: flex` (or 'contents' /
// 'none'), and `z-index` is unsupported. The simpler the tree, the safer.
export const alt = 'Pizza Height — Hand-crafted, wood-fired pizza';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'radial-gradient(ellipse at top, rgba(201,169,97,0.2), transparent 60%), radial-gradient(ellipse at bottom left, rgba(184,67,31,0.15), transparent 60%), #1C1917',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <div style={{ fontSize: 220, lineHeight: 1, display: 'flex' }}>🍕</div>

      <div
        style={{
          fontSize: 28,
          letterSpacing: 8,
          color: '#C9A961',
          textTransform: 'uppercase',
          fontWeight: 500,
          display: 'flex',
        }}
      >
        Hand-crafted · Wood-fired · 90 seconds
      </div>

      <div
        style={{
          fontSize: 110,
          color: '#FAFAF9',
          fontWeight: 400,
          lineHeight: 1.05,
          textAlign: 'center',
          display: 'flex',
          gap: 18,
        }}
      >
        <span>Pizza</span>
        <span
          style={{
            backgroundImage: 'linear-gradient(135deg, #C9A961, #F5D589, #C9A961)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Height
        </span>
      </div>

      <div
        style={{
          fontSize: 36,
          color: '#A8A29E',
          marginTop: 8,
          display: 'flex',
        }}
      >
        Elevate Your Taste
      </div>
    </div>,
    size,
  );
}
