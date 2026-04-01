import Header from '@/components/layout/Header';
import PokemonList from '@/components/pokemon/PokemonList';
import RecentlyViewed from '@/components/pokemon/RecentlyViewed';
import HeroSection from '@/components/layout/HeroSection';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getPokemonList } from '@/lib/api';
import { pokemonKeys } from '@/lib/api/keys';
import { t } from '@/lib/server-i18n';

export default async function Home() {
  const queryClient = new QueryClient();

  // Prefetch the first page of pokemon
  await queryClient.prefetchInfiniteQuery({
    queryKey: pokemonKeys.lists('en'),
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
      <div className="min-h-screen bg-transparent relative">
        <Header />

        <main className="container mx-auto px-4 py-8 relative z-10">
          <HeroSection />

          <PokemonList />
          <RecentlyViewed />
        </main>

        {/* ── FOOTER ── */}
        <footer className="relative z-10 mt-24 border-t border-white/[0.04]">
          <div className="py-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/20" />
              <span className="text-lg font-black gradient-text-primary tracking-tighter">PrimeDex</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/20" />
            </div>
            <p className="text-[11px] font-semibold text-foreground/25 tracking-wider">
              {t('home.footer_copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="mt-3 text-[10px] text-foreground/15 tracking-wide">
              {t('home.footer_data')}
            </p>
          </div>
        </footer>
      </div>
    </HydrationBoundary>
  );
}
