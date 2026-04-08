'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Swords, Trophy, Target, Zap, Filter, X, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/layout/Header';
import { getAllMoves } from '@/lib/api/graphql';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TYPE_COLORS, MoveListItem } from '@/types/pokemon';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const MoveDetailModal = dynamic(() => import('./MoveDetailModal'), { ssr: false });

const LANGUAGE_MAP: Record<string, number> = {
  en: 9, fr: 5, es: 7, de: 6, it: 8, ja: 11, ko: 3,
};

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

const DAMAGE_CLASSES = ['physical', 'special', 'status'] as const;

type SortKey = 'id' | 'name' | 'power';

export default function MovesPageClient() {
  const { t, i18n } = useTranslation();
  const mounted = useMounted();
  const resolvedLang = i18n.resolvedLanguage || i18n.language || 'en';
  const languageId = LANGUAGE_MAP[resolvedLang] || 9;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('id');
  const [selectedMove, setSelectedMove] = useState<MoveListItem | null>(null);

  const { data: rawMoves, isLoading } = useQuery({
    queryKey: ['all-moves', languageId],
    queryFn: () => getAllMoves(languageId),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const moves: MoveListItem[] = useMemo(() => {
    if (!rawMoves) return [];
    return rawMoves.map((m) => ({
      id: m.id,
      name: m.name,
      power: m.power,
      accuracy: m.accuracy,
      pp: m.pp,
      priority: m.priority,
      type: m.pokemon_v2_type?.name || 'normal',
      damage_class: m.pokemon_v2_movedamageclass?.name || 'status',
      localizedName: m.pokemon_v2_movenames?.[0]?.name || m.name,
      description:
        m.pokemon_v2_moveflavortexts?.[0]?.flavor_text?.replace(/\n/g, ' ') ||
        m.pokemon_v2_moveeffect?.pokemon_v2_moveeffecteffecttexts?.[0]?.short_effect?.replace(/\n/g, ' ') ||
        '',
      generation_id: m.generation_id,
    }));
  }, [rawMoves]);

  const filteredMoves = useMemo(() => {
    let result = moves;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.localizedName.toLowerCase().includes(lower) ||
          m.name.toLowerCase().includes(lower)
      );
    }

    if (selectedType) {
      result = result.filter((m) => m.type === selectedType);
    }

    if (selectedClass) {
      result = result.filter((m) => m.damage_class === selectedClass);
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.localizedName.localeCompare(b.localizedName);
      if (sortBy === 'power') return (b.power || 0) - (a.power || 0);
      return a.id - b.id;
    });

    return result;
  }, [moves, searchTerm, selectedType, selectedClass, sortBy]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        {/* Hero */}
        <section className="mb-10 pt-10 text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-6">
            <Swords className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-5xl font-black tracking-tight mb-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            {t('moves_page.title')}
          </h2>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">
            {t('moves_page.subtitle')}
          </p>
        </section>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('moves_page.search_placeholder')}
              className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              aria-label={t('moves_page.search_placeholder')}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label={t('search.clear')}
              >
                <X className="w-3.5 h-3.5 text-foreground/40" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 h-12">
              <SlidersHorizontal className="w-4 h-4 text-foreground/30" />
              <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider hidden sm:inline">
                {t('moves_page.sort_by')}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
                aria-label={t('moves_page.sort_by')}
              >
                <option value="id">{t('moves_page.sort_id')}</option>
                <option value="name">{t('moves_page.sort_name')}</option>
                <option value="power">{t('moves_page.sort_power')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-foreground/30" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground/30">
              {t('moves_page.filter_by_type')}
            </span>
            {selectedType && (
              <button
                onClick={() => setSelectedType(null)}
                className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors ml-1"
              >
                {t('filters.clear_all')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border',
                  selectedType === type
                    ? 'text-white border-transparent shadow-lg'
                    : 'text-foreground/50 border-white/10 hover:border-white/20 hover:text-foreground/70 bg-white/[0.02]'
                )}
                style={selectedType === type ? { backgroundColor: TYPE_COLORS[type] } : undefined}
                aria-label={t(`types.${type}`)}
                aria-pressed={selectedType === type}
              >
                {t(`types.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Damage Class Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-foreground/30" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground/30">
              {t('moves_page.filter_by_class')}
            </span>
            {selectedClass && (
              <button
                onClick={() => setSelectedClass(null)}
                className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors ml-1"
              >
                {t('filters.clear_all')}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {DAMAGE_CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
                className={cn(
                  'px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border',
                  selectedClass === cls
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'text-foreground/50 border-white/10 hover:border-white/20 hover:text-foreground/70 bg-white/[0.02]'
                )}
                aria-label={t(`moves.damage_class.${cls}`)}
                aria-pressed={selectedClass === cls}
              >
                {t(`moves.damage_class.${cls}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <span className="text-xs font-bold text-foreground/30 uppercase tracking-widest">
            {isLoading
              ? t('moves_page.loading')
              : t('moves_page.results_count', { count: filteredMoves.length })}
          </span>
        </div>

        {/* Moves Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredMoves.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-white/[0.03] rounded-3xl border border-white/5 mb-4">
              <Search className="w-8 h-8 text-foreground/20" />
            </div>
            <p className="text-lg font-bold text-foreground/40">{t('moves_page.no_results')}</p>
            <p className="text-sm text-foreground/25 mt-1">{t('moves_page.no_results_desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredMoves.map((move) => (
                <MoveCard key={move.id} move={move} onClick={() => setSelectedMove(move)} t={t} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <MoveDetailModal
        move={selectedMove}
        open={!!selectedMove}
        onClose={() => setSelectedMove(null)}
      />
    </div>
  );
}

function MoveCard({
  move,
  onClick,
  t,
}: {
  move: MoveListItem;
  onClick: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const typeColor = TYPE_COLORS[move.type] || '#6B7280';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label={move.localizedName}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-foreground capitalize truncate group-hover:text-primary transition-colors">
              {move.localizedName}
            </h3>
            <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
              #{String(move.id).padStart(3, '0')}
            </span>
          </div>
          <Badge
            className="text-white text-[10px] font-bold px-2 py-0.5 shrink-0"
            style={{ backgroundColor: typeColor }}
          >
            {t(`types.${move.type}`)}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="text-[10px] border-white/10 text-foreground/50 font-bold">
            {t(`moves.damage_class.${move.damage_class}`)}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-foreground/50">
          {move.power !== null ? (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-orange-400/70" />
              <span className="font-bold">{move.power}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 opacity-30">
              <Trophy className="w-3 h-3" />
              <span>—</span>
            </div>
          )}

          {move.accuracy !== null ? (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-green-400/70" />
              <span className="font-bold">{move.accuracy}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 opacity-30">
              <Target className="w-3 h-3" />
              <span>—</span>
            </div>
          )}

          {move.pp !== null && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400/70" />
              <span className="font-bold">{move.pp}</span>
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}
