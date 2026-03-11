'use client';

import Header from '@/components/layout/Header';
import { usePokedexStore } from '@/store/pokedex';
import { useQuery } from '@tanstack/react-query';
import { getAllPokemonNames } from '@/lib/api';
import { PokemonCard } from '@/components/pokemon/PokemonCard';
import { Heart, Home, Loader2, Ghost } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo, useEffect, useState, ButtonHTMLAttributes } from 'react';

interface FavoriteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function FavoriteButton({ children, className, ...props }: FavoriteButtonProps) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}

export default function FavoritesPage() {
  const { favorites } = usePokedexStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: allNames, isLoading } = useQuery({
    queryKey: ['allPokemonNames'],
    queryFn: getAllPokemonNames,
    staleTime: 30 * 60 * 1000,
  });

  const favoritePokemon = useMemo(() => {
    if (!allNames || !mounted) return [];
    return allNames.filter(p => {
      const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
      return favorites.includes(id);
    });
  }, [allNames, favorites, mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <section className="mb-12 pt-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                My Favorites
              </h2>
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mt-1">
                Your personal collection ({favoritePokemon.length} Pokémon)
              </p>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
        </section>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-foreground/40 font-semibold tracking-widest uppercase text-sm">Loading your collection...</p>
          </div>
        ) : favoritePokemon.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-foreground/50 glass-panel rounded-[3rem] max-w-2xl mx-auto border-dashed border-2 border-white/10"
          >
            <div className="p-6 bg-secondary/30 rounded-full mb-6">
              <Ghost className="w-16 h-16 text-foreground/30" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-foreground/80 tracking-tight">Your collection is empty</h3>
            <p className="text-base text-foreground/50 font-medium mb-8 text-center px-6">
              Start adding your favorite Pokémon by clicking the heart icon on their cards!
            </p>
            <Link href="/">
              <FavoriteButton className="glass-btn px-8 py-4 flex items-center gap-2 hover:scale-105 transition-all">
                <Home className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-sm">Back to Pokédex</span>
              </FavoriteButton>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favoritePokemon.map((p) => (
              <PokemonCard key={p.name} name={p.name} url={p.url} />
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-xs text-foreground/40 font-semibold border-t border-white/5 mt-20 bg-background/40 backdrop-blur-md relative z-10">
        <p>Pokédex Generation © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
