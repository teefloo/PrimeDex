import { Metadata } from 'next';
import { t } from '@/lib/server-i18n';

export const metadata: Metadata = {
  title: t('meta.compare_title'),
  description: t('meta.compare_description'),
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: t('meta.compare_title'),
    description: t('meta.compare_description'),
    url: '/compare',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.compare_title'),
    description: t('meta.compare_description'),
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://primedex.vercel.app';
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Pokémon Comparison Tool — PrimeDex',
            applicationCategory: 'GameApplication',
            operatingSystem: 'All',
            description: 'Compare Pokémon stats, types, abilities, and movesets side-by-side.',
            url: `${baseUrl}/compare`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      {children}
    </>
  );
}
