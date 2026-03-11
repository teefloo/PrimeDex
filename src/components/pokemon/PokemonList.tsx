'use client';

import { useInfiniteQuery, useQuery, useQueries } from '@tanstack/react-query';
import { usePokedexStore } from '@/store/pokedex';
import { getPokemonList, getPokemonByType, getAllPokemonDetailed, getPokemonByGeneration } from '@/lib/api';
import { PokemonBasicData, PokemonDetail, PokemonSpecies } from '@/types/pokemon';
import { PokemonCard, PokemonCardSkeleton } from './PokemonCard';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useMemo } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

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
    minBaseStats,
    heightRange,
    weightRange,
    language,
    systemLanguage,
    showCaughtOnly,
    caughtPokemon
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
    minBaseStats === 0 && 
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
    queryKey: ['pokemon-list'],
    queryFn: getPokemonList,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextParam,
    enabled: isBasicMode,
    staleTime: 10 * 60 * 1000,
  });

  // 2. Mode Filtre par Type : Support multi-types (intersection)
  const typeQueries = useQueries({
    queries: selectedTypes.map(type => ({
      queryKey: ['typePokemon', type],
      queryFn: () => getPokemonByType(type),
      staleTime: 10 * 60 * 1000,
    }))
  });

  // 3. Mode Filtre par Génération
  const { data: genPokemon, isLoading: isLoadingGen } = useQuery({
    queryKey: ['genPokemon', selectedGeneration],
    queryFn: () => (selectedGeneration ? getPokemonByGeneration(selectedGeneration.toString()) : Promise.resolve([])),
    enabled: !!selectedGeneration,
    staleTime: 10 * 60 * 1000,
  });

  // 4. Mode Recherche ou Filtres Avancés : On récupère toutes les données de base pour filtrer/trier
  const { data: allDetailed, isLoading: isLoadingAll } = useQuery({
    queryKey: ['allPokemonDetailed'],
    queryFn: getAllPokemonDetailed,
    enabled: !isBasicMode,
    staleTime: 30 * 60 * 1000,
  });

  // Logique de fusion des résultats
  const displayedPokemon = useMemo(() => {
    let results: { 
      name: string; 
      url: string; 
      height?: number; 
      weight?: number; 
      base_stat_total?: number; 
      is_legendary?: boolean; 
      is_mythical?: boolean; 
      id: number; 
      types?: string[];
      localizedNames?: { language: string; name: string }[];
    }[] = [];

    if (isBasicMode) {
      results = infiniteData?.pages.flatMap((page) => page.results).map(p => ({
        ...p,
        id: parseInt(p.url.split('/').filter(Boolean).pop() || '0')
      })) || [];
    } else {
      if (!allDetailed) return [];

      results = allDetailed.map((p: PokemonBasicData) => ({
        name: p.name,
        url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
        id: p.id,
        height: p.height,
        weight: p.weight,
        base_stat_total: p.pokemon_v2_pokemonstats.reduce((acc, curr) => acc + curr.base_stat, 0),
        is_legendary: p.pokemon_v2_pokemonspecy?.is_legendary || false,
        is_mythical: p.pokemon_v2_pokemonspecy?.is_mythical || false,
        types: p.pokemon_v2_pokemontypes.map(t => t.pokemon_v2_type.name),
        localizedNames: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames.map(n => ({
          language: n.pokemon_v2_language.name,
          name: n.name
        }))
      }));

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

      // Application des filtres avancés (si mode non basique)
      if (isLegendary === true) {
        results = results.filter(p => p.is_legendary || p.is_mythical);
      }

      if (minBaseStats > 0) {
        results = results.filter(p => (p.base_stat_total || 0) >= minBaseStats);
      }

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
    } else if (sortBy === 'height-asc' && !isBasicMode) {
      sortedResults.sort((a, b) => (a.height || 0) - (b.height || 0));
    } else if (sortBy === 'height-desc' && !isBasicMode) {
      sortedResults.sort((a, b) => (b.height || 0) - (a.height || 0));
    } else if (sortBy === 'weight-asc' && !isBasicMode) {
      sortedResults.sort((a, b) => (a.weight || 0) - (b.weight || 0));
    } else if (sortBy === 'weight-desc' && !isBasicMode) {
      sortedResults.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    }

    // On limite à 50 par défaut si on cherche par nom
    if (searchTerm) {
      return sortedResults.slice(0, 100);
    }
    
    // Si on a appliqué un filtre (type, gen, search, favoris, advanced), on affiche tout ce qui matche
    if (!isBasicMode) {
      return sortedResults.slice(0, 500); // Increased limit for filtered/sorted views to show more results across the base
    }

    return sortedResults;
  }, [infiniteData, allDetailed, genPokemon, searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, favorites, sortBy, isLegendary, minBaseStats, heightRange, weightRange, isBasicMode, resolvedLang, showCaughtOnly, caughtPokemon]);

  // Déclenchement automatique du chargement suivant
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage && isBasicMode) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage, isBasicMode]);

  const isLoading = isLoadingInfinite || 
    (selectedTypes.length > 0 && typeQueries.some(q => q.isLoading)) || 
    (selectedGeneration && isLoadingGen) ||
    (!isBasicMode && isLoadingAll);

  if (isLoading && displayedPokemon.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 20 }).map((_, i) => (
          <PokemonCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && displayedPokemon.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 text-foreground/50 glass-panel rounded-[3rem] max-w-2xl mx-auto border-dashed border-2 border-white/10"
      >
        <div className="p-6 bg-secondary/30 rounded-full mb-6">
          <SearchX className="w-16 h-16 text-foreground/30" />
        </div>
        <h3 className="text-2xl font-black mb-2 text-foreground/80 tracking-tight">{t('list.no_results')}</h3>
        <p className="text-base text-foreground/50 font-medium">{t('list.no_results_desc')}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between px-4">
        <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
          {searchTerm ? (
            <>{t('list.search_results')} <span className="text-primary">&quot;{searchTerm}&quot;</span></>
          ) : (selectedTypes.length > 0 || selectedGeneration || showFavoritesOnly || isLegendary !== null || minBaseStats > 0 || showCaughtOnly !== 'all') ? (
            <div className="flex gap-2 items-center flex-wrap">
              {showFavoritesOnly && (
                <span className="text-red-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {t('nav.favorites')}
                </span>
              )}
              {showFavoritesOnly && (selectedTypes.length > 0 || selectedGeneration) && <span className="opacity-30 mx-1">|</span>}
              
              {showCaughtOnly !== 'all' && (
                <span className="text-primary flex items-center gap-1">
                  {showCaughtOnly === 'caught' ? 'Caught' : 'Missing'}
                </span>
              )}
              {showCaughtOnly !== 'all' && (selectedTypes.length > 0 || selectedGeneration) && <span className="opacity-30 mx-1">|</span>}

              {selectedGeneration && (
                <>Gen: <span className="text-primary">{selectedGeneration}</span></>
              )}
              {selectedGeneration && selectedTypes.length > 0 && <span className="opacity-30 mx-1">|</span>}
              {selectedTypes.length > 0 && (
                <>Types: <span className="text-primary capitalize">{selectedTypes.join(', ')}</span></>
              )}
              {isLegendary && (
                <><span className="opacity-30 mx-1">|</span> <span className="text-yellow-500">{t('list.legendary')}</span></>
              )}
              {minBaseStats > 0 && (
                <><span className="opacity-30 mx-1">|</span> <span className="text-blue-500">BST {minBaseStats}+</span></>
              )}
              <span className="ml-2 opacity-50">({displayedPokemon.length})</span>
            </div>
          ) : (
            <>{t('list.showing')} <span className="text-primary">{displayedPokemon.length}</span> {t('list.pokemon')}</>
          )}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {displayedPokemon.map((p) => (
          <PokemonCard 
            key={p.name} 
            name={p.name} 
            url={p.url}
            initialData={{
              pokemon: {
                id: p.id,
                name: p.name,
                types: p.types?.map((t, i) => ({ slot: i + 1, type: { name: t, url: '' } })),
                localizedNames: p.localizedNames
              } as Partial<PokemonDetail>,
              species: {
                names: p.localizedNames?.map(ln => ({ name: ln.name, language: { name: ln.language } }))
              } as Partial<PokemonSpecies>
            }}
          />
        ))}
      </div>

      {/* Point d'ancrage pour l'Infinite Scroll */}
      {selectedTypes.length === 0 && !searchTerm && !selectedGeneration && !showFavoritesOnly && showCaughtOnly === 'all' && isLegendary === null && minBaseStats === 0 && hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">{t('list.loading_more')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
