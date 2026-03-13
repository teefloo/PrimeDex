import Header from '@/components/layout/Header';
import PokemonList from '@/components/pokemon/PokemonList';
import SearchBar from '@/components/pokemon/SearchBar';
import TypeFilter from '@/components/pokemon/TypeFilter';
import RegionFilter from '@/components/pokemon/RegionFilter';
import FavoriteToggle from '@/components/pokemon/FavoriteToggle';
import CaughtFilter from '@/components/pokemon/CaughtFilter';
import SortSelector from '@/components/pokemon/SortSelector';
import RecentlyViewed from '@/components/pokemon/RecentlyViewed';
import AdvancedFiltersWrapper from '@/components/pokemon/AdvancedFilters';
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-transparent relative">
        <Header />

        <main className="container mx-auto px-4 py-8 relative z-10">
          <section className="text-center mb-12 pt-10">
            <div className="inline-block mb-6 relative group">
              <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full group-hover:bg-primary/50 transition-colors duration-700" />
              <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-orange-500 tracking-tighter drop-shadow-sm relative z-10">
                {t('home.hero_title')}
              </h2>
            </div>
            <p className="text-foreground/60 mt-2 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
              {t('home.hero_subtitle')}
            </p>

            <div className="flex flex-col items-center mt-12 w-full max-w-5xl mx-auto space-y-8">
              <SearchBar />

              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-3">
                  <FavoriteToggle />
                  <CaughtFilter />
                  <AdvancedFiltersWrapper />
                </div>
                <div className="h-px flex-1 bg-border/50 hidden md:block" />
                <SortSelector />
              </div>

              <div className="w-full space-y-4">
                <RegionFilter />
                <TypeFilter />
              </div>
            </div>
          </section>

          <PokemonList />
          <RecentlyViewed />
        </main>

        <footer className="py-12 text-center text-xs text-foreground/40 font-semibold border-t border-border mt-20 bg-background/40 backdrop-blur-xl relative z-10">
          <p>{t('home.footer_copyright', { year: new Date().getFullYear() })}</p>
          <p className="mt-4 opacity-50">{t('home.footer_data')}</p>
        </footer>
      </div>
    </HydrationBoundary>
  );
}

