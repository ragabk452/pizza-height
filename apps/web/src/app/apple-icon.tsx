import { ImageResponse } from 'next/og';

// Apple touch icon (180×180) — used when a user adds the site to their
// iOS home screen. The luxe gold gradient + pizza glyph stands in for
// a proper bitmap icon until brand assets land.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: 'linear-gradient(135deg, #1C1917 0%, #292524 50%, #1C1917 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      🍕
    </div>,
    size,
  );
}
