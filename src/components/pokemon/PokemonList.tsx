'use client';

import { useInfiniteQuery, useQuery, useQueries } from '@tanstack/react-query';
import { usePrimeDexStore } from '@/store/primedex';
import { getPokemonList, getPokemonByType, getAllPokemonDetailed, getAllPokemonSummary, getPokemonByGeneration } from '@/lib/api';
import { pokemonKeys } from '@/lib/api/keys';
import { PokemonCard, PokemonCardSkeleton } from './PokemonCard';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw, SearchX } from 'lucide-react';
import { PokemonBasicData } from '@/types/pokemon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

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
  const resetFilters = usePrimeDexStore(s => s.resetFilters);

  const resolvedLang = language === 'auto' ? systemLanguage : language;

  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef, { margin: '200px' });

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
    heightRange[1] === 20 &&
    weightRange[0] === 0 &&
    weightRange[1] === 1000 &&
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
    heightRange[1] < 20 || 
    weightRange[0] > 0 || 
    weightRange[1] < 1000 ||
    sortBy.includes('height') ||
    sortBy.includes('weight');

  // 1. Summary Data : Loaded on demand (Search or Filters)
  const { data: allSummary } = useQuery({
    queryKey: pokemonKeys.allSummary(resolvedLang),
    queryFn: () => getAllPokemonSummary(),
    enabled: !isBasicMode || !!searchTerm, // Load only if filtering or searching
    staleTime: 24 * 60 * 60 * 1000,
  });

  // 2. Detailed Data : Loaded ONLY if advanced filters are used
  const { data: allDetailed } = useQuery({
    queryKey: pokemonKeys.allDetailed(resolvedLang),
    queryFn: () => getAllPokemonDetailed(),
    enabled: isAdvancedFilterActive,
    staleTime: 24 * 60 * 60 * 1000,
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
  });

  // 4. Mode Filtre par Génération
  const { data: genPokemon } = useQuery({
    queryKey: ['genPokemon', selectedGeneration, resolvedLang],
    queryFn: () => (selectedGeneration ? getPokemonByGeneration(selectedGeneration.toString()) : Promise.resolve([])),
    enabled: !!selectedGeneration,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const transformedSummary = useMemo(() => {
    if (!allSummary) return [];
    return allSummary.map((p: any) => ({
      name: p.name,
      url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
      id: p.id,
      types: p.pokemon_v2_pokemontypes?.map((t: any) => t.pokemon_v2_type.name) || [],
      localizedNames: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.map((n: any) => ({
        language: n.pokemon_v2_language.name,
        name: n.name
      })) || [],
      generation_id: p.pokemon_v2_pokemonspecy?.generation_id
    }));
  }, [allSummary]);

  const transformedDetailed = useMemo(() => {
    if (!allDetailed) return [];
    return allDetailed.map((p: PokemonBasicData) => ({
      name: p.name,
      url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
      id: p.id,
      height: p.height,
      weight: p.weight,
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

  const [displayLimit, setDisplayLimit] = useState(40);
  const [prevFiltersKey, setPrevFiltersKey] = useState('');
  const currentFiltersKey = JSON.stringify({
    searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, 
    isLegendary, isMythical, selectedEggGroups, selectedColors, 
    selectedShapes, minBaseStats, minAttack, minDefense, minSpeed, 
    minHp, heightRange, weightRange, isBasicMode, showCaughtOnly
  });

  if (prevFiltersKey !== currentFiltersKey) {
    setPrevFiltersKey(currentFiltersKey);
    setDisplayLimit(40);
  }

  const filteredAndSortedResults = useMemo(() => {
    let results: any[] = [];

    if (isBasicMode) {
      results = infiniteData?.pages.flatMap((page) => page.results).map(p => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
        const summary = transformedSummary?.find(d => d.id === id);
        if (summary) return summary;
        return { ...p, id };
      }) || [];
    } else {
      // Use detailed data if advanced filters are active, otherwise use summary
      const sourceData = isAdvancedFilterActive ? transformedDetailed : transformedSummary;
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

      if (isAdvancedFilterActive && transformedDetailed.length > 0) {
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
        if (heightRange[0] > 0 || heightRange[1] < 20) {
          results = results.filter(p => {
            const h = (p.height || 0) / 10;
            return h >= heightRange[0] && h <= heightRange[1];
          });
        }
        if (weightRange[0] > 0 || weightRange[1] < 1000) {
          results = results.filter(p => {
            const w = (p.weight || 0) / 10;
            return w >= weightRange[0] && w <= weightRange[1];
          });
        }
      }
    }

    const sortedResults = [...results];
    if (sortBy === 'id-asc') sortedResults.sort((a, b) => a.id - b.id);
    else if (sortBy === 'id-desc') sortedResults.sort((a, b) => b.id - a.id);
    else if (sortBy === 'name-asc') {
      sortedResults.sort((a, b) => {
        const nameA = a.localizedNames?.find((n: any) => n.language === resolvedLang)?.name || a.name;
        const nameB = b.localizedNames?.find((n: any) => n.language === resolvedLang)?.name || b.name;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'name-desc') {
      sortedResults.sort((a, b) => {
        const nameA = a.localizedNames?.find((n: any) => n.language === resolvedLang)?.name || a.name;
        const nameB = b.localizedNames?.find((n: any) => n.language === resolvedLang)?.name || b.name;
        return nameB.localeCompare(nameA);
      });
    } else if (isAdvancedFilterActive) {
      if (sortBy === 'height-asc') sortedResults.sort((a, b) => a.height - b.height);
      else if (sortBy === 'height-desc') sortedResults.sort((a, b) => b.height - a.height);
      else if (sortBy === 'weight-asc') sortedResults.sort((a, b) => a.weight - b.weight);
      else if (sortBy === 'weight-desc') sortedResults.sort((a, b) => b.weight - a.weight);
    }

    return sortedResults;
  }, [infiniteData, transformedSummary, transformedDetailed, searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, favorites, sortBy, isLegendary, isMythical, selectedEggGroups, selectedColors, selectedShapes, minBaseStats, minAttack, minDefense, minSpeed, minHp, heightRange, weightRange, isBasicMode, resolvedLang, showCaughtOnly, caughtPokemon, isAdvancedFilterActive]);

  const displayedPokemon = useMemo(() => {
    if (isBasicMode) return filteredAndSortedResults;
    return filteredAndSortedResults.slice(0, displayLimit);
  }, [filteredAndSortedResults, displayLimit, isBasicMode]);

  const hasMoreFiltered = !isBasicMode && displayLimit < filteredAndSortedResults.length;

  useEffect(() => {
    if (isInView) {
      if (isBasicMode && hasNextPage) fetchNextPage();
      else if (hasMoreFiltered) setDisplayLimit(prev => prev + 40);
    }
  }, [isInView, fetchNextPage, hasNextPage, isBasicMode, hasMoreFiltered]);

  const useAnimations = displayedPokemon.length < 60;

  if (isLoadingInfinite && isBasicMode) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 px-2 mt-8">
        {Array.from({ length: 10 }).map((_, i) => <PokemonCardSkeleton key={i} />)}
      </div>
    );
  }

  if (displayedPokemon.length === 0 && !isLoadingInfinite) {
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
      name: p.localizedNames?.find((n: any) => n.language === resolvedLang)?.name || p.name,
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
                <PokemonCard name={p.name} url={p.url} index={idx} initialData={{ pokemon: p, species: p.pokemon_v2_pokemonspecy }} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          displayedPokemon.map((p, idx) => (
            <div key={`${p.id}-${idx}`} className="pokemon-grid-item">
              <PokemonCard name={p.name} url={p.url} index={idx} initialData={{ pokemon: p, species: p.pokemon_v2_pokemonspecy }} />
            </div>
          ))
        )}
      </motion.div>

      {(isBasicMode || hasMoreFiltered) && (
        <div ref={loadMoreRef} className="flex justify-center p-8">
          {(isFetchingNextPage || hasMoreFiltered) && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">{t('list.loading_more')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

