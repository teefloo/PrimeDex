import Header from '@/components/layout/Header';
import PokemonList from '@/components/pokemon/PokemonList';
import RecentlyViewed from '@/components/pokemon/RecentlyViewed';
import HeroSection from '@/components/layout/HeroSection';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getPokemonList } from '@/lib/api';
import { pokemonKeys } from '@/lib/api/keys';

export default async function Home() {
  const queryClient = new QueryClient();

  // Prefetch the first page of pokemon
  await queryClient.prefetchInfiniteQuery({
    queryKey: pokemonKeys.lists(),
    queryFn: getPokemonList,
    initialPageParam: 0,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://primedex.vercel.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PrimeDex',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PrimeDex Dashboard',
    operatingSystem: 'All',
    applicationCategory: 'GameApplication',
    description: 'A high-performance Gaming Dashboard for Pokémon tracking and team building.',
    url: baseUrl,
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <div className="app-page">
        <Header />

        <main className="relative z-10 pt-28 pb-8 md:pt-32">
          <HeroSection />

          <PokemonList />
          <RecentlyViewed />
        </main>


      </div>
    </HydrationBoundary>
  );
}
