'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { usePokedexStore } from '@/store/pokedex';
import { getPokemonList, getPokemonByType, getAllPokemonNames, getPokemonByGeneration } from '@/lib/api';
import { PokemonCard } from './PokemonCard';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useMemo } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PokemonList() {
  const { searchTerm, selectedType, selectedRegion, showFavoritesOnly, favorites, sortBy } = usePokedexStore();
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
    enabled: !selectedType && !searchTerm && !selectedRegion && !showFavoritesOnly, // Désactivé si on filtre ou cherche
    staleTime: 10 * 60 * 1000,
  });

  // 2. Mode Filtre par Type : PokéAPI renvoie tout d'un coup pour un type
  const { data: typePokemon, isLoading: isLoadingType } = useQuery({
    queryKey: ['typePokemon', selectedType],
    queryFn: () => (selectedType ? getPokemonByType(selectedType) : Promise.resolve([])),
    enabled: !!selectedType && !searchTerm,
    staleTime: 10 * 60 * 1000,
  });

  // 3. Mode Filtre par Région (Génération)
  const { data: regionPokemon, isLoading: isLoadingRegion } = useQuery({
    queryKey: ['regionPokemon', selectedRegion],
    queryFn: () => (selectedRegion ? getPokemonByGeneration(selectedRegion) : Promise.resolve([])),
    enabled: !!selectedRegion && !searchTerm,
    staleTime: 10 * 60 * 1000,
  });

  // 4. Mode Recherche ou Favoris : On récupère les noms pour filtrer localement
  const { data: allNames } = useQuery({
    queryKey: ['allPokemonNames'],
    queryFn: getAllPokemonNames,
    enabled: !!searchTerm || showFavoritesOnly,
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
      ).slice(0, 50);
    } else if (selectedType && selectedRegion) {
      if (!typePokemon || !regionPokemon) return [];
      const regionNames = new Set(regionPokemon.map(p => p.name));
      results = typePokemon.filter(p => regionNames.has(p.name));
    } else if (selectedType) {
      results = typePokemon || [];
    } else if (selectedRegion) {
      results = regionPokemon || [];
    } else if (showFavoritesOnly) {
      results = allNames?.filter(p => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
        return favorites.includes(id);
      }) || [];
    } else {
      results = infiniteData?.pages.flatMap((page) => page.results) || [];
    }

    // Application du filtre favoris si activé en plus d'un autre filtre
    if (showFavoritesOnly && (searchTerm || selectedType || selectedRegion)) {
      results = results.filter(p => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
        return favorites.includes(id);
      });
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

    return sortedResults;
  }, [infiniteData, typePokemon, regionPokemon, searchTerm, allNames, selectedType, selectedRegion, showFavoritesOnly, favorites, sortBy]);

  // Déclenchement automatique du chargement suivant
  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage && !searchTerm && !selectedType && !selectedRegion && !showFavoritesOnly) {
      fetchNextPage();
    }
  }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage, searchTerm, selectedType, selectedRegion, showFavoritesOnly]);

  const isLoading = isLoadingInfinite || 
    (selectedType && !searchTerm && isLoadingType) || 
    (selectedRegion && !searchTerm && isLoadingRegion) ||
    (showFavoritesOnly && !searchTerm && !allNames);

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
          ) : selectedType || selectedRegion || showFavoritesOnly ? (
            <div className="flex gap-2 items-center flex-wrap">
              {showFavoritesOnly && (
                <span className="text-red-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Favorites
                </span>
              )}
              {showFavoritesOnly && (selectedType || selectedRegion) && <span className="opacity-30 mx-1">|</span>}
              {selectedRegion && (
                <>Region: <span className="text-primary">{selectedRegion}</span></>
              )}
              {selectedRegion && selectedType && <span className="opacity-30 mx-1">|</span>}
              {selectedType && (
                <>Type: <span className="text-primary capitalize">{selectedType}</span></>
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
          <PokemonCard key={p.name} name={p.name} url={p.url} />
        ))}
      </div>

      {/* Point d'ancrage pour l'Infinite Scroll */}
      {!searchTerm && !selectedType && !selectedRegion && !showFavoritesOnly && hasNextPage && (
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
