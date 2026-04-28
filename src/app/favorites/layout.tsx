import { Metadata } from 'next';
import { t } from '@/lib/server-i18n';

export const metadata: Metadata = {
  title: t('meta.favorites_title'),
  description: t('meta.favorites_description'),
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/favorites',
  },
  openGraph: {
    title: t('meta.favorites_title'),
    description: t('meta.favorites_description'),
    url: '/favorites',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.favorites_title'),
    description: t('meta.favorites_description'),
  },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
