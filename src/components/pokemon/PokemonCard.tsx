import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { PokemonDetail, PokemonSpecies, TYPE_COLORS, PokemonCardType, LocalizedNameEntry } from '@/types/pokemon';
import { motion } from 'framer-motion';
import { Heart, ArrowLeftRight, Plus, Minus } from 'lucide-react';
import { usePrimeDexStore } from '@/store/primedex';
import { cn, formatId } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import Image from 'next/image';
import { SVGProps, memo, useCallback, useState, useEffect } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface GqlPokemonData {
  id?: number;
  name?: string;
  types?: PokemonDetail['types'];
  pokemon_v2_pokemontypes?: Array<{ pokemon_v2_type: { name: string } }>;
  localizedNames?: LocalizedNameEntry[];
}

interface PokemonCardProps {
  name: string;
  url: string;
  index?: number;
  initialData?: {
    pokemon: Partial<PokemonDetail> & GqlPokemonData;
    species?: Partial<PokemonSpecies>;
  };
}

export function PokemonCardSkeleton() {
  return (
    <div className="py-4 px-2 h-[28rem]">
      <div className="glass-panel h-full p-6 flex flex-col items-center rounded-[2rem] animate-pulse">
        <div className="flex justify-between items-center w-full mb-4">
          <Skeleton className="h-5 w-14 bg-white/[0.06]" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full bg-white/[0.06]" />
            <Skeleton className="h-9 w-9 rounded-full bg-white/[0.06]" />
            <Skeleton className="h-9 w-9 rounded-full bg-white/[0.06]" />
          </div>
        </div>
        <Skeleton className="w-36 h-36 rounded-full bg-white/[0.06] my-4" />
        <div className="mt-auto w-full flex flex-col items-center gap-4 pt-6">
          <Skeleton className="h-8 w-32 bg-white/[0.06]" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full bg-white/[0.06]" />
            <Skeleton className="h-6 w-16 rounded-full bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const PokemonCard = memo(function PokemonCard({ name, url, index = 0, initialData }: PokemonCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  
  const language = usePrimeDexStore(s => s.language);
  const systemLanguage = usePrimeDexStore(s => s.systemLanguage);
  const favorites = usePrimeDexStore(s => s.favorites);
  const compareList = usePrimeDexStore(s => s.compareList);
  const team = usePrimeDexStore(s => s.team);
  const caughtPokemon = usePrimeDexStore(s => s.caughtPokemon);
  
  const addFavorite = usePrimeDexStore(s => s.addFavorite);
  const removeFavorite = usePrimeDexStore(s => s.removeFavorite);
  const addToCompare = usePrimeDexStore(s => s.addToCompare);
  const removeFromCompare = usePrimeDexStore(s => s.removeFromCompare);
  const addToTeam = usePrimeDexStore(s => s.addToTeam);
  const removeFromTeam = usePrimeDexStore(s => s.removeFromTeam);
  const toggleCaught = usePrimeDexStore(s => s.toggleCaught);

  const resolvedLang = language === 'auto' ? systemLanguage : language;

  // Only fetch from REST when we have no usable display data at all
  // (no types, no name to show). The grid passes initialData from GraphQL summary
  // which already contains types and localized names — no need for extra fetches.
  const pokemonGql = initialData?.pokemon as GqlPokemonData | undefined;
  const hasUsableData = !!(initialData?.pokemon?.id && 
    ((pokemonGql?.types?.length ?? 0) > 0 || (pokemonGql?.pokemon_v2_pokemontypes?.length ?? 0) > 0));

  const { data, isLoading } = useQuery<{
    pokemon: Partial<PokemonDetail>;
    species?: Partial<PokemonSpecies>;
  }>({
    queryKey: ['pokemon-card', name, resolvedLang],
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
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !hasUsableData,
  });

  const displayData = data || initialData;
  
  const prefetchDetails = useCallback(() => {
    if (!name) return;
    const speciesUrl = url.replace('/pokemon/', '/pokemon-species/');
    queryClient.prefetchQuery({
      queryKey: ['pokemon-card', name, resolvedLang],
      queryFn: async () => {
        const [pokemonRes, speciesRes] = await Promise.all([
          axios.get<PokemonDetail>(url),
          axios.get<PokemonSpecies>(speciesUrl).catch(() => null)
        ]);
        return { 
          pokemon: pokemonRes.data, 
          species: speciesRes?.data as PokemonSpecies
        };
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [name, url, queryClient, resolvedLang]);

  if (isLoading && !displayData) {
    return <PokemonCardSkeleton />;
  }

  if (!displayData || !displayData.pokemon) return null;
  const { pokemon, species } = displayData;
  const pokemonId = pokemon.id || 0;

  const isFav = mounted && favorites.includes(pokemonId);
  const isComp = mounted && compareList.includes(pokemonId);
  const isTeam = mounted && team.includes(pokemonId);
  const caught = mounted && caughtPokemon.includes(pokemonId);
  
  const teamFull = mounted && team.length >= 6;
  const compareFull = mounted && compareList.length >= 3;

  const pokemonGqlData = pokemon as unknown as GqlPokemonData;
  const typesRaw: (PokemonDetail['types'][number] | { pokemon_v2_type: { name: string } })[] = pokemon.types || pokemonGqlData.pokemon_v2_pokemontypes || [];
  const types: PokemonCardType[] = typesRaw.map((t): PokemonCardType | null => {
    if (!t) return null;
    if (typeof t === 'string') return { type: { name: t } };
    if ('type' in t && (t as { type?: { name?: string } }).type?.name) return t as PokemonCardType;
    if ('pokemon_v2_type' in t) {
      const gqlType = t as { pokemon_v2_type?: { name?: string } };
      if (gqlType.pokemon_v2_type?.name) return { type: { name: gqlType.pokemon_v2_type.name } };
    }
    return null;
  }).filter((t): t is PokemonCardType => t !== null);
  const mainType = types[0]?.type?.name || 'normal';
  const color = TYPE_COLORS[mainType] || '#A8A77A';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    isFav ? removeFavorite(pokemonId) : addFavorite(pokemonId);
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    isComp ? removeFromCompare(pokemonId) : addToCompare(pokemonId);
  };

  const toggleTeam = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    isTeam ? removeFromTeam(pokemonId) : addToTeam(pokemonId);
  };

  const handleToggleCaught = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggleCaught(pokemonId);
  };

  const getLocalizedName = () => {
    if (species?.names?.length) {
      const entry = species.names.find(n => n?.language?.name === resolvedLang) || species.names.find(n => n?.language?.name === 'en');
      if (entry?.name) return entry.name;
    }
    const gqlSpeciesData = pokemonGqlData;
    if (gqlSpeciesData.localizedNames?.length) {
      const entry = gqlSpeciesData.localizedNames.find((n: LocalizedNameEntry) => n?.language === resolvedLang) || gqlSpeciesData.localizedNames.find((n: LocalizedNameEntry) => n?.language === 'en');
      if (entry?.name) return entry.name;
    }
    return pokemon.name || name;
  };

  const displayName = getLocalizedName();
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return (
    <Link href={`/pokemon/${name}`} className="block h-full py-4 px-2" onMouseEnter={prefetchDetails}>
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="glass-panel type-glow holo-border relative h-full p-6 flex flex-col items-center group overflow-hidden rounded-[2rem]"
        style={{ '--type-color': `${color}50` } as React.CSSProperties}
      >
        {/* Caught pokeball */}
        <button 
          onClick={handleToggleCaught}
          className={cn(
            "absolute bottom-6 left-6 z-20 transition-all duration-500 hover:scale-110 active:scale-90",
            caught ? "opacity-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "opacity-15 grayscale hover:opacity-40"
          )}
          title={caught ? t('card.caught') : t('card.mark_caught')}
          aria-label={caught ? t('card.caught') : t('card.mark_caught')}
        >
          <PokeballIcon className={cn("w-6 h-6", caught ? "text-red-500" : "text-foreground")} />
        </button>

        {/* Top ambient glow */}
        <div 
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-[80px] opacity-15 group-hover:opacity-35 transition-all duration-1000" 
          style={{ backgroundColor: color }} 
        />
        
        {/* Bottom subtle glow */}
        <div 
          className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-all duration-1000" 
          style={{ backgroundColor: color }} 
        />
        
        {/* ID and Action buttons */}
        <div className="flex justify-between items-center w-full z-10 mb-4">
          <span className="text-sm font-black text-foreground/30 group-hover:text-foreground/60 transition-colors duration-300 tracking-tight">{formatId(pokemonId)}</span>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
              onClick={toggleTeam} disabled={!isTeam && teamFull}
              aria-label={isTeam ? t('card.remove_team') : t('card.add_team')}
              className={cn(
                "p-2 rounded-full backdrop-blur-xl transition-all duration-300 border",
                isTeam 
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.2)]" 
                  : "bg-white/[0.03] text-foreground/30 border-white/[0.06] hover:text-foreground/70 hover:bg-white/[0.06]",
                !isTeam && teamFull && "opacity-15 cursor-not-allowed"
              )}
            >
              {isTeam ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
              onClick={toggleCompare} disabled={!isComp && compareFull}
              aria-label={isComp ? t('card.remove_compare') : t('card.add_compare')}
              className={cn(
                "p-2 rounded-full backdrop-blur-xl transition-all duration-300 border",
                isComp 
                  ? "bg-primary/15 text-primary border-primary/20 shadow-[0_0_12px_rgba(227,53,13,0.2)]" 
                  : "bg-white/[0.03] text-foreground/30 border-white/[0.06] hover:text-foreground/70 hover:bg-white/[0.06]",
                !isComp && compareFull && "opacity-15 cursor-not-allowed"
              )}
            >
              <ArrowLeftRight className={cn("w-3.5 h-3.5 transition-transform", isComp && "scale-110")} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
              onClick={toggleFavorite}
              aria-label={isFav ? t('card.remove_favorite') : t('card.add_favorite')}
              className={cn(
                "p-2 rounded-full backdrop-blur-xl transition-all duration-300 border",
                isFav 
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]" 
                  : "bg-white/[0.03] text-foreground/30 border-white/[0.06] hover:text-foreground/70 hover:bg-white/[0.06]"
              )}
            >
              <motion.div animate={isFav ? { scale: [1, 1.5, 1], transition: { duration: 0.35 } } : {}}>
                <Heart className={cn("w-3.5 h-3.5 transition-all", isFav && "fill-current")} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Pokemon Image */}
        <div className="relative w-36 h-36 my-4 z-10 flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full blur-[40px] opacity-20 group-hover:opacity-50 group-hover:scale-130 transition-all duration-1000" 
            style={{ backgroundColor: color }} 
          />
          <Image
            src={spriteUrl} 
            alt={t('pokemon.artwork', { name: displayName })} 
            width={160} height={160}
            className="w-full h-full object-contain drop-shadow-2xl transition-all duration-700 ease-out group-hover:scale-[1.2] group-hover:-translate-y-4 relative z-10"
            priority={index < 10}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>

        {/* Name and types */}
        <div className="mt-auto w-full text-center z-10 pt-6">
          <h3 className="text-xl font-black text-foreground capitalize mb-3 tracking-tight group-hover:text-foreground/90 transition-colors">{displayName}</h3>
          <div className="flex justify-center gap-2 flex-wrap mb-2">
            {types.map((typeItem: any, i: number) => {
              const typeName = typeItem?.type?.name;
              if (!typeName) return null;
              return (
                <span key={`${typeName}-${i}`} className="glass-tag" style={{ backgroundColor: `${TYPE_COLORS[typeName] || '#A8A77A'}cc`, borderColor: TYPE_COLORS[typeName] || '#A8A77A' }}>
                  {t(`types.${typeName}`)}
                </span>
              );
            })}
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

function PokeballIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill={props.className?.includes('text-red-500') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
