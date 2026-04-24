import { Metadata } from 'next';
import { t } from '@/lib/server-i18n';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: t('meta.quiz_title'),
  description: t('meta.quiz_description'),
  alternates: {
    canonical: '/quiz',
  },
  openGraph: {
    title: t('meta.quiz_title'),
    description: t('meta.quiz_description'),
    url: '/quiz',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.quiz_title'),
    description: t('meta.quiz_description'),
  },
};

export default function QuizLayout({
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
            name: "Who's That Pokémon? — PrimeDex Quiz",
            applicationCategory: 'GameApplication',
            operatingSystem: 'All',
            description: 'Test your Pokémon knowledge with classic, silhouette, and stats quiz modes.',
            url: `${baseUrl}/quiz`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      {children}
    </>
  );
}
