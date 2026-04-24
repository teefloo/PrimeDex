import { Metadata } from 'next';
import { t } from '@/lib/server-i18n';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: t('meta.types_title'),
  description: t('meta.types_description'),
  alternates: {
    canonical: '/types',
  },
  openGraph: {
    title: t('meta.types_title'),
    description: t('meta.types_description'),
    url: '/types',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.types_title'),
    description: t('meta.types_description'),
  },
};

export default function TypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = SITE_URL;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Pokémon Type Chart — PrimeDex',
            applicationCategory: 'GameApplication',
            operatingSystem: 'All',
            description: 'Interactive type chart showing strengths, weaknesses, resistances, and immunities for all 18 Pokémon types.',
            url: `${baseUrl}/types`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      {children}
    </>
  );
}
