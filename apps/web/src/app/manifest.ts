import type { MetadataRoute } from 'next';

/**
 * PWA web app manifest. Lets iOS / Android users "Add to home screen"
 * and launch the site as a stand-alone app — no browser chrome, native
 * splash, theme colors that match the Modern Luxe palette.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pizza Height — Elevate Your Taste',
    short_name: 'Pizza Height',
    description: 'Hand-crafted, wood-fired pizza. Order from our Cairo locations in 90 seconds.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1C1917',
    theme_color: '#1C1917',
    categories: ['food', 'lifestyle', 'shopping'],
    lang: 'en',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Order now',
        short_name: 'Menu',
        description: 'Jump straight to the menu',
        url: '/menu',
      },
      {
        name: 'My orders',
        short_name: 'Orders',
        description: 'See your recent orders',
        url: '/orders',
      },
    ],
  };
}
