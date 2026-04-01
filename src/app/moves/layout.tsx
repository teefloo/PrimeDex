import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pokémon Moves — All Moves Database | PrimeDex',
  description: 'Browse all Pokémon moves with detailed stats, effects, and compatible Pokémon. Search and filter by type, category, power, and more.',
  alternates: {
    canonical: '/moves',
  },
  openGraph: {
    title: 'Pokémon Moves — All Moves Database | PrimeDex',
    description: 'Browse all Pokémon moves with detailed stats, effects, and compatible Pokémon.',
    url: '/moves',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokémon Moves — All Moves Database | PrimeDex',
    description: 'Browse all Pokémon moves with detailed stats, effects, and compatible Pokémon.',
  },
};

export default function MovesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Pokémon Moves Database — PrimeDex',
            applicationCategory: 'GameApplication',
            operatingSystem: 'All',
            description: 'Complete database of all Pokémon moves with detailed stats, effects, and compatible Pokémon lists.',
            url: 'https://primedex.vercel.app/moves',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      {children}
    </>
  );
}
