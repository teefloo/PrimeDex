'use client';

import Header from '@/components/layout/Header';
import { usePokedexStore } from '@/store/pokedex';
import { useQueries } from '@tanstack/react-query';
import { getPokemonDetail, getTypeRelations } from '@/lib/api';
import { TYPE_COLORS } from '@/types/pokemon';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Info,
  Sword,
  X,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useMemo, useEffect, useState, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

export default function TeamPage() {
  const { team, removeFromTeam, clearTeam } = usePokedexStore();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const pokemonQueries = useQueries({
    queries: team.map(id => ({
      queryKey: ['pokemon', id],
      queryFn: () => getPokemonDetail(id.toString()),
      staleTime: 10 * 60 * 1000,
    }))
  });

  const pokemonData = pokemonQueries.map(q => q.data).filter(Boolean);

  // Type relations for the whole team
  const typeRelationsQueries = useQueries({
    queries: pokemonData.flatMap(p => 
      p!.types.map(t => ({
        queryKey: ['typeRelations', t.type.name],
        queryFn: () => getTypeRelations(t.type.name),
        staleTime: 24 * 60 * 60 * 1000,
      }))
    )
  });

  const analysis = useMemo(() => {
    if (pokemonData.length === 0 || typeRelationsQueries.some(q => q.isLoading)) return null;

    const teamWeaknesses: Record<string, number> = {};
    const teamResistances: Record<string, number> = {};
    const typeCoverage: Set<string> = new Set();

    Object.keys(TYPE_COLORS).forEach(t => {
      teamWeaknesses[t] = 0;
      teamResistances[t] = 0;
    });

    let queryIndex = 0;

    pokemonData.forEach(p => {
      if (!p) return;
      p.types.forEach(t => typeCoverage.add(t.type.name));

      // Calculate weaknesses for this specific pokemon
      const pokemonEffectiveness: Record<string, number> = {};
      Object.keys(TYPE_COLORS).forEach(t => {
        pokemonEffectiveness[t] = 1;
      });

      p.types.forEach(pt => {
        const relations = typeRelationsQueries[queryIndex]?.data?.damage_relations;
        queryIndex++;
        if (relations) {
          relations.double_damage_from.forEach(t => { pokemonEffectiveness[t.name] *= 2; });
          relations.half_damage_from.forEach(t => { pokemonEffectiveness[t.name] *= 0.5; });
          relations.no_damage_from.forEach(t => { pokemonEffectiveness[t.name] *= 0; });
        }
      });

      Object.entries(pokemonEffectiveness).forEach(([type, mult]) => {
        if (type === 'unknown' || type === 'shadow') return;
        if (mult > 1) teamWeaknesses[type]++;
        if (mult < 1) teamResistances[type]++;
      });
    });

    const majorWeaknesses = Object.entries(teamWeaknesses).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]);
    const strongCoverage = Object.entries(teamResistances).filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]);
    const missingTypes = Object.keys(TYPE_COLORS).filter(t => !typeCoverage.has(t));

    return { majorWeaknesses, strongCoverage, missingTypes, typeCoverage };
  }, [pokemonData, typeRelationsQueries]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <section className="mb-12 pt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                  {t('team.title')}
                </h2>
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs mt-1">
                  {t('team.subtitle')} ({pokemonData.length}/6)
                </p>
              </div>
            </div>
            
            {pokemonData.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={clearTeam}
                className="rounded-xl font-black uppercase tracking-widest gap-2"
              >
                <Trash2CustomIcon className="w-4 h-4" />
                {t('team.disband')}
              </Button>
            )}
          </div>
          <div className="h-px w-full bg-gradient-to-r from-border via-border to-transparent" />
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Team Slots */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => {
                const p = pokemonData[idx];
                return (
                  <div key={idx} className="h-64">
                    {p ? (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel h-full p-4 rounded-3xl flex flex-col items-center relative group"
                      >
                        <button 
                          onClick={() => removeFromTeam(p.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 text-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all z-20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <div className="relative w-28 h-28 mb-4">
                          <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={p.sprites.other['official-artwork'].front_default || p.sprites.front_default} 
                            alt={p.name} 
                            className="w-full h-full object-contain relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform"
                          />
                        </div>
                        
                        <h3 className="text-lg font-black capitalize mb-2">{p.name}</h3>
                        <div className="flex gap-1 justify-center">
                          {p.types.map(t => (
                            <span 
                              key={t.type.name} 
                              className="px-2 py-0.5 rounded-lg border border-white/5 text-[8px] font-black uppercase"
                              style={{ backgroundColor: `${TYPE_COLORS[t.type.name]}cc`, color: 'white' }}
                            >
                              {t.type.name}
                            </span>
                          ))}
                        </div>
                        
                        <Link href={`/pokemon/${p.name}`} className="mt-auto w-full">
                          <Button variant="ghost" className="w-full h-8 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors">
                            {t('team.details')}
                          </Button>
                        </Link>
                      </motion.div>
                    ) : (
                      <Link href="/" className="block h-full">
                        <div className="h-full rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-foreground/20 hover:border-primary/30 hover:text-primary/40 hover:bg-primary/5 transition-all group">
                          <div className="p-4 rounded-full bg-secondary/30 mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest">{t('team.add')}</span>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {pokemonData.length > 0 && analysis && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 md:p-8 rounded-[2.5rem]"
              >
                <h3 className="text-2xl font-black mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                  <Sword className="w-6 h-6 text-primary" />
                  {t('team.analysis')}
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Weakness Alert */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500/60 flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3" /> {t('team.shared_weaknesses')}
                    </h4>
                    {analysis.majorWeaknesses.length > 0 ? (
                      <div className="space-y-3">
                        {analysis.majorWeaknesses.map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{type}</span>
                            <div className="flex gap-1">
                              {Array.from({ length: count }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-red-500" />
                              ))}
                              <span className="text-[10px] font-bold text-foreground/40 ml-2">{count} {t('list.pokemon')}</span>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-foreground/40 italic mt-2">
                          {t('team.weakness_desc')}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 text-green-500/60 text-xs font-bold">
                        {t('team.no_weakness')}
                      </div>
                    )}
                  </div>

                  {/* Coverage Strength */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500/60 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> {t('team.defensive_strengths')}
                    </h4>
                    {analysis.strongCoverage.length > 0 ? (
                      <div className="space-y-3">
                        {analysis.strongCoverage.map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between p-3 bg-green-500/5 rounded-xl border border-green-500/10">
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{type}</span>
                            <div className="flex gap-1">
                              {Array.from({ length: count }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-green-500" />
                              ))}
                              <span className="text-[10px] font-bold text-foreground/40 ml-2">{count} resists</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-foreground/30 italic">{t('team.no_strengths')}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar / Suggestions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-[2.5rem]">
              <h3 className="text-lg font-black mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                {t('team.type_coverage')}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">{t('team.types_present')}</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(analysis?.typeCoverage || []).map(t => (
                      <span key={t} className="px-3 py-1 rounded-lg text-[9px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: TYPE_COLORS[t] }}>
                        {t}
                      </span>
                    ))}
                    {(analysis?.typeCoverage.size || 0) === 0 && <span className="text-[10px] text-foreground/20 italic">{t('team.no_pokemon')}</span>}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">{t('team.missing_types')}</p>
                  <div className="flex flex-wrap gap-2 opacity-40">
                    {analysis?.missingTypes.slice(0, 12).map(t => (
                      <span key={t} className="px-2 py-1 rounded-lg border border-white/10 text-[8px] font-bold uppercase">
                        {t}
                      </span>
                    ))}
                    {(analysis?.missingTypes.length || 0) > 12 && <span className="text-[8px] font-bold">...</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <h3 className="text-lg font-black mb-4 relative z-10">{t('team.export_title')}</h3>
              <p className="text-xs text-foreground/50 mb-6 leading-relaxed relative z-10">
                {t('team.export_desc')}
              </p>
              <div className="bg-background/50 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-foreground/60 break-all mb-4 relative z-10">
                {team.length > 0 ? team.join('-') : t('team.empty_team')}
              </div>
              <Button disabled={team.length === 0} className="w-full rounded-xl font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20">
                {t('team.copy_code')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Trash2CustomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
