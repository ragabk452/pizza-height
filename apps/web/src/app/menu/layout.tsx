import type { Metadata } from 'next';
import type { Category, MenuItem } from '@/lib/api-types';
import { MenuJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pizza-height.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const metadata: Metadata = {
  title: 'Menu — Wood-fired pizzas, hand-crafted sides',
  description:
    'Browse the full Pizza Height menu — wood-fired pizzas in 90 seconds, hand-picked sides, and craft desserts. Every dish obsessed-over.',
  alternates: {
    canonical: `${SITE_URL}/menu`,
  },
  openGraph: {
    title: 'Menu — Pizza Height',
    description: 'Wood-fired pizzas, hand-crafted sides.',
    url: `${SITE_URL}/menu`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Menu — Pizza Height',
    description: 'Wood-fired pizzas, hand-crafted sides.',
  },
};

async function fetchMenuData(): Promise<{ categories: Category[]; items: MenuItem[] } | null> {
  try {
    const [catsRes, itemsRes] = await Promise.all([
      fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/menu-items`, { next: { revalidate: 3600 } }),
    ]);
    if (!catsRes.ok || !itemsRes.ok) return null;
    const categories = (await catsRes.json()) as Category[];
    const items = (await itemsRes.json()) as MenuItem[];
    return { categories, items };
  } catch {
    return null;
  }
}

export default async function MenuLayout({ children }: { children: React.ReactNode }) {
  const data = await fetchMenuData();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'Menu', url: `${SITE_URL}/menu` },
        ]}
      />
      {data && <MenuJsonLd categories={data.categories} items={data.items} />}
      {children}
    </>
  );
}
