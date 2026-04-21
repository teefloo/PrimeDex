'use client';

import Header from '@/components/layout/Header';
import PageHeader from '@/components/layout/PageHeader';
import { TYPE_COLORS } from '@/types/pokemon';
import { useQuery } from '@tanstack/react-query';
import { getTypeRelations, getAllPokemonDetailed } from '@/lib/api';
import { 
  ShieldCheck, 
  ShieldAlert,
  Info,
  Flame,
  Target,
  Sword,
  Star
} from 'lucide-react';
import { TYPE_ICONS } from '@/lib/pokemon-utils';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const TypeChart = dynamic(() => import('@/components/pokemon/TypeChart'), { ssr: false });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

export default function TypesPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>('fire');

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

  return (
    <div className="app-page text-foreground pb-20 overflow-x-hidden relative">
      {/* Decorative background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full blur-[120px] animate-pulse-glow opacity-30"
          style={{ backgroundColor: TYPE_COLORS[selectedType] }}
        />
        <div className="absolute top-1/3 right-1/4 w-[200px] h-[100px] bg-violet-500/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-2/3 left-1/4 w-[150px] h-[80px] bg-amber-500/8 rounded-full blur-[60px] animate-pulse-glow" style={{ animationDelay: '-2s' }} />
      </div>

      <Header />
      
      <main className="page-shell py-8 relative z-10">
        <PageHeader
          icon={Target}
          title={t('types_page.title')}
          subtitle={t('types_page.subtitle')}
          eyebrow={t('types_page.eyebrow', { defaultValue: 'PrimeDex' })}
          className="mt-16 md:mt-20"
        />

        {/* Type Selector - Horizontal Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="page-surface p-4 md:p-6 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/30 rounded-xl">
                <Flame className="w-4 h-4 text-foreground/60" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">{t('types_page.select_type')}</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.keys(TYPE_COLORS).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
                    selectedType === type 
                      ? "bg-white/10 border-white/20 shadow-lg" 
                      : "bg-secondary/20 border-white/5 opacity-60 hover:opacity-100 hover:bg-secondary/30"
                  )}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: TYPE_COLORS[type] }} 
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t(`types.${type}`)}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Full-width Type Chart Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-10"
        >
          <TypeChart onTypeClick={(type) => setSelectedType(type)} />
        </motion.div>

        {/* Main Analysis Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedType}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Type Header Card */}
            <motion.div variants={itemVariants} className="page-surface p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div 
                className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-15 transition-all duration-700 group-hover:scale-110 group-hover:opacity-25"
                style={{ backgroundColor: TYPE_COLORS[selectedType] }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div 
                    className="p-4 rounded-2xl text-white shadow-xl"
                    style={{ backgroundColor: TYPE_COLORS[selectedType] }}
                  >
                    {(() => {
                      const IconComponent = TYPE_ICONS[selectedType];
                      return IconComponent ? <IconComponent className="w-7 h-7 fill-current" /> : null;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black capitalize tracking-tight">{t(`types.${selectedType}`)}</h3>
                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-1">{t('types_page.elemental_mastery')}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Offensive strengths */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/60 flex items-center gap-2">
                      <Sword className="w-3.5 h-3.5" /> {t('types_page.strong_against')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {typeRels?.damage_relations.double_damage_to.map(t_rel => (
                        <motion.div 
                          key={t_rel.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="px-3 py-1.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-[10px] font-black uppercase hover:bg-yellow-500/10 transition-colors" 
                          style={{ color: TYPE_COLORS[t_rel.name] }}
                        >
                          {t(`types.${t_rel.name}`)}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Defensive strengths */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/60 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> {t('types_page.resists')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {typeRels?.damage_relations.half_damage_from.map(t_rel => (
                        <motion.div 
                          key={t_rel.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                          className="px-3 py-1.5 rounded-xl bg-green-500/5 border border-green-500/10 text-[10px] font-black uppercase hover:bg-green-500/10 transition-colors" 
                          style={{ color: TYPE_COLORS[t_rel.name] }}
                        >
                          {t(`types.${t_rel.name}`)}
                        </motion.div>
                      ))}
                      {typeRels?.damage_relations.no_damage_from.map(t_rel => (
                        <motion.div 
                          key={t_rel.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] font-black uppercase hover:bg-blue-500/10 transition-colors text-blue-400"
                        >
                          {t(`types.${t_rel.name}`)} ({t('types_page.immune')})
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Weaknesses Warning */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-500/5 border border-red-500/10 backdrop-blur-xl p-5 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-red-500/10 rounded-xl h-fit flex-shrink-0">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 mb-2">{t('types_page.weak_to')}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {typeRels?.damage_relations.double_damage_from.map(t_rel => (
                      <span key={t_rel.name} className="px-2.5 py-1 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[t_rel.name] }}>
                        {t(`types.${t_rel.name}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 backdrop-blur-xl p-5 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-blue-500/10 rounded-xl h-fit flex-shrink-0">
                  <Sword className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 mb-2">{t('types_page.not_effective_against')}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {typeRels?.damage_relations.half_damage_to.map(t_rel => (
                      <span key={t_rel.name} className="px-2.5 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 text-[10px] font-black uppercase" style={{ color: TYPE_COLORS[t_rel.name] }}>
                        {t(`types.${t_rel.name}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Emblematic Pokemon */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-xl font-black px-2 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                {t('types_page.emblematic')}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {emblematicPokemon.map((p, idx) => (
                  <Link key={p.id} href={`/pokemon/${p.name}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/[0.03] dark:bg-white/[0.02] border border-white/[0.06] dark:border-white/[0.04] p-4 rounded-2xl flex flex-col items-center group hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 active:scale-95 relative overflow-hidden"
                    >
                      <div 
                        className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-[30px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                        style={{ backgroundColor: TYPE_COLORS[selectedType] }}
                      />
                      <div className="relative w-20 h-20 mb-3">
                        <Image 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`} 
                          alt={p.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="font-black capitalize text-xs group-hover:text-primary transition-colors text-center truncate w-full">{p.name}</span>
                      <span className="text-[9px] font-bold text-foreground/40 mt-0.5 uppercase tracking-widest">{p.pokemon_v2_pokemonstats.reduce((s, curr) => s + curr.base_stat, 0)}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Learning Tips */}
            <motion.div variants={itemVariants} className="page-surface p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                {t('types_page.tips_title', { type: t(`types.${selectedType}`) })}
              </h3>
              <div className="space-y-3">
                <div className="flex gap-4 p-4 rounded-2xl bg-background/40 border border-white/5">
                  <div className="p-2 bg-red-500/10 rounded-xl h-fit flex-shrink-0">
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
                  <div className="p-2 bg-blue-500/10 rounded-xl h-fit flex-shrink-0">
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
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


