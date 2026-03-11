'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PokemonDetail, TYPE_COLORS } from '@/types/pokemon';
import { motion } from 'framer-motion';
import { Heart, ArrowLeftRight, Plus, Minus } from 'lucide-react';
import { usePokedexStore } from '@/store/pokedex';
import { cn, formatId } from '@/lib/utils';
import Link from 'next/link';

interface PokemonCardProps {
  name: string;
  url: string;
  filters?: {
    isLegendary: boolean | null;
    minBaseStats: number;
    heightRange: [number, number];
    weightRange: [number, number];
  };
}

export function PokemonCard({ name, url, filters }: PokemonCardProps) {
  const { 
    isFavorite, 
    addFavorite, 
    removeFavorite, 
    addToCompare, 
    removeFromCompare, 
    isInCompare,
    compareList,
    addToTeam,
    removeFromTeam,
    isInTeam,
    team
  } = usePokedexStore();

  const { data: pokemon, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['pokemon', name],
    queryFn: async () => {
      const { data } = await axios.get<PokemonDetail>(url);
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: species, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['pokemon-species', name],
    queryFn: async () => {
      if (!pokemon) return null;
      const { data } = await axios.get(pokemon.species.url);
      return data;
    },
    enabled: !!pokemon && filters?.isLegendary !== null,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoadingDetail || (filters?.isLegendary !== null && isLoadingSpecies)) {
    return (
      <div className="py-4 px-2 h-80">
        <div className="glass-panel w-full h-full rounded-[2rem] animate-pulse bg-white/5" />
      </div>
    );
  }

  if (!pokemon) return null;

  // Advanced Filtering Logic
  if (filters) {
    const { isLegendary, minBaseStats, heightRange, weightRange } = filters;

    // Filter by Legendary status
    if (isLegendary === true && species) {
      const isLegendaryOrMythical = species.is_legendary || species.is_mythical;
      if (!isLegendaryOrMythical) return null;
    }

    // Filter by Stats (BST)
    if (minBaseStats > 0) {
      const bst = pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);
      if (bst < minBaseStats) return null;
    }

    // Filter by Height (m)
    const heightInMeters = pokemon.height / 10;
    if (heightInMeters < heightRange[0] || heightInMeters > heightRange[1]) return null;

    // Filter by Weight (kg)
    const weightInKg = pokemon.weight / 10;
    if (weightInKg < weightRange[0] || weightInKg > weightRange[1]) return null;
  }

  const isFav = isFavorite(pokemon.id);
  const isComp = isInCompare(pokemon.id);
  const isTeam = isInTeam(pokemon.id);
  const mainType = pokemon.types[0].type.name;
  const color = TYPE_COLORS[mainType] || '#A8A77A';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(pokemon.id);
    } else {
      addFavorite(pokemon.id);
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isComp) {
      removeFromCompare(pokemon.id);
    } else {
      addToCompare(pokemon.id);
    }
  };

  const toggleTeam = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTeam) {
      removeFromTeam(pokemon.id);
    } else {
      addToTeam(pokemon.id);
    }
  };

  return (
    <Link href={`/pokemon/${name}`} className="block h-full py-4 px-2">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="glass-panel type-glow relative h-full p-6 flex flex-col items-center group overflow-hidden rounded-[2rem]"
        style={{ '--type-color': `${color}40` } as React.CSSProperties}
      >
        {/* Colorful background mesh */}
        <div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          style={{ backgroundColor: color }}
        />
        <div 
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[50px] opacity-10 group-hover:opacity-30 transition-opacity duration-500"
          style={{ backgroundColor: color }}
        />

        {/* Top bar with ID and Actions */}
        <div className="flex justify-between items-center w-full z-10 mb-4">
          <span className="text-sm font-black text-foreground/40 drop-shadow-sm">
            {formatId(pokemon.id)}
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTeam}
              disabled={!isTeam && team.length >= 6}
              className={cn(
                "p-2 rounded-full backdrop-blur-md transition-all",
                isTeam 
                  ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" 
                  : "bg-secondary/30 text-foreground/40 hover:text-foreground/80 hover:bg-secondary/50",
                !isTeam && team.length >= 6 && "opacity-20 cursor-not-allowed"
              )}
              title={isTeam ? "Remove from team" : "Add to team"}
            >
              {isTeam ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCompare}
              disabled={!isComp && compareList.length >= 3}
              className={cn(
                "p-2 rounded-full backdrop-blur-md transition-all",
                isComp 
                  ? "bg-primary/20 text-primary hover:bg-primary/30" 
                  : "bg-secondary/30 text-foreground/40 hover:text-foreground/80 hover:bg-secondary/50",
                !isComp && compareList.length >= 3 && "opacity-20 cursor-not-allowed"
              )}
              title={isComp ? "Remove from comparison" : "Add to comparison"}
            >
              <ArrowLeftRight className={cn("w-4 h-4 transition-transform", isComp && "scale-110")} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={cn(
                "p-2 rounded-full backdrop-blur-md transition-all",
                isFav 
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                  : "bg-secondary/30 text-foreground/40 hover:text-foreground/80 hover:bg-secondary/50"
              )}
              aria-label={isFav ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
            >
              <Heart className={cn("w-5 h-5 transition-transform", isFav && "fill-current scale-110")} />
            </motion.button>
          </div>
        </div>

        {/* Pokemon Image */}
        <div className="relative w-36 h-36 my-4 z-10">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500"
            style={{ backgroundColor: color }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
            alt={name}
            className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-2 relative z-10"
            loading="lazy"
          />
        </div>

        {/* Info Section */}
        <div className="mt-auto w-full text-center z-10 pt-6">
          <h3 className="text-xl font-black text-foreground capitalize mb-4 tracking-tight drop-shadow-sm">
            {pokemon.name}
          </h3>

          <div className="flex justify-center gap-2 flex-wrap">
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className="glass-tag"
                style={{ 
                  backgroundColor: `${TYPE_COLORS[t.type.name]}cc`,
                  borderColor: TYPE_COLORS[t.type.name]
                }}
              >
                {t.type.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
