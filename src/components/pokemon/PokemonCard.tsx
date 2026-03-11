'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PokemonDetail, PokemonSpecies, TYPE_COLORS } from '@/types/pokemon';
import { motion } from 'framer-motion';
import { Heart, ArrowLeftRight, Plus, Minus } from 'lucide-react';
import { usePokedexStore } from '@/store/pokedex';
import { cn, formatId } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { SVGProps } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface PokemonCardProps {
  name: string;
  url: string;
  initialData?: {
    pokemon: Partial<PokemonDetail>;
    species?: Partial<PokemonSpecies>;
  };
}

export function PokemonCardSkeleton() {
  return (
    <div className="py-4 px-2 h-[26rem]">
      <div className="glass-panel h-full p-6 flex flex-col items-center rounded-[2rem] bg-white/5 animate-pulse">
        <div className="flex justify-between items-center w-full mb-4">
          <Skeleton className="h-4 w-12 bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
            <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
            <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
          </div>
        </div>
        <Skeleton className="w-40 h-40 rounded-full bg-white/10 my-2" />
        <div className="mt-auto w-full flex flex-col items-center gap-4 pt-6">
          <Skeleton className="h-8 w-32 bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
            <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PokemonCard({ name, url, initialData }: PokemonCardProps) {
  const { t } = useTranslation();
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
    team,
    language,
    systemLanguage,
    isCaught,
    toggleCaught
  } = usePokedexStore();

  const { data, isLoading } = useQuery<{
    pokemon: Partial<PokemonDetail>;
    species?: Partial<PokemonSpecies>;
  }>({
    queryKey: ['pokemon-card', name],
    queryFn: async () => {
      const speciesUrl = url.replace('/pokemon/', '/pokemon-species/');
      const [pokemonRes, speciesRes] = await Promise.all([
        axios.get<PokemonDetail>(url),
        axios.get<PokemonSpecies>(speciesUrl).catch(() => null)
      ]);
      return { 
        pokemon: pokemonRes.data, 
        species: speciesRes?.data as PokemonSpecies
      };
    },
    initialData: initialData,
    staleTime: 10 * 60 * 1000,
    enabled: !initialData,
  });

  const displayData = initialData || data;

  if (isLoading && !displayData) {
    return <PokemonCardSkeleton />;
  }

  if (!displayData || !displayData.pokemon) return null;
  const { pokemon, species } = displayData;

  const pokemonId = pokemon.id!;
  const isFav = isFavorite(pokemonId);
  const isComp = isInCompare(pokemonId);
  const isTeam = isInTeam(pokemonId);
  const caught = isCaught(pokemonId);
  
  // Handle type data from both REST and GraphQL formats
  const gqlData = pokemon as unknown as { pokemon_v2_pokemontypes?: { pokemon_v2_type: { name: string } }[] };
  const types = pokemon.types || gqlData.pokemon_v2_pokemontypes?.map((t) => ({ type: { name: t.pokemon_v2_type.name } })) || [];
  const mainType = types[0]?.type?.name || 'normal';
  const color = TYPE_COLORS[mainType] || '#A8A77A';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(pokemonId);
    } else {
      addFavorite(pokemonId);
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isComp) {
      removeFromCompare(pokemonId);
    } else {
      addToCompare(pokemonId);
    }
  };

  const toggleTeam = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTeam) {
      removeFromTeam(pokemonId);
    } else {
      addToTeam(pokemonId);
    }
  };

  const handleToggleCaught = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCaught(pokemonId);
  };

  // Find localized name based on user selected language, or fallback to english, then the default API name
  const resolvedLang = language === 'auto' ? systemLanguage : language;
  
  let displayName = pokemon.name!;
  if (species?.names) {
    const localizedNameEntry = species.names.find(n => n.language.name === resolvedLang) 
      || species.names.find(n => n.language.name === 'en');
    if (localizedNameEntry) displayName = localizedNameEntry.name;
  } else {
    const gqlSpeciesData = pokemon as unknown as { 
      localizedNames?: { language: string; name: string }[];
    };
    if (gqlSpeciesData.localizedNames) {
      const localizedNameEntry = gqlSpeciesData.localizedNames.find((n) => n.language === resolvedLang)
        || gqlSpeciesData.localizedNames.find((n) => n.language === 'en');
      if (localizedNameEntry) displayName = localizedNameEntry.name;
    }
  }

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return (
    <Link href={`/pokemon/${name}`} className="block h-full py-4 px-2">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17,
          duration: 0.2
        }}
        className="glass-panel type-glow relative h-full p-6 flex flex-col items-center group overflow-hidden rounded-[2rem]"
        style={{ '--type-color': `${color}40` } as React.CSSProperties}
      >
        {/* Caught Badge */}
        <button 
          onClick={handleToggleCaught}
          className={cn(
            "absolute bottom-6 left-6 z-20 transition-all duration-500 hover:scale-110 active:scale-90",
            caught ? "opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-20 grayscale hover:opacity-50"
          )}
          title={caught ? "Caught!" : "Mark as caught"}
        >
          <PokeballIcon className={cn("w-6 h-6", caught ? "text-red-500" : "text-foreground")} />
        </button>

        {/* Colorful background mesh */}
        <div 
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 ease-in-out"
          style={{ backgroundColor: color }}
        />
        <div 
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 ease-in-out"
          style={{ backgroundColor: color }}
        />

        {/* Top bar with ID and Actions */}
        <div className="flex justify-between items-center w-full z-10 mb-4">
          <span className="text-sm font-black text-foreground/50 drop-shadow-sm group-hover:text-foreground/80 transition-colors">
            {formatId(pokemonId)}
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTeam}
              disabled={!isTeam && team.length >= 6}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm",
                isTeam 
                  ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" 
                  : "bg-secondary/40 text-foreground/40 hover:text-foreground/80 hover:bg-secondary/60",
                !isTeam && team.length >= 6 && "opacity-20 cursor-not-allowed"
              )}
              title={isTeam ? t('card.remove_team') : t('card.add_team')}
              aria-label={isTeam ? t('card.remove_team') || 'Remove from team' : t('card.add_team') || 'Add to team'}
            >
              {isTeam ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCompare}
              disabled={!isComp && compareList.length >= 3}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm",
                isComp 
                  ? "bg-primary/20 text-primary hover:bg-primary/30" 
                  : "bg-secondary/40 text-foreground/40 hover:text-foreground/80 hover:bg-secondary/60",
                !isComp && compareList.length >= 3 && "opacity-20 cursor-not-allowed"
              )}
              title={isComp ? t('card.remove_compare') : t('card.add_compare')}
              aria-label={isComp ? t('card.remove_compare') || 'Remove from comparison' : t('card.add_compare') || 'Add to comparison'}
            >
              <ArrowLeftRight className={cn("w-4 h-4 transition-transform", isComp && "scale-110")} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm",
                isFav 
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                  : "bg-secondary/40 text-foreground/40 hover:text-foreground/80 hover:bg-secondary/60"
              )}
              title={isFav ? t('card.remove_favorite') : t('card.add_favorite')}
              aria-label={isFav ? t('card.remove_favorite') || 'Remove from favorites' : t('card.add_favorite') || 'Add to favorites'}
            >
              <motion.div
                animate={isFav ? {
                  scale: [1, 1.4, 1],
                  transition: { duration: 0.3 }
                } : {}}
              >
                <Heart className={cn("w-4 h-4 transition-transform", isFav && "fill-current scale-110")} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Pokemon Image */}
        <div className="relative w-40 h-40 my-2 z-10 flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full blur-[30px] opacity-20 group-hover:opacity-50 group-hover:scale-125 transition-all duration-700 ease-in-out"
            style={{ backgroundColor: color }}
          />
          <Image
            src={spriteUrl}
            alt={displayName}
            width={160}
            height={160}
            className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out group-hover:scale-125 group-hover:-translate-y-3 relative z-10"
            priority={pokemonId <= 20}
          />
        </div>

        {/* Info Section */}
        <div className="mt-auto w-full text-center z-10 pt-6">
          <h3 className="text-2xl font-black text-foreground capitalize mb-4 tracking-tighter drop-shadow-sm">
            {displayName}
          </h3>

          <div className="flex justify-center gap-2 flex-wrap mb-2">
            {types.map((t: { type: { name: string } }) => (
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

function PokeballIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill={props.className?.includes('text-red-500') ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
