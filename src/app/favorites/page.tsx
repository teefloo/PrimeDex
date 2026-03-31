'use client';

import Header from '@/components/layout/Header';
import { usePrimeDexStore } from '@/store/primedex';
import { useQuery } from '@tanstack/react-query';
import { getAllPokemonNames } from '@/lib/api';
import { PokemonCard } from '@/components/pokemon/PokemonCard';
import { Heart, Home, Ghost } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo, ButtonHTMLAttributes } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useMounted } from '@/hooks/useMounted';

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
  const { favorites } = usePrimeDexStore();
  const mounted = useMounted();
  const { t } = useTranslation();

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
        <section className="mb-12 pt-14">
          {/* Hero area */}
          <div className="relative mb-8">
            <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex items-center gap-5">
              <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/15 backdrop-blur-xl">
                <Heart className="w-8 h-8 text-rose-400 fill-current" />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">
                  {t('favorites.title')}
                </h2>
                <p className="text-foreground/30 font-bold uppercase tracking-[0.2em] text-[10px] mt-1.5">
                  {t('favorites.subtitle')} {mounted ? t('favorites.count', { count: favoritePokemon.length }) : ''}
                </p>
              </div>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-rose-500/20 via-white/[0.04] to-transparent" />
        </section>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-foreground/30 font-black tracking-[0.2em] uppercase text-[10px]">{t('favorites.loading')}</p>
          </div>
        ) : favoritePokemon.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-32 text-foreground/50 glass-panel rounded-[3rem] max-w-2xl mx-auto border-dashed border border-white/[0.06]"
          >
            <div className="p-6 bg-white/[0.03] rounded-full mb-6">
              <Ghost className="w-16 h-16 text-foreground/20" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-foreground/70 tracking-tight">{t('favorites.empty_title')}</h3>
            <p className="text-sm text-foreground/40 font-medium mb-8 text-center px-6 max-w-md">
              {t('favorites.empty_desc')}
            </p>
            <Link href="/">
              <FavoriteButton className="glass-btn px-8 py-4 flex items-center gap-2 hover:scale-105 transition-all">
                <Home className="w-5 h-5" />
                <span className="font-black uppercase tracking-[0.15em] text-sm">{t('favorites.back')}</span>
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
        </div>
      </footer>
    </div>
  );
}
