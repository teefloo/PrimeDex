'use client';

import { useInfiniteQuery, useQuery, useQueries } from '@tanstack/react-query';
import { usePokedexStore } from '@/store/pokedex';
import { getPokemonList, getPokemonByType, getAllPokemonDetailed, getPokemonByGeneration } from '@/lib/api';
import { pokemonKeys } from '@/lib/api/keys';
import { PokemonCard, PokemonCardSkeleton } from './PokemonCard';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw, SearchX } from 'lucide-react';
import { PokemonBasicData } from '@/types/pokemon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function PokemonList() {
  const { t } = useTranslation();
  const {
    searchTerm,
    selectedTypes,
    selectedGeneration,
    showFavoritesOnly,
    favorites,
    sortBy,
    isLegendary,
    isMythical,
    selectedEggGroups,
    selectedColors,
    selectedShapes,
    minBaseStats,
    minAttack,
    minDefense,
    minSpeed,
    minHp,
    heightRange,
    weightRange,
    language,
    systemLanguage,
    showCaughtOnly,
    caughtPokemon,
    resetFilters
  } = usePokedexStore();

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

  // 1. Mode normal : Infinite Scroll pour tous les Pokémon
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
  } = useInfiniteQuery({
    queryKey: pokemonKeys.lists(),
    queryFn: getPokemonList,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextParam,
    enabled: isBasicMode,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // 2. Mode Filtre par Type : Support multi-types (intersection)
  useQueries({
    queries: selectedTypes.map(type => ({
      queryKey: pokemonKeys.type(type),
      queryFn: () => getPokemonByType(type),
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    }))
  });

  // 3. Mode Filtre par Génération
  const { data: genPokemon } = useQuery({
    queryKey: ['genPokemon', selectedGeneration],
    queryFn: () => (selectedGeneration ? getPokemonByGeneration(selectedGeneration.toString()) : Promise.resolve([])),
    enabled: !!selectedGeneration,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // 4. Mode Recherche ou Filtres Avancés : On récupère toutes les données de base pour filtrer/trier
  const { data: allDetailed } = useQuery({
    queryKey: pokemonKeys.allDetailed(),
    queryFn: getAllPokemonDetailed,
    enabled: !isBasicMode,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Pre-transform detailed data for faster filtering
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

  // State for progressive loading of filtered results
  const [displayLimit, setDisplayLimit] = useState(40);

  // Reset display limit when filters change - using a ref to track filter changes
  const lastFiltersRef = useRef('');
  const currentFiltersKey = JSON.stringify({
    searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, 
    isLegendary, isMythical, selectedEggGroups, selectedColors, 
    selectedShapes, minBaseStats, minAttack, minDefense, minSpeed, 
    minHp, heightRange, weightRange, isBasicMode, showCaughtOnly
  });

  if (lastFiltersRef.current !== currentFiltersKey) {
    lastFiltersRef.current = currentFiltersKey;
    setDisplayLimit(40);
  }

  // Logique de fusion des résultats
  const filteredAndSortedResults = useMemo(() => {
    let results: {
      name: string;
      url: string;
      height?: number;
      weight?: number;
      base_stat_total?: number;
      stats?: number[];
      is_legendary?: boolean;
      is_mythical?: boolean;
      id: number;
      types?: string[];
      egg_groups?: string[];
      color?: string;
      shape?: string;
      localizedNames?: { language: string; name: string }[];
    }[] = [];

    if (isBasicMode) {
      results = infiniteData?.pages.flatMap((page) => page.results).map(p => ({
        ...p,
        id: parseInt(p.url.split('/').filter(Boolean).pop() || '0')
      })) || [];
    } else {
      if (!transformedDetailed || transformedDetailed.length === 0) return [];
      results = [...transformedDetailed];

      // Base de données source: Type & Gen
      if (selectedTypes.length > 0) {
        results = results.filter(p => selectedTypes.every(t => p.types?.includes(t)));
      }

      if (selectedGeneration) {
        if (!genPokemon) return [];
        const genNames = new Set(genPokemon.map(g => g.name));
        results = results.filter(p => genNames.has(p.name));
      }

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        results = results.filter((p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.id.toString().includes(lowerSearch) ||
          p.localizedNames?.some(n => n.name.toLowerCase().includes(lowerSearch))
        );
      }

      // Application du filtre favoris
      if (showFavoritesOnly) {
        results = results.filter(p => favorites.includes(p.id));
      }

      // Application du filtre "Caught"
      if (showCaughtOnly === 'caught') {
        results = results.filter(p => caughtPokemon.includes(p.id));
      } else if (showCaughtOnly === 'uncaught') {
        results = results.filter(p => !caughtPokemon.includes(p.id));
      }

      // Application des filtres avancés
      if (isLegendary === true) {
        results = results.filter(p => p.is_legendary);
      }

      if (isMythical === true) {
        results = results.filter(p => p.is_mythical);
      }

      if (selectedEggGroups.length > 0) {
        results = results.filter(p => selectedEggGroups.some(eg => p.egg_groups?.includes(eg)));
      }

      if (selectedColors.length > 0) {
        results = results.filter(p => p.color && selectedColors.includes(p.color));
      }

      if (selectedShapes.length > 0) {
        results = results.filter(p => p.shape && selectedShapes.includes(p.shape));
      }

      if (minBaseStats > 0) {
        results = results.filter(p => (p.base_stat_total || 0) >= minBaseStats);
      }

      // Stats individuelles
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

    // Application du tri
    const sortedResults = [...results];

    if (sortBy === 'id-asc') {
      sortedResults.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'id-desc') {
      sortedResults.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'name-asc') {
      sortedResults.sort((a, b) => {
        const nameA = a.localizedNames?.find(n => n.language === resolvedLang)?.name || a.name;
        const nameB = b.localizedNames?.find(n => n.language === resolvedLang)?.name || b.name;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'name-desc') {
      sortedResults.sort((a, b) => {
        const nameA = a.localizedNames?.find(n => n.language === resolvedLang)?.name || a.name;
        const nameB = b.localizedNames?.find(n => n.language === resolvedLang)?.name || b.name;
        return nameB.localeCompare(nameA);
      });
    }

    return sortedResults;
  }, [infiniteData, transformedDetailed, genPokemon, searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, favorites, sortBy, isLegendary, isMythical, selectedEggGroups, selectedColors, selectedShapes, minBaseStats, minAttack, minDefense, minSpeed, minHp, heightRange, weightRange, isBasicMode, resolvedLang, showCaughtOnly, caughtPokemon]);

  const displayedPokemon = useMemo(() => {
    if (isBasicMode) return filteredAndSortedResults;
    return filteredAndSortedResults.slice(0, displayLimit);
  }, [filteredAndSortedResults, displayLimit, isBasicMode]);

  const hasMoreFiltered = !isBasicMode && displayLimit < filteredAndSortedResults.length;

  useEffect(() => {
    if (isInView) {
      if (isBasicMode) {
        if (hasNextPage) fetchNextPage();
      } else if (hasMoreFiltered) {
        // Use a functional update to avoid dependency on displayLimit
        setDisplayLimit(prev => prev + 40);
      }
    }
  }, [isInView, fetchNextPage, hasNextPage, isBasicMode, hasMoreFiltered]);

  const useAnimations = displayedPokemon.length < 100;

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const active = document.activeElement as HTMLElement;
    if (!active || !active.parentElement?.classList.contains('pokemon-grid-item')) return;

    const items = Array.from(document.querySelectorAll('.pokemon-grid-item a'));
    const index = items.indexOf(active);
    if (index === -1) return;

    let columns = 1;
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) columns = 5;
      else if (window.innerWidth >= 1024) columns = 4;
      else if (window.innerWidth >= 768) columns = 3;
      else if (window.innerWidth >= 640) columns = 2;
    }

    let nextIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(index + 1, items.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(index - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(index + columns, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(index - columns, 0);
        break;
      default:
        return;
    }

    if (nextIndex !== index) {
      e.preventDefault();
      (items[nextIndex] as HTMLElement).focus();
    }
  };

  if (isLoadingInfinite && isBasicMode) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 px-2 mt-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <PokemonCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (displayedPokemon.length === 0 && !isLoadingInfinite) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <SearchX className="w-20 h-20 text-foreground/20 relative z-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground/80">{t('list.no_results')}</h3>
          <p className="text-sm text-foreground/40 font-medium max-w-xs mx-auto uppercase tracking-widest">{t('list.no_results_desc')}</p>
        </div>
        <Button
          variant="outline"
          onClick={resetFilters}
          className="rounded-full px-8 py-6 h-auto font-black uppercase tracking-[0.2em] text-xs border-primary/20 hover:bg-primary/10 hover:text-primary transition-all gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t('filters.reset')}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {!isBasicMode && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-secondary/10 rounded-2xl border border-white/5 mx-2 mt-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Results:</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary font-black border-none text-[10px]">
              {filteredAndSortedResults.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </Button>
        </div>
      )}

      <motion.div
        layout={useAnimations}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 px-2"
        onKeyDown={handleGridKeyDown}
      >
        {useAnimations ? (
          <AnimatePresence mode="popLayout">
            {displayedPokemon.map((p, idx) => (
              <motion.div
                layout
                key={`${p.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="pokemon-grid-item"
              >
                <PokemonCard
                  name={p.name}
                  url={p.url}
                  initialData={{
                    pokemon: {
                      id: p.id,
                      name: p.name,
                      height: p.height,
                      weight: p.weight,
                      types: p.types?.map((t, i) => ({ slot: i + 1, type: { name: t, url: '' } })),
                      stats: p.stats?.map((s, i) => ({
                        base_stat: s,
                        effort: 0,
                        stat: { name: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'][i], url: '' }
                      }))
                    },
                    species: {
                      is_legendary: p.is_legendary,
                      is_mythical: p.is_mythical,
                      color: { name: p.color || '' },
                      egg_groups: p.egg_groups?.map(eg => ({ name: eg, url: '' })) || []
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          displayedPokemon.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              className="pokemon-grid-item"
            >
              <PokemonCard
                name={p.name}
                url={p.url}
                initialData={{
                  pokemon: {
                    id: p.id,
                    name: p.name,
                    height: p.height,
                    weight: p.weight,
                    types: p.types?.map((t, i) => ({ slot: i + 1, type: { name: t, url: '' } })),
                    stats: p.stats?.map((s, i) => ({
                      base_stat: s,
                      effort: 0,
                      stat: { name: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'][i], url: '' }
                    }))
                  },
                  species: {
                    is_legendary: p.is_legendary,
                    is_mythical: p.is_mythical,
                    color: { name: p.color || '' },
                    egg_groups: p.egg_groups?.map(eg => ({ name: eg, url: '' })) || []
                  }
                }}
              />
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
