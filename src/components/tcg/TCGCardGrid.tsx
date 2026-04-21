'use client';

import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Loader2,
  LayoutGrid,
  List,
  Database,
  SortAsc,
  SortDesc,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TCGCard, TCGCardFilters } from '@/types/tcg';
import { TCGCardItem, TCGCardItemSkeleton } from './TCGCardItem';
import { TCGFilters } from './TCGFilters';
import { TCGCardDetailModal } from './TCGCardDetailModal';
import { DEFAULT_TCG_CARD_FILTERS, getTCGCard, searchCards } from '@/lib/api/tcg';
import { tcgKeys } from '@/lib/api/keys';
import { useMounted } from '@/hooks/useMounted';
import { usePrimeDexStore } from '@/store/primedex';
import { useTranslation } from '@/lib/i18n';

const PAGE_SIZE = 48;

export function TCGCardGrid() {
  const { t } = useTranslation();
  const mounted = useMounted();
  const { language } = usePrimeDexStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TCGCardFilters>(DEFAULT_TCG_CARD_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resolvedLang = mounted ? (language === 'auto' ? 'en' : language) : 'en';
  const queryFilters = useMemo(() => normalizeFilters(filters), [filters]);

  const {
    data: cardsData,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: tcgKeys.catalog(queryFilters, resolvedLang, PAGE_SIZE),
    queryFn: async ({ pageParam = 1 }) => searchCards(queryFilters, resolvedLang, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    enabled: mounted,
    staleTime: 5 * 60 * 1000,
  });

  const cards = cardsData?.pages.flatMap((page) => page.cards) ?? [];
  const loadedCount = cards.length;
  const hasResults = cards.length > 0;

  const handleFiltersChange = useCallback((newFilters: TCGCardFilters) => {
    setFilters(newFilters);
  }, []);

  const handleCardClick = useCallback((card: TCGCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  }, []);

  const handleCardHover = useCallback((card: TCGCard) => {
    void queryClient.prefetchQuery({
      queryKey: tcgKeys.card(card.id, resolvedLang),
      queryFn: () => getTCGCard(card.id, resolvedLang),
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient, resolvedLang]);

  const loadMore = useCallback(() => {
    if (!hasNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_TCG_CARD_FILTERS);
  }, []);

  const sortValue = `${queryFilters.sortBy ?? 'name'}-${queryFilters.sortOrder ?? 'asc'}`;

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <TCGCardItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="w-full flex-shrink-0 lg:w-[360px] xl:w-[400px]">
        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-premium">
          <TCGFilters filters={filters} onChange={handleFiltersChange} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-4 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="flex items-center gap-3.5">
            <div className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/10">
              <div className="absolute inset-0 bg-primary/15 opacity-0 transition-opacity group-hover:opacity-100" />
              <Database className="relative z-10 h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs font-display font-black uppercase tracking-[0.2em] text-foreground/90 leading-none">
                  {t('tcg.catalog_workspace')}
                </h4>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.24em] text-foreground/35">
                  {t('tcg.catalog_version')}
                </span>
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-foreground/35 flex items-center gap-1.5">
                {isFetching ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    {t('tcg.syncing_catalog')}
                  </>
                ) : hasResults ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    {t('tcg.cards_loaded', { count: loadedCount })}
                  </>
                ) : (
                  <>
                    <span className="h-1 w-1 rounded-full bg-cyan-400" />
                    {t('tcg.catalog_ready')}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-2xl border border-white/[0.06] bg-black/35 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-xl p-2 transition-all duration-300',
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-lg shadow-primary/40 ring-1 ring-white/20'
                    : 'text-foreground/30 hover:bg-white/5 hover:text-foreground/60',
                )}
                title={t('tcg.grid_view')}
                aria-label={t('tcg.grid_view')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-xl p-2 transition-all duration-300',
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-lg shadow-primary/40 ring-1 ring-white/20'
                    : 'text-foreground/30 hover:bg-white/5 hover:text-foreground/60',
                )}
                title={t('tcg.list_view')}
                aria-label={t('tcg.list_view')}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <select
                value={sortValue}
                onChange={(event) => {
                  const [sortBy, sortOrder] = event.target.value.split('-') as [TCGCardFilters['sortBy'], TCGCardFilters['sortOrder']];
                  handleFiltersChange({
                    ...filters,
                    sortBy,
                    sortOrder,
                  });
                }}
                className="appearance-none h-10 rounded-2xl border border-white/[0.06] bg-white/[0.04] pl-10 pr-12 text-[10px] font-black uppercase tracking-widest text-foreground/70 transition-all hover:bg-white/[0.08] focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="name-asc">{t('tcg.sort_name_asc')}</option>
                <option value="name-desc">{t('tcg.sort_name_desc')}</option>
                <option value="id-asc">{t('tcg.sort_id_asc')}</option>
                <option value="id-desc">{t('tcg.sort_id_desc')}</option>
                <option value="hp-desc">{t('tcg.sort_hp_desc')}</option>
                <option value="hp-asc">{t('tcg.sort_hp_asc')}</option>
                <option value="rarity-asc">{t('tcg.sort_rarity_asc')}</option>
                <option value="rarity-desc">{t('tcg.sort_rarity_desc')}</option>
              </select>
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                {(queryFilters.sortOrder ?? 'asc') === 'asc' ? <SortAsc className="h-4 w-4 text-primary" /> : <SortDesc className="h-4 w-4 text-primary" />}
              </div>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
            </div>
          </div>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative mb-8 h-32 w-32">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] z-10"
                />
              </div>

              <h3 className="mb-2 text-xl font-display font-black uppercase tracking-[0.3em] text-foreground/80">
                {t('tcg.catalog_loading')}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/30 animate-pulse">
                {t('tcg.catalog_loading_subtitle')}
              </p>

              <div className="mt-12 grid w-full max-w-4xl gap-4 opacity-20 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <TCGCardItemSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : hasResults ? (
            <>
              <div className={cn('grid gap-4 md:gap-6', viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
                <AnimatePresence mode="popLayout">
                  {cards.map((card, index) => (
                    <motion.div
                      layout
                      key={card.id}
                      initial={{ opacity: 0, y: 24, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.35,
                        delay: Math.min(index * 0.03, 0.35),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <TCGCardItem
                        card={card}
                        index={index}
                        onClick={handleCardClick}
                        onHover={handleCardHover}
                        variant={viewMode === 'grid' ? 'default' : 'list'}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {hasNextPage && (
                <div className="mt-12 flex justify-center pb-12">
                  <motion.button
                    type="button"
                    onClick={loadMore}
                    disabled={isFetchingNextPage}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.1] px-10 py-3.5 transition-all duration-300 hover:border-primary/40"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex items-center gap-3">
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                            {t('tcg.loading_more')}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-foreground/40 transition-colors group-hover:text-primary" />
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/60 transition-colors group-hover:text-primary">
                            {t('tcg.load_more_cards')}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative flex flex-col items-center justify-center overflow-hidden rounded-[3rem] border border-dashed border-white/[0.08] bg-white/[0.02] py-28 text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
            >
              <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.015] blur-[100px]" />

              <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-primary/5">
                <AlertCircle className="h-12 w-12 text-primary/35" />
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20" />
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-display font-black uppercase tracking-[0.25em] text-foreground/90">
                  {t('tcg.no_cards')}
                </h3>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-foreground/30">
                  {t('tcg.no_cards_desc')}
                </p>
              </div>

              <div className="relative z-10 mt-12 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-2xl bg-primary px-8 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95"
                >
                  {t('tcg.reset_filters')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    setViewMode('grid');
                  }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-3 text-[11px] font-black uppercase tracking-widest text-foreground/40 transition-all hover:bg-white/[0.06] hover:text-foreground"
                >
                  {t('tcg.browse_all_cards')}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <TCGCardDetailModal card={selectedCard} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function normalizeFilters(filters: TCGCardFilters): TCGCardFilters {
  return {
    ...DEFAULT_TCG_CARD_FILTERS,
    ...filters,
    selectedCategory: filters.selectedCategory ?? 'all',
    selectedSet: filters.selectedSet ?? null,
    selectedRarity: filters.selectedRarity ?? null,
    selectedTypes: filters.selectedTypes ?? [],
    selectedPhase: filters.selectedPhase ?? null,
    selectedTrainerTypes: filters.selectedTrainerTypes ?? [],
    selectedEnergyTypes: filters.selectedEnergyTypes ?? [],
  };
}
