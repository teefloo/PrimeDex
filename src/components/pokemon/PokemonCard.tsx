'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPokemonDetail, getPokemonSpecies } from '@/lib/api';
import { getBaseSpeciesName } from '@/lib/form-names';
import { PokemonDetail, PokemonSpecies, TYPE_COLORS, PokemonCardType, LocalizedNameEntry } from '@/types/pokemon';
import { Heart, ArrowLeftRight, Plus, Minus } from 'lucide-react';
import { usePrimeDexStore } from '@/store/primedex';
import { cn, formatPokemonSlugName } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useMounted } from '@/hooks/useMounted';

import { Skeleton } from '@/components/ui/skeleton';
import { PokeballIcon } from '@/components/ui/PokeballIcon';

interface GqlPokemonData {
  id?: number;
  name?: string;
  types?: PokemonDetail['types'] | string[];
  pokemon_v2_pokemontypes?: Array<{ pokemon_v2_type: { name: string } }>;
  localizedNames?: LocalizedNameEntry[];
  stats?: number[];
  is_legendary?: boolean;
  is_mythical?: boolean;
}

interface PokemonCardProps {
  name: string;
  url?: string;
  index?: number;
  initialData?: {
    pokemon: Partial<PokemonDetail> & GqlPokemonData;
    species?: Partial<PokemonSpecies>;
  };
}

export type { GqlPokemonData, PokemonCardProps };

export function PokemonCardSkeleton() {
  return (
    <div className="py-2 px-2 h-[22rem]">
      <div className="glass-panel h-full p-6 flex flex-col items-center rounded-3xl animate-pulse">
        <div className="flex justify-between items-center w-full mb-4">
          <Skeleton className="h-5 w-14 bg-muted/60" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full bg-muted/60" />
            <Skeleton className="h-9 w-9 rounded-full bg-muted/60" />
            <Skeleton className="h-9 w-9 rounded-full bg-muted/60" />
          </div>
        </div>
        <Skeleton className="w-36 h-36 rounded-full bg-muted/60 my-4" />
        <div className="mt-auto w-full flex flex-col items-center gap-4 pt-6">
          <Skeleton className="h-8 w-32 bg-muted/60" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full bg-muted/60" />
            <Skeleton className="h-6 w-16 rounded-full bg-muted/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const PokemonCard = memo(function PokemonCard({ name, index = 0, initialData }: PokemonCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mounted = useMounted();

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

  const pokemonGql = initialData?.pokemon as GqlPokemonData | undefined;
  const hasUsableData = !!(initialData?.pokemon?.id &&
    ((pokemonGql?.types?.length ?? 0) > 0 || (pokemonGql?.pokemon_v2_pokemontypes?.length ?? 0) > 0));

  const { data, isLoading } = useQuery<{
    pokemon: Partial<PokemonDetail>;
    species?: Partial<PokemonSpecies>;
  }>({
    queryKey: ['pokemon-card', name],
    queryFn: async () => {
      const baseName = getBaseSpeciesName(name);
      const [pokemon, species] = await Promise.all([
        getPokemonDetail(name),
        getPokemonSpecies(baseName).catch(() => null),
      ]);
      return {
        pokemon,
        species: species as PokemonSpecies,
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !hasUsableData,
  });

  const displayData = data || initialData;
  const pokemonData = displayData?.pokemon;
  const speciesData = displayData?.species;
  const pokemonGqlData = pokemonData as GqlPokemonData | undefined;

  const pokemonName = pokemonData?.name || name;
  let displayName = pokemonName.includes('-')
    ? formatPokemonSlugName(pokemonName)
    : pokemonName;
  if (!pokemonName.includes('-')) {
    if (speciesData?.names?.length) {
      const entry = speciesData.names.find(n => n?.language?.name === resolvedLang) || speciesData.names.find(n => n?.language?.name === 'en');
      if (entry?.name) displayName = entry.name;
    } else if (pokemonGqlData?.localizedNames?.length) {
      const entry = pokemonGqlData.localizedNames.find((n: LocalizedNameEntry) => n?.language === resolvedLang) || pokemonGqlData.localizedNames.find((n: LocalizedNameEntry) => n?.language === 'en');
      if (entry?.name) displayName = entry.name;
    }
  }

  const prefetchDetails = useCallback(() => {
    if (!name) return;
    queryClient.prefetchQuery({
      queryKey: ['pokemon-card', name],
      queryFn: async () => {
        const baseName = getBaseSpeciesName(name);
        const [pokemon, species] = await Promise.all([
          getPokemonDetail(name),
          getPokemonSpecies(baseName).catch(() => null),
        ]);
        return {
          pokemon,
          species: species as PokemonSpecies,
        };
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [name, queryClient]);

  if (isLoading && !displayData) {
    return <PokemonCardSkeleton />;
  }

  if (!displayData || !displayData.pokemon) return null;
  const pokemon = displayData.pokemon as Partial<PokemonDetail> & GqlPokemonData;
  const pokemonId = pokemon.id || 0;

  const isFav = mounted && favorites.includes(pokemonId);
  const isComp = mounted && compareList.includes(pokemonId);
  const isTeam = mounted && team.includes(pokemonId);
  const caught = mounted && caughtPokemon.includes(pokemonId);

  const teamFull = mounted && team.length >= 6;
  const compareFull = mounted && compareList.length >= 3;

  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isFav) {
      removeFavorite(pokemonId);
    } else {
      addFavorite(pokemonId);
    }
  };

  const toggleCompare = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isComp) {
      removeFromCompare(pokemonId);
    } else {
      addToCompare(pokemonId);
    }
  };

  const toggleTeam = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isTeam) {
      removeFromTeam(pokemonId);
    } else {
      addToTeam(pokemonId);
    }
  };

  const types: PokemonCardType[] = (pokemon.types || pokemon.pokemon_v2_pokemontypes || []).map((typeItem): PokemonCardType | null => {
    if (!typeItem) return null;
    if (typeof typeItem === 'string') return { type: { name: typeItem } };
    if ('type' in typeItem && (typeItem as { type?: { name?: string } }).type?.name) return typeItem as PokemonCardType;
    if ('pokemon_v2_type' in typeItem) {
      const gqlType = typeItem as { pokemon_v2_type?: { name?: string } };
      if (gqlType.pokemon_v2_type?.name) return { type: { name: gqlType.pokemon_v2_type.name } };
    }
    return null;
  }).filter((type): type is PokemonCardType => type !== null);

  const mainType = types[0]?.type?.name || 'normal';
  const color = TYPE_COLORS[mainType] || '#A8A77A';
  const cardLabel = t('detail.view_card_aria', { name: displayName });

  return (
    <div className="relative block h-full py-1 px-1 sm:px-2" onMouseEnter={prefetchDetails}>
      <div
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-secondary/25 p-2 transition-all duration-500 sm:p-4"
        style={{
          '--type-color': `${color}50`,
          boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
        } as CSSProperties}
      >
        <Link
          href={`/pokemon/${name}`}
          aria-label={cardLabel}
          className="absolute inset-0 z-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />

        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse 120% 80% at 50% 120%, ${color}15 0%, transparent 60%)`,
          }}
        />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (pokemon.id) toggleCaught(pokemon.id);
          }}
          className={cn(
            'absolute bottom-2 left-2 z-20 flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full border shadow-lg transition-all duration-400 hover:scale-110 active:scale-95 sm:bottom-3 sm:left-3 sm:min-h-[40px] sm:min-w-[40px]',
            caught
              ? 'border-primary/60 bg-primary text-white shadow-[0_4px_20px_-4px_rgba(227,53,13,0.6)]'
              : 'border-border/60 bg-background/75 text-foreground/70 backdrop-blur-md hover:bg-muted/70 hover:text-foreground/90'
          )}
          aria-label={caught ? t('card.caught') : t('card.mark_caught')}
        >
          <PokeballIcon className={cn('h-4 w-4 sm:h-5 sm:w-5', caught ? 'text-white' : 'text-foreground/50')} />
        </button>

        <div
          className="pointer-events-none absolute -right-20 -top-20 z-0 h-48 w-48 rounded-full blur-[90px] opacity-20 transition-all duration-700 group-hover:opacity-40"
          style={{
            backgroundColor: color,
            filter: 'blur(90px)',
          }}
        />

        <div
          className="pointer-events-none absolute -bottom-12 -left-12 z-0 h-36 w-36 rounded-full blur-[60px] opacity-0 transition-all duration-700 group-hover:opacity-25"
          style={{
            backgroundColor: color,
            filter: 'blur(60px)',
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1px ${color}30, 0 0 30px -10px ${color}40`,
          }}
        />

        <div className="relative z-10 mb-1 flex w-full flex-col gap-1 sm:mb-2 sm:gap-2">
          <div className="flex items-start justify-between">
            <span className="rounded-md bg-muted/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/70 sm:text-[11px]">
              #{pokemonId.toString().padStart(3, '0')}
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={toggleTeam}
                disabled={!isTeam && teamFull}
                aria-label={isTeam ? t('card.remove_team') : t('card.add_team')}
                className={cn(
                  'flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full border p-1.5 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 sm:min-h-[38px] sm:min-w-[38px] sm:p-2',
                  isTeam
                    ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.25)]'
                    : 'border-border/60 bg-background/70 text-foreground/70 hover:bg-muted/70 hover:text-foreground/90',
                  !isTeam && teamFull && 'cursor-not-allowed opacity-20'
                )}
              >
                {isTeam ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </button>

              <button
                type="button"
                onClick={toggleCompare}
                disabled={!isComp && compareFull}
                aria-label={isComp ? t('card.remove_compare') : t('card.add_compare')}
                className={cn(
                  'flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full border p-1.5 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 sm:min-h-[38px] sm:min-w-[38px] sm:p-2',
                  isComp
                    ? 'border-primary/30 bg-primary/20 text-primary shadow-[0_0_16px_rgba(227,53,13,0.25)]'
                    : 'border-border/60 bg-background/70 text-foreground/70 hover:bg-muted/70 hover:text-foreground/90',
                  !isComp && compareFull && 'cursor-not-allowed opacity-20'
                )}
              >
                <ArrowLeftRight className={cn('h-3 w-3 transition-transform', isComp && 'scale-110 rotate-12')} />
              </button>

              <button
                type="button"
                onClick={toggleFavorite}
                aria-label={isFav ? t('card.remove_favorite') : t('card.add_favorite')}
                className={cn(
                  'flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full border p-1.5 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 sm:min-h-[38px] sm:min-w-[38px] sm:p-2',
                  isFav
                    ? 'border-rose-500/30 bg-rose-500/20 text-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.25)]'
                    : 'border-border/60 bg-background/70 text-foreground/70 hover:bg-muted/70 hover:text-foreground/90'
                )}
              >
                <Heart className={cn('h-3.5 w-3.5 transition-all', isFav && 'fill-current scale-110')} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative mx-auto h-20 w-20 transition-transform duration-500 group-hover:scale-105 sm:h-32 sm:w-32">
          <div className="absolute inset-0 rounded-full" />
          <Image
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain filter drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-xl"
            priority={index === 0}
          />
        </div>

        <div className="relative z-10 mt-1 space-y-1 text-center sm:mt-4 sm:space-y-2">
          <h3 className="truncate px-1 text-xs font-bold uppercase tracking-wide text-foreground/85 transition-colors duration-300 group-hover:text-primary sm:text-lg">
            {displayName}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            {types.map((typeItem: PokemonCardType, i: number) => {
              const typeName = typeItem?.type?.name;
              if (!typeName) return null;
              return (
                <span
                  key={`${typeName}-${i}`}
                  className="rounded-md border px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[10px]"
                  style={{
                    backgroundColor: `${TYPE_COLORS[typeName] || '#A8A77A'}22`,
                    color: TYPE_COLORS[typeName] || '#A8A77A',
                    borderColor: `${TYPE_COLORS[typeName] || '#A8A77A'}35`,
                    boxShadow: `0 2px 8px -2px ${TYPE_COLORS[typeName] || '#A8A77A'}24`,
                  }}
                >
                  {t(`types.${typeName}`)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
