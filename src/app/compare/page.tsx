'use client';

import Header from '@/components/layout/Header';
import { usePokedexStore } from '@/store/pokedex';
import { useQueries } from '@tanstack/react-query';
import { getPokemonDetail } from '@/lib/api';
import { TYPE_COLORS } from '@/types/pokemon';
import { 
  ArrowLeft, 
  Loader2, 
  Scale, 
  Swords, 
  Ruler, 
  Weight,
  Sparkles,
  X,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn, formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMemo, useEffect, useState } from 'react';

const STAT_LABELS: Record<string, string> = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  'speed': 'SPD',
};

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = usePokedexStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const pokemonQueries = useQueries({
    queries: compareList.map(id => ({
      queryKey: ['pokemon', id],
      queryFn: () => getPokemonDetail(id.toString()),
      staleTime: 10 * 60 * 1000,
    }))
  });

  const isLoading = pokemonQueries.some(q => q.isLoading);
  const pokemonData = pokemonQueries.map(q => q.data).filter(Boolean);

  const bestStats = useMemo(() => {
    if (pokemonData.length === 0) return {};
    
    const stats: Record<string, { val: number, index: number }> = {
      total: { val: -1, index: -1 },
      hp: { val: -1, index: -1 },
      attack: { val: -1, index: -1 },
      defense: { val: -1, index: -1 },
      'special-attack': { val: -1, index: -1 },
      'special-defense': { val: -1, index: -1 },
      speed: { val: -1, index: -1 },
    };

    pokemonData.forEach((p, idx) => {
      if (!p) return;
      const total = p.stats.reduce((acc, s) => acc + s.base_stat, 0);
      if (total > stats.total.val) stats.total = { val: total, index: idx };

      p.stats.forEach(s => {
        if (s.base_stat > (stats[s.stat.name]?.val || -1)) {
          stats[s.stat.name] = { val: s.base_stat, index: idx };
        }
      });
    });

    return stats;
  }, [pokemonData]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <section className="mb-12 pt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="rounded-full bg-secondary/30"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-3">
                  <Scale className="w-8 h-8 text-primary" />
                  Compare
                </h2>
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mt-1">
                  Comparing {pokemonData.length} Pokémon
                </p>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={clearCompare}
              className="rounded-xl font-black uppercase tracking-widest gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
        </section>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-foreground/40 font-semibold tracking-widest uppercase text-sm">Preparing comparison...</p>
          </div>
        ) : pokemonData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-foreground/50 glass-panel rounded-[3rem] border-dashed border-2 border-white/10">
            <Scale className="w-16 h-16 text-foreground/20 mb-6" />
            <h3 className="text-2xl font-black mb-2 text-foreground/80">No Pokémon to compare</h3>
            <p className="text-base text-foreground/50 font-medium mb-8">Add Pokémon from the Pokédex to start comparing them.</p>
            <Button onClick={() => router.push('/')} className="rounded-xl font-black uppercase px-8">Browse Pokédex</Button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            pokemonData.length === 1 ? "grid-cols-1 max-w-md mx-auto" : 
            pokemonData.length === 2 ? "grid-cols-1 md:grid-cols-2" : 
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {pokemonData.map((p, idx) => {
              if (!p) return null;
              const color = TYPE_COLORS[p.types[0].type.name];
              const totalStats = p.stats.reduce((acc, s) => acc + s.base_stat, 0);
              const isOverallBest = bestStats.total?.index === idx;

              return (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-6 rounded-[2.5rem] relative overflow-hidden flex flex-col group"
                  style={{ '--type-color': `${color}20` } as React.CSSProperties}
                >
                  <button 
                    onClick={() => removeFromCompare(p.id)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-secondary/50 hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center text-center mb-8 relative z-10">
                    <div className="text-xs font-black text-foreground/30 mb-2">{formatId(p.id)}</div>
                    <div className="relative w-40 h-40 mb-4">
                      <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/5 transition-colors" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={p.sprites.other['official-artwork'].front_default || p.sprites.front_default} 
                        alt={p.name} 
                        className="w-full h-full object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <h3 className="text-2xl font-black capitalize mb-4">{p.name}</h3>
                    <div className="flex gap-2 justify-center">
                      {p.types.map(t => (
                        <span 
                          key={t.type.name} 
                          className="glass-tag px-4 py-1 text-[10px]"
                          style={{ backgroundColor: `${TYPE_COLORS[t.type.name]}cc`, borderColor: TYPE_COLORS[t.type.name] }}
                        >
                          {t.type.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 flex-1">
                    {/* Size & Weight */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/20 p-3 rounded-2xl flex flex-col items-center">
                        <Ruler className="w-4 h-4 text-foreground/30 mb-1" />
                        <span className="text-[10px] font-bold text-foreground/40 uppercase mb-1">Height</span>
                        <span className="font-black text-sm">{p.height / 10} m</span>
                      </div>
                      <div className="bg-secondary/20 p-3 rounded-2xl flex flex-col items-center">
                        <Weight className="w-4 h-4 text-foreground/30 mb-1" />
                        <span className="text-[10px] font-bold text-foreground/40 uppercase mb-1">Weight</span>
                        <span className="font-black text-sm">{p.weight / 10} kg</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                          <Swords className="w-3 h-3" /> Base Stats
                        </h4>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                          isOverallBest ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : "bg-secondary/50 text-foreground/40"
                        )}>
                          Total: {totalStats} {isOverallBest && "★"}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {p.stats.map(s => {
                          const isBest = bestStats[s.stat.name]?.index === idx;
                          return (
                            <div key={s.stat.name} className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                                <span className={cn(isBest ? "text-primary" : "text-foreground/40")}>
                                  {STAT_LABELS[s.stat.name]}
                                </span>
                                <span className={cn(isBest ? "text-primary font-black" : "text-foreground/70")}>
                                  {s.base_stat} {isBest && "🏆"}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(s.base_stat / 255) * 100}%` }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: isBest ? 'rgb(255, 50, 50)' : color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Abilities */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Abilities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {p.abilities.map(a => (
                          <div 
                            key={a.ability.name} 
                            className="px-3 py-1.5 bg-secondary/20 border border-white/5 rounded-xl text-[10px] font-bold capitalize"
                          >
                            {a.ability.name.replace('-', ' ')}
                            {a.is_hidden && <span className="ml-1 opacity-40 text-[8px]">H</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
