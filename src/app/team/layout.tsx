import { Metadata } from 'next';
import { t } from '@/lib/server-i18n';

export const metadata: Metadata = {
  title: t('meta.team_title'),
  description: t('meta.team_description'),
  alternates: {
    canonical: '/team',
  },
  openGraph: {
    title: t('meta.team_title'),
    description: t('meta.team_description'),
    url: '/team',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.team_title'),
    description: t('meta.team_description'),
  },
};

export default function TeamLayout({
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
            name: 'Pokémon Team Builder — PrimeDex',
            applicationCategory: 'GameApplication',
            operatingSystem: 'All',
            description: 'Build your ultimate Pokémon team with type coverage analysis, weakness detection, and synergy scores.',
            url: `${baseUrl}/team`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      {children}
    </>
  );
}
