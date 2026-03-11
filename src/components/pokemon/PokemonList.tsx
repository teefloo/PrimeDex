'use client';

import { useInfiniteQuery, useQuery, useQueries } from '@tanstack/react-query';
import { usePokedexStore } from '@/store/pokedex';
import { getPokemonList, getPokemonByType, getAllPokemonNames, getPokemonByGeneration } from '@/lib/api';
import { PokemonCard } from './PokemonCard';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useMemo } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PokemonList() {
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
    weightRange
  } = usePokedexStore();
  
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef, { margin: '200px' });

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
    enabled: selectedTypes.length === 0 && !searchTerm && !selectedGeneration && !showFavoritesOnly && isLegendary === null && minBaseStats === 0,
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

  const typePokemon = useMemo(() => {
    if (selectedTypes.length === 0) return null;
    if (typeQueries.some(q => q.isLoading)) return [];
    
    // Intersection des listes de Pokémon pour chaque type
    const lists = typeQueries.map(q => q.data || []);
    if (lists.length === 0) return [];
    
    return lists.reduce((acc, curr) => {
      const currNames = new Set(curr.map(p => p.name));
      return acc.filter(p => currNames.has(p.name));
    });
  }, [typeQueries, selectedTypes]);

  // 3. Mode Filtre par Génération
  const { data: genPokemon, isLoading: isLoadingGen } = useQuery({
    queryKey: ['genPokemon', selectedGeneration],
    queryFn: () => (selectedGeneration ? getPokemonByGeneration(selectedGeneration.toString()) : Promise.resolve([])),
    enabled: !!selectedGeneration,
    staleTime: 10 * 60 * 1000,
  });

  // 4. Mode Recherche ou Favoris : On récupère les noms pour filtrer localement
  const { data: allNames } = useQuery({
    queryKey: ['allPokemonNames'],
    queryFn: getAllPokemonNames,
    enabled: !!searchTerm || showFavoritesOnly || isLegendary !== null || minBaseStats > 0 || heightRange[0] > 0 || heightRange[1] < 20 || weightRange[0] > 0 || weightRange[1] < 1000,
    staleTime: 30 * 60 * 1000,
  });

  // Logique de fusion des résultats
  const displayedPokemon = useMemo(() => {
    let results: { name: string; url: string }[] = [];

    // Base de données source
    if (searchTerm) {
      results = allNames || [];
      results = results.filter((p) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (selectedTypes.length > 0 && selectedGeneration) {
      if (!typePokemon || !genPokemon) return [];
      const genNames = new Set(genPokemon.map(p => p.name));
      results = typePokemon.filter(p => genNames.has(p.name));
    } else if (selectedTypes.length > 0) {
      results = typePokemon || [];
    } else if (selectedGeneration) {
      results = genPokemon || [];
    } else if (showFavoritesOnly || isLegendary !== null || minBaseStats > 0) {
      results = allNames || [];
    } else {
      results = infiniteData?.pages.flatMap((page) => page.results) || [];
    }

    // Application du filtre favoris
    if (showFavoritesOnly) {
      results = results.filter(p => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
        return favorites.includes(id);
      });
    }

    // Limiter les résultats si on a trop de données et qu'on doit charger les détails
    // Pour les filtres avancés (stats, weight, etc.), on ne peut filtrer que ce qui est affiché 
    // OU on doit tout charger. Pour cette implémentation, on va limiter à 100 Pokémon max 
    // pour éviter d'exploser l'API si on utilise les filtres avancés sans type/gen.
    const isAdvancedFilterActive = isLegendary !== null || minBaseStats > 0 || heightRange[0] > 0 || heightRange[1] < 20 || weightRange[0] > 0 || weightRange[1] < 1000;
    
    if (isAdvancedFilterActive && !searchTerm && selectedTypes.length === 0 && !selectedGeneration && !showFavoritesOnly) {
      results = results.slice(0, 100);
    }

    // Application du tri
    const sortedResults = [...results];
    
    if (sortBy === 'id-asc') {
      sortedResults.sort((a, b) => {
        const idA = parseInt(a.url.split('/').filter(Boolean).pop() || '0');
        const idB = parseInt(b.url.split('/').filter(Boolean).pop() || '0');
        return idA - idB;
      });
    } else if (sortBy === 'id-desc') {
      sortedResults.sort((a, b) => {
        const idA = parseInt(a.url.split('/').filter(Boolean).pop() || '0');
        const idB = parseInt(b.url.split('/').filter(Boolean).pop() || '0');
        return idB - idA;
      });
    } else if (sortBy === 'name-asc') {
      sortedResults.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      sortedResults.sort((a, b) => b.name.localeCompare(a.name));
    }

    // On limite à 50 par défaut si on cherche par nom
    if (searchTerm) {
      return sortedResults.slice(0, 50);
    }

    return sortedResults;
  }, [infiniteData, typePokemon, genPokemon, searchTerm, allNames, selectedTypes, selectedGeneration, showFavoritesOnly, favorites, sortBy, isLegendary, minBaseStats, heightRange, weightRange]);

  // Déclenchement automatique du chargement suivant
  useEffect(() => {
    const isBasicMode = selectedTypes.length === 0 && !searchTerm && !selectedGeneration && !showFavoritesOnly && isLegendary === null && minBaseStats === 0;
    if (isInView && hasNextPage && !isFetchingNextPage && isBasicMode) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage, searchTerm, selectedTypes, selectedGeneration, showFavoritesOnly, isLegendary, minBaseStats]);

  const isLoading = isLoadingInfinite || 
    (selectedTypes.length > 0 && typeQueries.some(q => q.isLoading)) || 
    (selectedGeneration && isLoadingGen) ||
    ((showFavoritesOnly || isLegendary !== null || minBaseStats > 0) && !allNames);

  if (isLoading && displayedPokemon.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary drop-shadow-[0_0_15px_rgba(255,100,100,0.5)]" />
        <p className="text-foreground/40 font-semibold tracking-widest uppercase text-sm animate-pulse">Loading Pokédex...</p>
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
        <h3 className="text-2xl font-black mb-2 text-foreground/80 tracking-tight">No Pokémon found</h3>
        <p className="text-base text-foreground/50 font-medium">Try adjusting your search or filters</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between px-4">
        <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
          {searchTerm ? (
            <>Search results for <span className="text-primary">&quot;{searchTerm}&quot;</span></>
          ) : (selectedTypes.length > 0 || selectedGeneration || showFavoritesOnly || isLegendary !== null || minBaseStats > 0) ? (
            <div className="flex gap-2 items-center flex-wrap">
              {showFavoritesOnly && (
                <span className="text-red-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Favorites
                </span>
              )}
              {showFavoritesOnly && (selectedTypes.length > 0 || selectedGeneration) && <span className="opacity-30 mx-1">|</span>}
              {selectedGeneration && (
                <>Gen: <span className="text-primary">{selectedGeneration}</span></>
              )}
              {selectedGeneration && selectedTypes.length > 0 && <span className="opacity-30 mx-1">|</span>}
              {selectedTypes.length > 0 && (
                <>Types: <span className="text-primary capitalize">{selectedTypes.join(', ')}</span></>
              )}
              {isLegendary && (
                <><span className="opacity-30 mx-1">|</span> <span className="text-yellow-500">Legendary</span></>
              )}
              {minBaseStats > 0 && (
                <><span className="opacity-30 mx-1">|</span> <span className="text-blue-500">BST {minBaseStats}+</span></>
              )}
              <span className="ml-2 opacity-50">({displayedPokemon.length})</span>
            </div>
          ) : (
            <>Showing <span className="text-primary">{displayedPokemon.length}</span> Pokémon</>
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
            filters={{
              isLegendary,
              minBaseStats,
              heightRange,
              weightRange
            }}
          />
        ))}
      </div>

      {/* Point d'ancrage pour l'Infinite Scroll */}
      {selectedTypes.length === 0 && !searchTerm && !selectedGeneration && !showFavoritesOnly && isLegendary === null && minBaseStats === 0 && hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}
