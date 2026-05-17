import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Manrope, Cairo } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
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
  metadataBase: new URL('https://pizza-height.vercel.app'),
  title: {
    default: 'Pizza Height — Elevate Your Taste',
    template: '%s | Pizza Height',
  },
  description:
    'Pizza Height is a luxury pizza experience. Hand-crafted pies with the finest ingredients, delivered to elevate your taste.',
  keywords: ['pizza', 'luxury pizza', 'gourmet pizza', 'food delivery', 'Pizza Height'],
  authors: [{ name: 'Ragab Mostafa' }],
  openGraph: {
    title: 'Pizza Height — Elevate Your Taste',
    description: 'Luxury pizza, hand-crafted, delivered.',
    url: 'https://pizza-height.vercel.app',
    siteName: 'Pizza Height',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pizza Height — Elevate Your Taste',
    description: 'Luxury pizza, hand-crafted, delivered.',
  },
  icons: {
    icon: '/favicon.ico',
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
