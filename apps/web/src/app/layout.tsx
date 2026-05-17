import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Manrope, Cairo } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { MotionProvider } from '@/components/providers/motion-provider';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { RestaurantJsonLd, OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/json-ld';
import { SITE_URL } from '@/lib/site-url';
import { Toaster } from 'sonner';
import './globals.css';

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pizza Height — Elevate Your Taste',
    template: '%s | Pizza Height',
  },
  description:
    'Pizza Height is a luxury pizza experience. Hand-crafted pies with the finest ingredients, wood-fired in 90 seconds, delivered to elevate your taste.',
  keywords: [
    'pizza',
    'luxury pizza',
    'gourmet pizza',
    'wood-fired pizza',
    'food delivery',
    'Cairo pizza',
    'Pizza Height',
    'بيتزا هايت',
  ],
  authors: [{ name: 'Ragab Mostafa' }],
  creator: 'Ragab Mostafa',
  publisher: 'Pizza Height',
  applicationName: 'Pizza Height',
  category: 'food',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'ar-EG': '/',
    },
  },
  openGraph: {
    title: 'Pizza Height — Elevate Your Taste',
    description: 'Luxury pizza, wood-fired in 90 seconds, hand-crafted, delivered.',
    url: SITE_URL,
    siteName: 'Pizza Height',
    locale: 'en_US',
    alternateLocale: ['ar_EG'],
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pizza Height — Luxury Pizza, Hand-crafted, Delivered',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pizza Height — Elevate Your Taste',
    description: 'Luxury pizza, wood-fired in 90 seconds, hand-crafted, delivered.',
    images: ['/og-image.png'],
    creator: '@pizzaheight',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1C1917',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSerif.variable} ${manrope.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground font-body flex min-h-full flex-col">
        <a
          href="#main-content"
          className="bg-primary text-background sr-only z-[100] rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <RestaurantJsonLd />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MotionProvider>
            <QueryProvider>
              {children}
              <CartDrawer />
              <Toaster
                theme="dark"
                position="top-center"
                toastOptions={{
                  style: {
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  },
                }}
              />
            </QueryProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
