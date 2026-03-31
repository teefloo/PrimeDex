'use client';

import Header from '@/components/layout/Header';
import { usePrimeDexStore } from '@/store/primedex';
import { useQueries } from '@tanstack/react-query';
import { getPokemonDetail, getPokemonSpecies } from '@/lib/api';
import { TYPE_COLORS, PokemonDetail, PokemonSpecies } from '@/types/pokemon';
import { 
  ArrowLeft, 
  Loader2, 
  Scale, 
  Swords, 
  Ruler, 
  Weight,
  Sparkles,
  X,
  Trash2,
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn, formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  Legend
} from 'recharts';
const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'] as const;

import Image from 'next/image';

export default function ComparePage() {
  const { language, systemLanguage, compareList, removeFromCompare, clearCompare } = usePrimeDexStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const resolvedLang = mounted 
    ? (language === 'auto' ? systemLanguage : language) 
    : i18n.language || 'en';

  const statLabels: Record<string, string> = useMemo(() => ({
    'hp': t('stats.hp_short'),
    'attack': t('stats.attack_short'),
    'defense': t('stats.defense_short'),
    'special-attack': t('stats.special_attack_short'),
    'special-defense': t('stats.special_defense_short'),
    'speed': t('stats.speed_short'),
  }), [t]);

  const pokemonQueries = useQueries({
    queries: compareList.map(id => ({
      queryKey: ['pokemon-compare', id, resolvedLang],
      queryFn: async () => {
        const [pokemon, species] = await Promise.all([
          getPokemonDetail(id.toString()),
          getPokemonSpecies(id.toString()).catch(() => null)
        ]);
        return { pokemon, species };
      },
      staleTime: 10 * 60 * 1000,
    }))
  });

  const isLoading = pokemonQueries.some(q => q.isLoading);
  const compareData = useMemo(() => 
    pokemonQueries.map(q => q.data).filter((d): d is { pokemon: PokemonDetail, species: PokemonSpecies | null } => !!d),
    [pokemonQueries]
  );

  const chartData = useMemo(() => {
    if (compareData.length === 0) return [];
    
    return STAT_KEYS.map((stat) => {
      const data: Record<string, string | number> = { 
        stat: statLabels[stat],
        fullMark: 255 
      };
      compareData.forEach(d => {
        if (d.pokemon) {
          const s = d.pokemon.stats.find((st) => st.stat.name === stat);
          data[d.pokemon.name] = s ? s.base_stat : 0;
        }
      });
      return data;
    });
  }, [compareData, statLabels]);

  const bestStats = useMemo(() => {
    if (compareData.length === 0) return {};
    
    const stats: Record<string, { val: number, index: number }> = {
      total: { val: -1, index: -1 },
      hp: { val: -1, index: -1 },
      attack: { val: -1, index: -1 },
      defense: { val: -1, index: -1 },
      'special-attack': { val: -1, index: -1 },
      'special-defense': { val: -1, index: -1 },
      speed: { val: -1, index: -1 },
    };

    compareData.forEach((d, idx) => {
      if (!d.pokemon) return;
      const total = d.pokemon.stats.reduce((acc: number, s) => acc + s.base_stat, 0);
      if (total > stats.total.val) stats.total = { val: total, index: idx };

      d.pokemon.stats.forEach((s) => {
        if (s.base_stat > (stats[s.stat.name]?.val || -1)) {
          stats[s.stat.name] = { val: s.base_stat, index: idx };
        }
      });
    });

    return stats;
  }, [compareData]);

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
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-3">
                  <Scale className="w-8 h-8 text-primary" />
                  {t('compare.title')}
                </h2>
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mt-1">
                  {t('compare.comparing', { count: compareData.length })}
                </p>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={clearCompare}
              className="rounded-xl font-black uppercase tracking-widest gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('compare.clear')}
            </Button>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
        </section>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-foreground/40 font-semibold tracking-widest uppercase text-sm">{t('list.loading')}</p>
          </div>
        ) : compareData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-foreground/50 glass-panel rounded-[3rem] border-dashed border-2 border-white/10">
            <Scale className="w-16 h-16 text-foreground/20 mb-6" />
            <h3 className="text-2xl font-black mb-2 text-foreground/80">{t('compare.no_compare')}</h3>
            <p className="text-base text-foreground/50 font-medium mb-8">{t('compare.no_compare_desc')}</p>
            <Button onClick={() => router.push('/')} className="rounded-xl font-black uppercase px-8">{t('compare.browse_pokedex')}</Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Radar Chart Section */}
            {compareData.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 rounded-[3rem] overflow-hidden"
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis 
                          dataKey="stat" 
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold' }} 
                        />
                        {compareData.map((d) => d.pokemon && (
                          <Radar
                            key={d.pokemon.id}
                            name={d.species?.names?.find((n) => n.language.name === resolvedLang)?.name || d.pokemon.name}
                            dataKey={d.pokemon.name}
                            stroke={TYPE_COLORS[d.pokemon.types[0].type.name]}
                            fill={TYPE_COLORS[d.pokemon.types[0].type.name]}
                            fillOpacity={0.3}
                          />
                        ))}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-6">
                  <div>
                      <h3 className="text-2xl font-black mb-2 tracking-tight">{t('compare.stat_winners')}</h3>
                      <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest mb-6">{t('compare.top_performers')}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(bestStats).map(([key, info]) => {
                        if (key === 'total') return null;
                        const winner = compareData[info.index];
                        if (!winner || !winner.pokemon) return null;
                        const winnerName = winner.species?.names?.find((n) => n.language.name === resolvedLang)?.name || winner.pokemon.name;
                        return (
                          <div key={key} className="bg-secondary/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-1 hover:border-primary/30 transition-all">
                            <span className="text-[10px] font-black uppercase text-foreground/40">{statLabels[key]}</span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-black text-sm capitalize truncate">{winnerName}</span>
                              <span className="font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg text-xs">{info.val}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {bestStats.total && (
                      <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">{t('compare.overall_champion')}</p>
                            <h4 className="text-xl font-black capitalize">
                              {compareData[bestStats.total.index]?.species?.names?.find((n) => n.language.name === resolvedLang)?.name || compareData[bestStats.total.index]?.pokemon?.name}
                            </h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-foreground/40 mb-1">{t('compare.total_stats')}</p>
                          <p className="text-2xl font-black text-primary">{bestStats.total.val}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className={cn(
              "grid gap-6",
              compareData.length === 1 ? "grid-cols-1 max-w-md mx-auto" : 
              compareData.length === 2 ? "grid-cols-1 md:grid-cols-2" : 
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {compareData.map((d, idx) => {
                if (!d.pokemon) return null;
                const p = d.pokemon;
                const s_data = d.species;
                const color = TYPE_COLORS[p.types[0].type.name];
                const totalStats = p.stats.reduce((acc: number, s) => acc + s.base_stat, 0);
                const isOverallBest = bestStats.total?.index === idx;
                const displayName = s_data?.names?.find((n) => n.language.name === resolvedLang)?.name || p.name;

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
                      aria-label={t('card.remove_compare')}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col items-center text-center mb-8 relative z-10">
                      <div className="text-xs font-black text-foreground/30 mb-2">{formatId(p.id)}</div>
                      <div className="relative w-40 h-40 mb-4">
                        <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/5 transition-colors" />
                        <Image 
                          src={p.sprites.other['official-artwork'].front_default || p.sprites.front_default} 
                          alt={displayName} 
                          width={160}
                          height={160}
                          sizes="160px"
                          className="w-full h-full object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <h3 className="text-2xl font-black capitalize mb-4">{displayName}</h3>
                      <div className="flex gap-2 justify-center">
                        {p.types.map((typeItem) => (
                          <span 
                            key={typeItem.type.name} 
                            className="glass-tag px-4 py-1 text-[10px]"
                            style={{ backgroundColor: `${TYPE_COLORS[typeItem.type.name]}cc`, borderColor: TYPE_COLORS[typeItem.type.name] }}
                          >
                            {t(`types.${typeItem.type.name}`)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8 flex-1">
                      {/* Size & Weight */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/20 p-3 rounded-2xl flex flex-col items-center">
                          <Ruler className="w-4 h-4 text-foreground/30 mb-1" />
                          <span className="text-[10px] font-bold text-foreground/40 uppercase mb-1">{t('compare.height')}</span>
                          <span className="font-black text-sm">{p.height / 10} m</span>
                        </div>
                        <div className="bg-secondary/20 p-3 rounded-2xl flex flex-col items-center">
                          <Weight className="w-4 h-4 text-foreground/30 mb-1" />
                          <span className="text-[10px] font-bold text-foreground/40 uppercase mb-1">{t('compare.weight')}</span>
                          <span className="font-black text-sm">{p.weight / 10} kg</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                            <Swords className="w-3 h-3" /> {t('compare.stats')}
                          </h4>
                          <div className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                            isOverallBest ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : "bg-secondary/50 text-foreground/40"
                          )}>
                            {t('compare.total')}: {totalStats} {isOverallBest ? t('compare.best') : ''}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {p.stats.map((s) => {
                            const isBest = bestStats[s.stat.name]?.index === idx;
                            return (
                              <div key={s.stat.name} className="space-y-1">
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                                  <span className={cn(isBest ? "text-primary" : "text-foreground/40")}>
                                    {statLabels[s.stat.name]}
                                  </span>
                                  <span className={cn(isBest ? "text-primary font-black" : "text-foreground/70")}>
                                    {s.base_stat} {isBest ? t('compare.best') : ''}
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
                          <Sparkles className="w-3 h-3" /> {t('detail.abilities')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {p.abilities.map((a) => (
                            <div 
                              key={a.ability.name} 
                              className="px-3 py-1.5 bg-secondary/20 border border-white/5 rounded-xl text-[10px] font-bold capitalize"
                            >
                              {a.ability.name.replace('-', ' ')}
                              {a.is_hidden && <span className="ml-1 opacity-40 text-[8px]">{t('detail.hidden')}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


