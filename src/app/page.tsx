import Header from '@/components/layout/Header';
import PokemonList from '@/components/pokemon/PokemonList';
import RecentlyViewed from '@/components/pokemon/RecentlyViewed';
import HeroSection from '@/components/layout/HeroSection';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getPokemonList } from '@/lib/api';
import { getPokemonSummarySlice } from '@/lib/api/graphql';
import { pokemonKeys } from '@/lib/api/keys';
import { SITE_URL } from '@/lib/site';

export default async function Home() {
  const queryClient = new QueryClient();

  // Prefetch the first page of pokemon
  await queryClient.prefetchInfiniteQuery({
    queryKey: pokemonKeys.lists(),
    queryFn: getPokemonList,
    initialPageParam: 0,
  });
  await queryClient.prefetchQuery({
    queryKey: pokemonKeys.summarySlice(0, 80),
    queryFn: () => getPokemonSummarySlice(80, 0),
  });

  const baseUrl = SITE_URL;

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
