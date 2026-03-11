import Header from '@/components/layout/Header';
import PokemonList from '@/components/pokemon/PokemonList';
import SearchBar from '@/components/pokemon/SearchBar';
import TypeFilter from '@/components/pokemon/TypeFilter';
import RegionFilter from '@/components/pokemon/RegionFilter';
import FavoriteToggle from '@/components/pokemon/FavoriteToggle';
import SortSelector from '@/components/pokemon/SortSelector';

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <section className="text-center mb-12 pt-10">
          <div className="inline-block mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-primary/50 tracking-tighter drop-shadow-sm relative z-10">
              Gotta Catch &apos;Em All!
            </h2>
          </div>
          <p className="text-foreground/60 mt-2 text-sm md:text-base font-bold tracking-[0.2em] uppercase">
            The Ultimate Pokédex Experience
          </p>

          <div className="flex flex-col items-center mt-12 w-full max-w-5xl mx-auto space-y-8">
            <SearchBar />
            
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-3">
                <FavoriteToggle />
              </div>
              <div className="h-px flex-1 bg-white/5 hidden md:block" />
              <SortSelector />
            </div>

            <div className="w-full space-y-4">
              <RegionFilter />
              <TypeFilter />
            </div>
          </div>
        </section>

        <PokemonList />
      </main>

      <footer className="py-12 text-center text-xs text-foreground/40 font-semibold border-t border-white/5 mt-20 bg-background/40 backdrop-blur-md relative z-10">
        <p>Pokédex Generation © {new Date().getFullYear()}</p>
        <p className="mt-4 opacity-50">Data provided by PokéAPI</p>
      </footer>
    </div>
  );
}
