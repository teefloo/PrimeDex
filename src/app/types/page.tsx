'use client';

import Header from '@/components/layout/Header';
import { TYPE_COLORS } from '@/types/pokemon';
import { useQuery } from '@tanstack/react-query';
import { getTypeRelations, getAllPokemonDetailed } from '@/lib/api';
import { 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Info,
  Flame,
  Target,
  Sword,
  Star
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const TypeChart = dynamic(() => import('@/components/pokemon/TypeChart'), { ssr: false });

export default function TypesPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>('fire');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: typeRels } = useQuery({
    queryKey: ['typeRelations', selectedType],
    queryFn: () => getTypeRelations(selectedType),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: allPokemon } = useQuery({
    queryKey: ['allPokemonDetailed'],
    queryFn: getAllPokemonDetailed,
    staleTime: 30 * 60 * 1000,
  });

  const emblematicPokemon = useMemo(() => {
    if (!allPokemon) return [];
    return allPokemon
      .filter(p => p.pokemon_v2_pokemontypes.some(t => t.pokemon_v2_type.name === selectedType))
      .sort((a, b) => {
        const totalA = a.pokemon_v2_pokemonstats.reduce((sum, s) => sum + s.base_stat, 0);
        const totalB = b.pokemon_v2_pokemonstats.reduce((sum, s) => sum + s.base_stat, 0);
        return totalB - totalA;
      })
      .slice(0, 6);
  }, [allPokemon, selectedType]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <section className="mb-12 pt-10 text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-6">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-5xl font-black tracking-tight mb-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{t('types_page.title')}</h2>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">{t('types_page.subtitle')}</p>
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Full-width Type Chart Matrix */}
          <div className="lg:col-span-12">
            <TypeChart onTypeClick={(type) => setSelectedType(type)} />
          </div>

          {/* Type Selector Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-6 rounded-[2.5rem]">
              <h3 className="text-xl font-black mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                <div className="p-2 bg-secondary/30 rounded-xl">
                  <Flame className="w-5 h-5 text-foreground/60" />
                </div>
                {t('types_page.select_type')}
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(TYPE_COLORS).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-2xl border transition-all duration-300",
                      selectedType === type 
                        ? "bg-white/10 border-white/20 shadow-lg scale-[1.02]" 
                        : "bg-secondary/20 border-white/5 opacity-60 hover:opacity-100 hover:bg-secondary/30"
                    )}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{t(`types.${type}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Analysis Section */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Type Header Card */}
                <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden group">
                  <div 
                    className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-all duration-700 group-hover:scale-110"
                    style={{ backgroundColor: TYPE_COLORS[selectedType] }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="p-4 rounded-3xl text-white shadow-xl"
                        style={{ backgroundColor: TYPE_COLORS[selectedType] }}
                      >
                        <Zap className="w-8 h-8 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-4xl font-black capitalize tracking-tight">{t(`types.${selectedType}`)}</h3>
                        <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">{t('types_page.elemental_mastery')}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Offensive strengths */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/60 flex items-center gap-2">
                          <Sword className="w-3 h-3" /> {t('types_page.strong_against')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {typeRels?.damage_relations.double_damage_to.map(t_rel => (
                            <div key={t_rel.name} className="px-3 py-1.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[t_rel.name] }}>
                              {t(`types.${t_rel.name}`)}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Defensive strengths */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/60 flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" /> {t('types_page.resists')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {typeRels?.damage_relations.half_damage_from.map(t_rel => (
                            <div key={t_rel.name} className="px-3 py-1.5 rounded-xl bg-green-500/5 border border-green-500/10 text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[t_rel.name] }}>
                              {t(`types.${t_rel.name}`)}
                            </div>
                          ))}
                          {typeRels?.damage_relations.no_damage_from.map(t_rel => (
                            <div key={t_rel.name} className="px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] font-black uppercase text-blue-400">
                              {t(`types.${t_rel.name}`)} ({t('types_page.immune')})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emblematic Pokemon */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-black px-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    {t('types_page.emblematic')}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {emblematicPokemon.map((p) => (
                      <Link key={p.id} href={`/pokemon/${p.name}`}>
                        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center group hover:border-primary/30 transition-all active:scale-95">
                          <div className="relative w-24 h-24 mb-4">
                            <div 
                              className="absolute inset-0 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"
                              style={{ backgroundColor: TYPE_COLORS[selectedType] }}
                            />
                            <Image 
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`} 
                              alt={p.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <span className="font-black capitalize text-base group-hover:text-primary transition-colors">{p.name}</span>
                          <span className="text-[10px] font-bold text-foreground/40 mt-1 uppercase tracking-widest">{t('detail.total')}: {p.pokemon_v2_pokemonstats.reduce((s, curr) => s + curr.base_stat, 0)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Learning Tips */}
                <div className="glass-panel p-8 rounded-[3rem] bg-primary/5 border-primary/10">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    {t('types_page.tips_title', { type: t(`types.${selectedType}`) })}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-2xl bg-background/40 border border-white/5">
                      <div className="p-2 bg-red-500/10 rounded-xl h-fit">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                      </div>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        {t('types_page.watch_out', { 
                          types: typeRels?.damage_relations.double_damage_from.map(t_rel => t(`types.${t_rel.name}`)).join(', '),
                          type: t(`types.${selectedType}`)
                        })}
                      </p>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-background/40 border border-white/5">
                      <div className="p-2 bg-blue-500/10 rounded-xl h-fit">
                        <Sword className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        {t('types_page.not_effective', { 
                          type: t(`types.${selectedType}`),
                          types: typeRels?.damage_relations.half_damage_to.map(t_rel => t(`types.${t_rel.name}`)).join(', ')
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}


