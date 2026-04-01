'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { usePrimeDexStore } from '@/store/primedex';
import { getPokemonList, getAllPokemonDetailed, getAllPokemonSummary, getPokemonByGeneration } from '@/lib/api';
import { pokemonKeys } from '@/lib/api/keys';
import { PokemonCard, PokemonCardSkeleton } from './PokemonCard';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw, SearchX } from 'lucide-react';
import { PokemonBasicData, GraphQLPokemonSummary, LocalizedNameEntry, PokemonSpecies } from '@/types/pokemon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface PokemonResultItem {
  id: number;
  name: string;
  url: string;
  types?: string[];
  localizedNames?: LocalizedNameEntry[];
  generation_id?: number;
  height?: number;
  weight?: number;
  stats?: number[];
  base_stat_total?: number;
  is_legendary?: boolean;
  is_mythical?: boolean;
  egg_groups?: string[];
  color?: string;
  shape?: string;
  species?: Partial<PokemonSpecies>;
}

export default function PokemonList() {
  const { t } = useTranslation();
  
  // Atomic selectors
  const searchTerm = usePrimeDexStore(s => s.searchTerm);
  const selectedTypes = usePrimeDexStore(s => s.selectedTypes);
  const selectedGeneration = usePrimeDexStore(s => s.selectedGeneration);
  const showFavoritesOnly = usePrimeDexStore(s => s.showFavoritesOnly);
  const favorites = usePrimeDexStore(s => s.favorites);
  const sortBy = usePrimeDexStore(s => s.sortBy);
  const isLegendary = usePrimeDexStore(s => s.isLegendary);
  const isMythical = usePrimeDexStore(s => s.isMythical);
  const selectedEggGroups = usePrimeDexStore(s => s.selectedEggGroups);
  const selectedColors = usePrimeDexStore(s => s.selectedColors);
  const selectedShapes = usePrimeDexStore(s => s.selectedShapes);
  const minBaseStats = usePrimeDexStore(s => s.minBaseStats);
  const minAttack = usePrimeDexStore(s => s.minAttack);
  const minDefense = usePrimeDexStore(s => s.minDefense);
  const minSpeed = usePrimeDexStore(s => s.minSpeed);
  const minHp = usePrimeDexStore(s => s.minHp);
  const heightRange = usePrimeDexStore(s => s.heightRange);
  const weightRange = usePrimeDexStore(s => s.weightRange);
  const language = usePrimeDexStore(s => s.language);
  const systemLanguage = usePrimeDexStore(s => s.systemLanguage);
  const showCaughtOnly = usePrimeDexStore(s => s.showCaughtOnly);
  const caughtPokemon = usePrimeDexStore(s => s.caughtPokemon);
  const storeResetFilters = usePrimeDexStore(s => s.resetFilters);
  const resetFilters = () => {
    storeResetFilters();
    setDisplayLimit(40);
  };

  const resolvedLang = language === 'auto' ? systemLanguage : language;

  const isBasicMode = selectedTypes.length === 0 &&
    !searchTerm &&
    !selectedGeneration &&
    !showFavoritesOnly &&
    showCaughtOnly === 'all' &&
    isLegendary === null &&
    isMythical === null &&
    selectedEggGroups.length === 0 &&
    selectedColors.length === 0 &&
    selectedShapes.length === 0 &&
    minBaseStats === 0 &&
    minAttack === 0 &&
    minDefense === 0 &&
    minSpeed === 0 &&
    minHp === 0 &&
    heightRange[0] === 0 &&
    heightRange[1] === 25 &&
    weightRange[0] === 0 &&
    weightRange[1] === 1200 &&
    sortBy === 'id-asc';

  // Advanced mode check
  const isAdvancedFilterActive = isLegendary !== null || 
    isMythical !== null || 
    selectedEggGroups.length > 0 || 
    selectedColors.length > 0 || 
    selectedShapes.length > 0 || 
    minBaseStats > 0 || 
    minAttack > 0 || 
    minDefense > 0 || 
    minSpeed > 0 || 
    minHp > 0 || 
    heightRange[0] > 0 || 
    heightRange[1] < 25 || 
    weightRange[0] > 0 || 
    weightRange[1] < 1200 ||
    sortBy.includes('height') ||
    sortBy.includes('weight');

  // 1. Summary Data : Loaded on demand (Search or Filters)
  const { data: allSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: pokemonKeys.allSummary(resolvedLang),
    queryFn: () => getAllPokemonSummary(),
    enabled: !isBasicMode || !!searchTerm, // Load only if filtering or searching
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000, // Keep 48h in garbage collection
  });

  // 2. Detailed Data : Loaded ONLY if advanced filters are used
  const { data: allDetailed, isLoading: isLoadingDetailed } = useQuery({
    queryKey: pokemonKeys.allDetailed(resolvedLang),
    queryFn: () => getAllPokemonDetailed(),
    enabled: isAdvancedFilterActive,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
  });

  // 3. Normal Mode : Infinite Scroll
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
  } = useInfiniteQuery({
    queryKey: pokemonKeys.lists(resolvedLang),
    queryFn: getPokemonList,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextParam,
    enabled: isBasicMode,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000, // Keep pages 2h in GC
  });

  // 4. Mode Filtre par Génération
  useQuery({
    queryKey: ['genPokemon', selectedGeneration, resolvedLang],
    queryFn: () => (selectedGeneration ? getPokemonByGeneration(selectedGeneration.toString()) : Promise.resolve([])),
    enabled: !!selectedGeneration,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const transformedSummary = useMemo(() => {
    if (!allSummary) return [];
    return allSummary.map((p: GraphQLPokemonSummary) => ({
      name: p.name,
      url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
      id: p.id,
      height: p.height ?? 0,
      weight: p.weight ?? 0,
      types: p.pokemon_v2_pokemontypes?.map((t) => t.pokemon_v2_type.name) || [],
      localizedNames: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.map((n) => ({
        language: n.pokemon_v2_language.name,
        name: n.name
      })) || [],
      generation_id: p.pokemon_v2_pokemonspecy?.generation_id
    }));
  }, [allSummary]);

  const buildInitialData = (p: PokemonResultItem) => {
    const localizedNames = p.localizedNames || [];
    return {
      pokemon: {
        id: p.id,
        name: p.name,
        types: p.types?.map((t) => ({ type: { name: t, url: '' }, slot: 1 })) || [],
        localizedNames,
      },
      species: {
        names: localizedNames.map((n: LocalizedNameEntry) => ({
          name: n.name,
          language: { name: n.language },
        })),
      } as Partial<PokemonSpecies>,
    };
  };

  const transformedDetailed = useMemo(() => {
    if (!allDetailed) return [];
    return allDetailed.map((p: PokemonBasicData) => ({
      name: p.name,
      url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
      id: p.id,
      height: p.height ?? 0,
      weight: p.weight ?? 0,
      stats: p.pokemon_v2_pokemonstats?.map(s => s.base_stat) || [],
      base_stat_total: p.pokemon_v2_pokemonstats?.reduce((acc, curr) => acc + curr.base_stat, 0) || 0,
      is_legendary: p.pokemon_v2_pokemonspecy?.is_legendary || false,
      is_mythical: p.pokemon_v2_pokemonspecy?.is_mythical || false,
      types: p.pokemon_v2_pokemontypes?.map(t => t.pokemon_v2_type.name) || [],
      egg_groups: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonespeciesegggroups?.map(eg => eg.pokemon_v2_egggroup.name) || [],
      color: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemoncolor?.name,
      shape: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonshape?.name,
      localizedNames: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.map(n => ({
        language: n.pokemon_v2_language.name,
        name: n.name
      })) || []
    }));
  }, [allDetailed]);

  const [displayLimit, setDisplayLimit] = useState(20);
  const currentFiltersKey = useMemo(() => JSON.stringify({
    searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, 
    isLegendary, isMythical, selectedEggGroups, selectedColors, 
    selectedShapes, minBaseStats, minAttack, minDefense, minSpeed, 
    minHp, heightRange, weightRange, isBasicMode, showCaughtOnly
  }), [searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, isLegendary, isMythical, selectedEggGroups, selectedColors, selectedShapes, minBaseStats, minAttack, minDefense, minSpeed, minHp, heightRange, weightRange, isBasicMode, showCaughtOnly]);

  useEffect(() => {
    setDisplayLimit(20);
  }, [currentFiltersKey]);

  const filteredAndSortedResults = useMemo(() => {
    let results: PokemonResultItem[] = [];

    if (isBasicMode) {
      const summaryMap = new Map(transformedSummary.map(d => [d.id, d]));
      results = infiniteData?.pages.flatMap((page) => page.results).map(p => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
        return summaryMap.get(id) || { ...p, id };
      }) || [];
    } else {
      // Only use detailed data when stat-based advanced filters require it
      const needsDetailedData = isLegendary !== null || isMythical !== null ||
        selectedEggGroups.length > 0 || selectedColors.length > 0 ||
        selectedShapes.length > 0 || minBaseStats > 0 || minAttack > 0 ||
        minDefense > 0 || minSpeed > 0 || minHp > 0;
      const sourceData = needsDetailedData ? transformedDetailed : transformedSummary;
      if (!sourceData || sourceData.length === 0) return [];
      results = [...sourceData];

      if (selectedTypes.length > 0) {
        results = results.filter(p => selectedTypes.every(t => p.types?.includes(t)));
      }

      if (selectedGeneration) {
        results = results.filter(p => p.generation_id === selectedGeneration);
      }

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        results = results.filter((p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.id.toString().includes(lowerSearch) ||
          p.localizedNames?.some((n: { name: string }) => n.name.toLowerCase().includes(lowerSearch))
        );
      }

      if (showFavoritesOnly) results = results.filter(p => favorites.includes(p.id));
      
      if (showCaughtOnly === 'caught') {
        results = results.filter(p => caughtPokemon.includes(p.id));
      } else if (showCaughtOnly === 'uncaught') {
        results = results.filter(p => !caughtPokemon.includes(p.id));
      }

      if (needsDetailedData && transformedDetailed.length > 0) {
        if (isLegendary === true) results = results.filter(p => p.is_legendary);
        if (isMythical === true) results = results.filter(p => p.is_mythical);
        if (selectedEggGroups.length > 0) results = results.filter(p => selectedEggGroups.some(eg => p.egg_groups?.includes(eg)));
        if (selectedColors.length > 0) results = results.filter(p => p.color && selectedColors.includes(p.color));
        if (selectedShapes.length > 0) results = results.filter(p => p.shape && selectedShapes.includes(p.shape));
        if (minBaseStats > 0) results = results.filter(p => (p.base_stat_total || 0) >= minBaseStats);
        if (minHp > 0) results = results.filter(p => p.stats && p.stats[0] >= minHp);
        if (minAttack > 0) results = results.filter(p => p.stats && p.stats[1] >= minAttack);
        if (minDefense > 0) results = results.filter(p => p.stats && p.stats[2] >= minDefense);
        if (minSpeed > 0) results = results.filter(p => p.stats && p.stats[5] >= minSpeed);
      }

      if (heightRange[0] > 0 || heightRange[1] < 25) {
        const minH = heightRange[0];
        const maxH = heightRange[1];
        results = results.filter(p => {
          const rawHeight = Number(p.height);
          if (Number.isNaN(rawHeight)) return false;
          const h = rawHeight / 10;
          const meetsMin = h >= minH;
          const meetsMax = maxH >= 25 || h <= maxH;
          return meetsMin && meetsMax;
        });
      }
      if (weightRange[0] > 0 || weightRange[1] < 1200) {
        const minW = weightRange[0];
        const maxW = weightRange[1];
        results = results.filter(p => {
          const rawWeight = Number(p.weight);
          if (Number.isNaN(rawWeight)) return false;
          const w = rawWeight / 10;
          const meetsMin = w >= minW;
          const meetsMax = maxW >= 1200 || w <= maxW;
          return meetsMin && meetsMax;
        });
      }
    }

    const sortedResults = [...results];

    if (sortBy === 'id-asc') sortedResults.sort((a, b) => a.id - b.id);
    else if (sortBy === 'id-desc') sortedResults.sort((a, b) => b.id - a.id);
    else if (sortBy === 'name-asc') {
      sortedResults.sort((a, b) => {
        const nameA = a.localizedNames?.find((n: LocalizedNameEntry) => n.language === resolvedLang)?.name || a.name;
        const nameB = b.localizedNames?.find((n: LocalizedNameEntry) => n.language === resolvedLang)?.name || b.name;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'name-desc') {
      sortedResults.sort((a, b) => {
        const nameA = a.localizedNames?.find((n: LocalizedNameEntry) => n.language === resolvedLang)?.name || a.name;
        const nameB = b.localizedNames?.find((n: LocalizedNameEntry) => n.language === resolvedLang)?.name || b.name;
        return nameB.localeCompare(nameA);
      });
    } else if (sortBy === 'height-asc') {
      sortedResults.sort((a, b) => (Number(a.height) || 0) - (Number(b.height) || 0));
    } else if (sortBy === 'height-desc') {
      sortedResults.sort((a, b) => (Number(b.height) || 0) - (Number(a.height) || 0));
    } else if (sortBy === 'weight-asc') {
      sortedResults.sort((a, b) => (Number(a.weight) || 0) - (Number(b.weight) || 0));
    } else if (sortBy === 'weight-desc') {
      sortedResults.sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0));
    }

    return sortedResults;
  }, [infiniteData, transformedSummary, transformedDetailed, searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, favorites, sortBy, isLegendary, isMythical, selectedEggGroups, selectedColors, selectedShapes, minBaseStats, minAttack, minDefense, minSpeed, minHp, heightRange, weightRange, isBasicMode, resolvedLang, showCaughtOnly, caughtPokemon]);

  const displayedPokemon = useMemo(() => {
    if (isBasicMode) return filteredAndSortedResults;
    return filteredAndSortedResults.slice(0, displayLimit);
  }, [filteredAndSortedResults, displayLimit, isBasicMode]);

  const hasMoreFiltered = !isBasicMode && displayLimit < filteredAndSortedResults.length;

  const handleLoadMore = () => {
    if (isBasicMode && hasNextPage) {
      fetchNextPage();
    }
    setDisplayLimit(prev => prev + 20);
  };

  const useAnimations = displayedPokemon.length < 60;

  const isDataLoading = (isBasicMode && isLoadingInfinite) || 
                        (!isBasicMode && isAdvancedFilterActive && isLoadingDetailed) || 
                        (!isBasicMode && !isAdvancedFilterActive && isLoadingSummary);

  if (isDataLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 px-2 mt-8">
        {Array.from({ length: 10 }).map((_, i) => <PokemonCardSkeleton key={i} />)}
      </div>
    );
  }

  if (displayedPokemon.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
        <SearchX className="w-20 h-20 text-foreground/20" />
        <h3 className="text-2xl font-black uppercase tracking-tight text-foreground/80">{t('list.no_results')}</h3>
        <Button variant="outline" onClick={resetFilters} className="rounded-full px-8 py-6 h-auto font-black uppercase tracking-[0.2em] text-xs border-primary/20 hover:bg-primary/10 gap-2">
          <RotateCcw className="w-4 h-4" /> {t('filters.reset')}
        </Button>
      </motion.div>
    );
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: filteredAndSortedResults.length,
    itemListElement: displayedPokemon.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.localizedNames?.find((n: LocalizedNameEntry) => n.language === resolvedLang)?.name || p.name,
      url: `https://primedex.vercel.app/pokemon/${p.name}`,
    })),
  };

  return (
    <div className="space-y-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {!isBasicMode && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-secondary/10 rounded-2xl border border-white/5 mx-2 mt-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{t('list.results')}</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary font-black border-none text-[10px]">
              {filteredAndSortedResults.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-[9px] font-black uppercase tracking-widest gap-1.5">
            <RotateCcw className="w-3 h-3" /> {t('filters.clear_all')}
          </Button>
        </div>
      )}

      <motion.div layout={useAnimations} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 px-2">
        {useAnimations ? (
          <AnimatePresence mode="popLayout">
            {displayedPokemon.map((p, idx) => (
              <motion.div layout key={`${p.id}-${idx}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="pokemon-grid-item">
                <PokemonCard name={p.name} url={p.url} index={idx} initialData={buildInitialData(p)} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          displayedPokemon.map((p, idx) => (
            <div key={`${p.id}-${idx}`} className="pokemon-grid-item">
              <PokemonCard name={p.name} url={p.url} index={idx} initialData={buildInitialData(p)} />
            </div>
          ))
        )}
      </motion.div>

      {(isBasicMode || hasMoreFiltered) && (
        <div className="flex justify-center p-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage || (!hasNextPage && !hasMoreFiltered)}
            className="rounded-full px-8 py-6 h-auto font-black uppercase tracking-[0.2em] text-xs border-primary/20 hover:bg-primary/10 gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t('list.loading_more')}
              </>
            ) : (
              t('list.load_more')
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

