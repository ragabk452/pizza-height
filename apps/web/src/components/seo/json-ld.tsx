import type { MenuItem, Category } from '@/lib/api-types';
import { SITE_URL } from '@/lib/site-url';

const SITE_NAME = 'Pizza Height';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function RestaurantJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        '@id': `${SITE_URL}/#restaurant`,
        name: SITE_NAME,
        alternateName: 'بيتزا هايت',
        description:
          'Luxury pizza experience — hand-crafted pies with the finest ingredients, wood-fired in 90 seconds.',
        url: SITE_URL,
        telephone: '+20-100-111-2222',
        priceRange: '$$',
        servesCuisine: ['Pizza', 'Italian', 'Mediterranean'],
        image: [`${SITE_URL}/og-image.png`],
        address: {
          '@type': 'PostalAddress',
          streetAddress: '15 Sky Tower, Zamalek',
          addressLocality: 'Cairo',
          addressCountry: 'EG',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 30.0626,
          longitude: 31.2197,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '12:00',
            closes: '23:00',
          },
        ],
        acceptsReservations: 'False',
        hasMenu: `${SITE_URL}/menu`,
        sameAs: [
          'https://www.instagram.com/pizzaheight',
          'https://www.facebook.com/pizzaheight',
          'https://twitter.com/pizzaheight',
        ],
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: ['en', 'ar'],
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/menu?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function MenuJsonLd({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const sections = categories.flatMap((cat) => {
    const sectionItems = items.filter((item) => item.categoryId === cat.id);
    if (sectionItems.length === 0) return [];
    return [
      {
        '@type': 'MenuSection',
        name: cat.name,
        description: cat.description ?? undefined,
        hasMenuItem: sectionItems.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          image: item.imageUrl ?? undefined,
          offers: {
            '@type': 'Offer',
            price: Number(item.basePrice).toFixed(2),
            priceCurrency: 'USD',
            availability: item.isAvailable
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        })),
      },
    ];
  });

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Menu',
        '@id': `${SITE_URL}/menu#menu`,
        name: `${SITE_NAME} Menu`,
        inLanguage: 'en',
        hasMenuSection: sections,
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
