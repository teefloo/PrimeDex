'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { getPokemonDetail, getPokemonSpecies, getTypeRelations, getPokemonEncounters, getAbilityDetail } from '@/lib/api';
import { getRecommendedItems } from '@/lib/held-items';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, 
  ArrowLeft, 
  Ruler, 
  Weight, 
  Swords, 
  ShieldAlert,
  ShieldCheck,
  Zap,
  Star,
  Heart,
  Share,
  Volume2,
  Play,
  BrainCircuit,
  MapPin,
  Target,
  SearchX,
  Sparkles
} from 'lucide-react';
import { PokemonDetail, PokemonSpecies, PokemonEncounter, PokemonEncounterVersionDetail, PokemonEncounterDetail, TYPE_COLORS } from '@/types/pokemon';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrimeDexStore } from '@/store/primedex';
import { cn, formatId, formatName } from '@/lib/utils';
import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMounted } from '@/hooks/useMounted';

interface LocalizedGqlData {
  pokemon_v2_pokemonspeciesnames: { 
    name: string;
    pokemon_v2_language: { name: string };
  }[];
  pokemon_v2_pokemonspeciesflavortexts: { 
    flavor_text: string;
    pokemon_v2_language: { name: string };
  }[];
}

const EvolutionChain = dynamic(() => import('@/components/pokemon/EvolutionChain').then(m => m.EvolutionChain), {
  loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20" /></div>
});
const AdvancedInfo = dynamic(() => import('@/components/pokemon/AdvancedInfo').then(m => m.AdvancedInfo), {
  loading: () => <div className="h-40 animate-pulse bg-white/5 rounded-3xl" />
});
const PokemonBuilds = dynamic(() => import('@/components/pokemon/PokemonBuilds').then(m => m.PokemonBuilds), {
  loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20" /></div>
});
const HeightComparison = dynamic(() => import('@/components/pokemon/HeightComparison').then(m => m.HeightComparison), {
  loading: () => <div className="h-40 animate-pulse bg-white/5 rounded-3xl" />
});
const PokemonCards = dynamic(() => import('@/components/pokemon/PokemonCards').then(m => m.PokemonCards), {
  loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20" /></div>
});
const PokemonMoves = dynamic(() => import('@/components/pokemon/PokemonMoves').then(m => m.PokemonMoves), {
  loading: () => <div className="h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/20" /></div>
});

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from '@/lib/i18n';
import { getLocalizedPokemonData } from '@/lib/api';

import Image from 'next/image';

const POKE_COLORS: Record<string, string> = {
  black: '#2E2E2E', blue: '#3B82F6', brown: '#92400E', gray: '#6B7280',
  green: '#16A34A', pink: '#EC4899', purple: '#9333EA', red: '#DC2626',
  white: '#F9FAFB', yellow: '#EAB308'
};

interface PokemonDetailClientProps {
  initialPokemon: PokemonDetail;
  initialSpecies: PokemonSpecies | null;
  initialLocalized: LocalizedGqlData | null;
  initialEncounters: PokemonEncounter[];
}

export function PokemonDetailClient({ 
  initialPokemon, 
  initialSpecies, 
  initialLocalized, 
  initialEncounters 
}: PokemonDetailClientProps) {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const name = params?.name as string;
  const router = useRouter();
  const [showShiny, setShowShiny] = useState(false);
  const [playingCry, setPlayingCry] = useState<'latest' | 'legacy' | null>(null);
  const { isFavorite, addFavorite, removeFavorite, addToHistory, language, systemLanguage } = usePrimeDexStore();
  const mounted = useMounted();

  const resolvedLang = mounted 
    ? (language === 'auto' ? systemLanguage : language) 
    : i18n.language || 'en';

  const statLabels: Record<string, string> = {
    'hp': t('stats.hp_short'),
    'attack': t('stats.attack_short'),
    'defense': t('stats.defense_short'),
    'special-attack': t('stats.special_attack_short'),
    'special-defense': t('stats.special_defense_short'),
    'speed': t('stats.speed_short'),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['pokemon-full-detail', name, resolvedLang],
    queryFn: async () => {
      const langId = usePrimeDexStore.getState().getLanguageId();
      const [pokemon, species, localized] = await Promise.all([
        getPokemonDetail(name),
        getPokemonSpecies(name).catch(() => null),
        getLocalizedPokemonData(name, langId).catch(() => null)
      ]);
      
      const encounters = await getPokemonEncounters(pokemon.id).catch(() => []);
      
      return { pokemon, species, localized: localized as LocalizedGqlData | null, encounters };
    },
    initialData: () => {
      const fetchedLang = initialLocalized?.pokemon_v2_pokemonspeciesnames?.[0]?.pokemon_v2_language?.name;
      // If the localized language passed from server does not match our current client language,
      // return undefined so that React Query fetches fresh localized data while showing a loader
      const isMatching = !initialLocalized || fetchedLang === resolvedLang || (!fetchedLang && resolvedLang === 'en');

      if (isMatching) {
        return {
          pokemon: initialPokemon,
          species: initialSpecies,
          localized: initialLocalized as LocalizedGqlData | null,
          encounters: initialEncounters
        };
      }
      return undefined;
    },
    enabled: !!name,
  });

  const pokemon = data?.pokemon;
  const species = data?.species;
  const localized = data?.localized;
  const encounters = data?.encounters;

  // Add to history when pokemon data is loaded
  useEffect(() => {
    if (pokemon) {
      addToHistory({ id: pokemon.id, name: pokemon.name });
    }
  }, [pokemon, addToHistory]);

  // Fetch type relations for all types of the pokemon
  const typeRelationsQueries = useQueries({
    queries: (pokemon?.types || []).map(t => ({
      queryKey: ['typeRelations', t.type.name],
      queryFn: () => getTypeRelations(t.type.name),
      staleTime: 24 * 60 * 60 * 1000,
    }))
  });

  const abilityQueries = useQueries({
    queries: (pokemon?.abilities || []).map(a => ({
      queryKey: ['abilityDetail', a.ability.name],
      queryFn: () => getAbilityDetail(a.ability.name),
      staleTime: 24 * 60 * 60 * 1000,
    }))
  });

  const effectiveness = useMemo(() => {
    if (typeRelationsQueries.some(q => q.isLoading) || typeRelationsQueries.length === 0) return null;

    const relations = typeRelationsQueries.map(q => q.data?.damage_relations);
    const table: Record<string, number> = {};

    // Initialize table with 1x for all types
    Object.keys(TYPE_COLORS).forEach(type => {
      table[type] = 1;
    });

    relations.forEach(rel => {
      if (!rel) return;
      rel.double_damage_from.forEach(t => { table[t.name] *= 2; });
      rel.half_damage_from.forEach(t => { table[t.name] *= 0.5; });
      rel.no_damage_from.forEach(t => { table[t.name] *= 0; });
    });

    const weaknesses = Object.entries(table).filter(([, val]) => val > 1).sort((a, b) => b[1] - a[1]);
    const resistances = Object.entries(table).filter(([, val]) => val < 1 && val > 0).sort((a, b) => a[1] - b[1]);
    const immunities = Object.entries(table).filter(([, val]) => val === 0);

    return { weaknesses, resistances, immunities };
  }, [typeRelationsQueries]);

  if (isLoading || !pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  const isFav = pokemon ? isFavorite(pokemon.id) : false;
  const mainType = pokemon.types[0].type.name;
  const color = TYPE_COLORS[mainType] || '#A8A77A';

  const typeLabel = pokemon.types.map((typeItem) => t(`types.${typeItem.type.name}`)).join(' / ');

  const displayName = localized?.pokemon_v2_pokemonspeciesnames?.[0]?.name 
    || species?.names?.find(n => n.language.name === resolvedLang)?.name
    || species?.names?.find(n => n.language.name === 'en')?.name
    || pokemon.name;

  const flavorText = localized?.pokemon_v2_pokemonspeciesflavortexts?.[0]?.flavor_text?.replace(/\f/g, ' ')
    || species?.flavor_text_entries.find((entry) => entry.language.name === resolvedLang)?.flavor_text.replace(/\f/g, ' ')
    || species?.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ');

  const genus = species?.genera.find(
    (g) => g.language.name === resolvedLang
  )?.genus || species?.genera.find(
    (g) => g.language.name === 'en'
  )?.genus;

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  const artwork = showShiny 
    ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny)
    : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);

  const playCry = (type: 'latest' | 'legacy') => {
    if (!pokemon?.cries?.[type]) return;
    setPlayingCry(type);
    const audio = new Audio(pokemon.cries[type]);
    audio.onended = () => setPlayingCry(null);
    audio.play().catch(console.error);
  };

  const handleShare = async () => {
    const title = t('detail.share_title', { name: displayName });
    const text = t('detail.share_text', { name: displayName });
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Ignore user cancellation
      }
    } else {
      navigator.clipboard.writeText(url);
      toast(t('detail.copied'));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-25 z-0">
        <div
          className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[140px] mix-blend-screen animate-pulse-glow"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] mix-blend-screen opacity-40"
          style={{ backgroundColor: color, animationDelay: '-2s' }}
        />
        <div
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] rounded-full blur-[100px] mix-blend-screen opacity-15"
          style={{ backgroundColor: color, animationDelay: '-4s' }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-[50vh] w-full flex flex-col items-center justify-end pb-16 pt-28">
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-6 md:left-12 p-3 bg-white/[0.04] backdrop-blur-2xl rounded-full border border-white/[0.06] z-30 text-foreground/50 hover:text-foreground hover:bg-white/[0.08] hover:border-white/[0.12] hover:scale-105 transition-all duration-300 shadow-lg"
          aria-label={t('common.back') || 'Go back'}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="absolute top-8 right-6 md:right-12 z-30 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/quiz?pokemon=${pokemon.name}`)}
            className="rounded-full transition-all h-12 w-12 bg-white/[0.04] border-white/[0.06] text-foreground/60 hover:bg-purple-500/15 hover:text-purple-400 hover:border-purple-500/30 backdrop-blur-xl"
            title={t('detail.test_knowledge')}
            aria-label={t('detail.test_knowledge_aria', { name: displayName })}
          >
            <BrainCircuit className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="rounded-full transition-all h-12 w-12 bg-white/[0.04] border-white/[0.06] text-foreground/60 hover:bg-white/[0.08] hover:border-white/[0.12] backdrop-blur-xl"
            title={t('detail.share')}
            aria-label={t('detail.share') || 'Share this Pokémon'}
          >
            <Share className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShiny(!showShiny)}
            className={cn(
              "rounded-full gap-2 font-black uppercase tracking-widest text-[10px] transition-all h-12 px-5",
              showShiny 
                ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-[0_4px_16px_-4px_rgba(234,179,8,0.3)]" 
                : "bg-white/[0.04] border-white/[0.06] text-foreground/50 backdrop-blur-xl"
            )}
            title={t('detail.shiny')}
            aria-label={showShiny ? t('detail.show_normal') || 'Show normal version' : t('detail.show_shiny') || 'Show shiny version'}
          >
            <Star className={cn("w-3.5 h-3.5", showShiny && "fill-current")} />
            {t('detail.shiny')}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => isFav ? removeFavorite(pokemon.id) : addFavorite(pokemon.id)}
            className={cn(
              "rounded-full transition-all h-12 w-12",
              isFav 
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 shadow-[0_4px_16px_-4px_rgba(244,63,94,0.3)]" 
                : "bg-white/[0.04] border-white/[0.06] text-foreground/40 hover:text-rose-400/60 backdrop-blur-xl"
            )}
            title={isFav ? t('card.remove_favorite') : t('card.add_favorite')}
            aria-label={isFav ? t('card.remove_favorite') || 'Remove from favorites' : t('card.add_favorite') || 'Add to favorites'}
          >
            <Heart className={cn("w-5 h-5 transition-transform", isFav && "fill-current scale-110")} />
          </Button>
        </div>

        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[18rem] font-black opacity-5 tracking-tighter select-none z-0"
          style={{ color }}
        >
          {formatId(pokemon.id)}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showShiny ? 'shiny' : 'normal'}
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-72 h-72 md:w-96 md:h-96 z-20 group"
          >
            <div 
              className="absolute inset-0 rounded-full blur-[60px] opacity-40 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
              style={{ backgroundColor: color }}
            />
            <Image
              src={artwork}
              alt={t('detail.artwork_alt', { name: displayName }) || `Official artwork of ${displayName}`}
              width={400}
              height={400}
              sizes="(min-width: 768px) 384px, 288px"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-4"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-30 max-w-6xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black text-foreground capitalize mb-4 tracking-tight drop-shadow-sm">
            {displayName}
          </h1>

          {species && (
            <div className="flex flex-col items-center gap-2 mb-8">
              {genus && <p className="text-sm md:text-base text-foreground/60 font-bold uppercase tracking-[0.2em]">{genus}</p>}
              <div className="flex gap-2 flex-wrap justify-center">
                {species.habitat ? (
                  <p className="text-xs text-foreground/40 font-semibold uppercase tracking-widest bg-secondary/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{t(`habitats.${species.habitat.name}`)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-foreground/40 font-semibold uppercase tracking-widest bg-secondary/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{t('detail.unknown_habitat')}</span>
                  </p>
                )}
                {species.color && POKE_COLORS[species.color.name] && (
                  <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold uppercase tracking-widest bg-secondary/40 px-3 py-1 rounded-full border border-white/5">
                    <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: POKE_COLORS[species.color.name] }} />
                    <span>{t(`colors.${species.color.name}`)}</span>
                  </div>
                )}
                {species.is_legendary && (
                  <p className="text-xs text-yellow-500 font-black uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                    {t('detail.legendary')}
                  </p>
                )}
                {species.is_mythical && (
                  <p className="text-xs text-purple-500 font-black uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                    {t('detail.mythical')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            {pokemon.types.map((typeItem) => (
              <span
                key={typeItem.type.name}
                className="glass-tag px-6 py-2 text-sm shadow-lg"
                style={{ 
                  backgroundColor: `${TYPE_COLORS[typeItem.type.name]}dd`,
                  borderColor: TYPE_COLORS[typeItem.type.name]
                }}
              >
                {t(`types.${typeItem.type.name}`)}
              </span>
            ))}
          </div>

          {/* Cries / Audio */}
          {pokemon.cries && (pokemon.cries.latest || pokemon.cries.legacy) && (
            <div className="flex gap-4 justify-center mt-6">
              {pokemon.cries.latest && (
                <Button 
                  variant="outline" 
                   aria-label={t('detail.cry_latest_aria') || 'Play latest cry'}
                  onClick={() => playCry('latest')}
                  className={cn("rounded-full gap-2 transition-all", playingCry === 'latest' && "border-primary text-primary bg-primary/10")}
                >
                  {playingCry === 'latest' ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />} {t('detail.cry_latest')}
                </Button>
              )}
              {pokemon.cries.legacy && (
                <Button 
                  variant="outline" 
                  aria-label={t('detail.cry_legacy_aria') || 'Play legacy cry'}
                  onClick={() => playCry('legacy')}
                  className={cn("rounded-full gap-2 transition-all", playingCry === 'legacy' && "border-primary text-primary bg-primary/10")}
                >
                  {playingCry === 'legacy' ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />} {t('detail.cry_legacy')}
                </Button>
              )}
            </div>
          )}

        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 mb-8 h-auto md:h-14 rounded-2xl bg-secondary/30 p-1 border border-white/5 gap-1">
              <TabsTrigger value="about" aria-label={t('detail.about')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.about')}</TabsTrigger>
              <TabsTrigger value="stats" aria-label={t('detail.stats')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.stats')}</TabsTrigger>
              <TabsTrigger value="moves" aria-label={t('detail.moveset')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.moveset')}</TabsTrigger>
              <TabsTrigger value="evolution" aria-label={t('detail.evolution')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.evolution')}</TabsTrigger>
              <TabsTrigger value="locations" aria-label={t('detail.where_to_find')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.where_to_find')}</TabsTrigger>
              <TabsTrigger value="builds" aria-label={t('detail.builds')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.builds')}</TabsTrigger>
              <TabsTrigger value="infos" aria-label={t('detail.infos')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.infos')}</TabsTrigger>
              <TabsTrigger value="cards" aria-label={t('detail.cards')} className="rounded-xl font-bold uppercase tracking-wider text-[9px] md:text-xs py-2 md:py-0">{t('detail.cards')}</TabsTrigger>
            </TabsList>
            
            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <h2 className="text-xl font-black mb-4 text-foreground/90 border-b border-white/10 pb-4">{t('detail.entry')}</h2>
                {!species ? (
                  <div className="h-24 animate-pulse bg-white/5 rounded-2xl" />
                ) : (
                  <p className="text-base text-foreground/70 leading-relaxed font-medium">
                    {flavorText || t('detail.no_description')}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-secondary/30 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-secondary/50 transition-colors">
                    <Weight className="w-5 h-5 text-foreground/40 mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-widest mb-1">{t('detail.weight')}</p>
                    <p className="text-lg font-black text-foreground/90">{pokemon.weight / 10} kg</p>
                  </div>
                  <div className="bg-secondary/30 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-secondary/50 transition-colors">
                    <Ruler className="w-5 h-5 text-foreground/40 mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-widest mb-1">{t('detail.height')}</p>
                    <p className="text-lg font-black text-foreground/90">{pokemon.height / 10} m</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> {t('detail.abilities')}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {pokemon.abilities.map((a, idx) => {
                      const abilityData = abilityQueries[idx]?.data;
                      let description = t('detail.no_ability_desc');
                      let localizedName = formatName(a.ability.name);
                      if (abilityData) {
                        // Localized ability name
                        const nameEntry = abilityData.names.find(n => n.language.name === resolvedLang)
                                       || abilityData.names.find(n => n.language.name === 'en');
                        if (nameEntry) localizedName = nameEntry.name;

                        // Localized description — find all available for resolvedLang and fallback to en
                        const langEffect = abilityData.effect_entries.find(e => e.language.name === resolvedLang);
                        const langFlavor = abilityData.flavor_text_entries.find(e => e.language.name === resolvedLang);
                        const enEffect = abilityData.effect_entries.find(e => e.language.name === 'en');
                        const enFlavor = abilityData.flavor_text_entries.find(e => e.language.name === 'en');
                        
                        // Priority: Lang Effect > Lang Flavor > En Effect > En Flavor
                        description = langEffect?.short_effect 
                                   || langFlavor?.flavor_text 
                                   || langEffect?.effect 
                                   || enEffect?.short_effect 
                                   || enFlavor?.flavor_text 
                                   || enEffect?.effect 
                                   || description;
                      }

                      return (
                        <div key={a.ability.name} className="flex flex-col gap-2 p-4 bg-secondary/20 border border-white/5 rounded-2xl group hover:bg-secondary/40 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-foreground/80 group-hover:text-primary transition-colors">{localizedName}</span>
                              {a.is_hidden && <span className="px-1.5 py-0.5 bg-primary/20 text-[9px] font-black text-primary uppercase tracking-tighter rounded">{t('detail.hidden')}</span>}
                            </div>
                            {abilityQueries[idx]?.isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary/50" />}
                          </div>
                          <p className="text-xs text-foreground/60 leading-relaxed">
                            {description.replace(/\n|\f/g, ' ')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> {t('detail.recommended_items')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const items = getRecommendedItems(pokemon);
                      if (!items.length) {
                        return <div className="col-span-full p-4 text-center text-xs text-foreground/50 bg-secondary/20 rounded-2xl border border-white/5">{t('detail.no_items')}</div>;
                      }
                      return items.map(item => (
                        <div key={item.id} className="flex gap-3 p-4 bg-secondary/20 border border-white/5 rounded-2xl group hover:bg-secondary/40 transition-colors">
                          <div className="flex-shrink-0 w-12 h-12 bg-background/50 rounded-xl flex items-center justify-center p-2 border border-white/5">
                            {/* Using native img for external raw.githubusercontent.com domain to avoid next/image domain config issues */}
                            <img src={item.iconUrl} alt={item.name[language as 'en' | 'fr'] || item.name.en} className="w-full h-full object-contain filter group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <span className="font-black text-sm text-foreground/90 truncate group-hover:text-primary transition-colors">
                              {item.name[language as 'en' | 'fr'] || item.name.en}
                            </span>
                            <span className="text-[10px] text-foreground/60 leading-tight mt-1 line-clamp-2">
                              {item.description[language as 'en' | 'fr'] || item.description.en}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {species && <AdvancedInfo pokemon={pokemon} species={species} />}

              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <HeightComparison 
                  pokemonHeight={pokemon.height} 
                  pokemonName={displayName} 
                  pokemonImage={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                />
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                  <h3 className="text-2xl font-black text-foreground/90 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Swords className="w-6 h-6 text-primary" />
                    </div>
                    {t('detail.combat_stats')}
                  </h3>
                  <div className="text-right">
                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-1">{t('detail.total')}</p>
                    <span className="text-xl font-black text-foreground/90">{totalStats}</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {pokemon.stats.map((s) => (
                    <div key={s.stat.name} className="flex items-center gap-4 group">
                      <span className="w-16 font-bold uppercase text-foreground/50 text-xs tracking-wider group-hover:text-foreground/80 transition-colors">
                        {statLabels[s.stat.name] || s.stat.name}
                      </span>
                      <span className="w-10 font-black text-right text-foreground/90 tabular-nums">
                        {s.base_stat}
                      </span>
                      <div className="flex-1 h-3.5 rounded-full bg-secondary/50 overflow-hidden border border-white/5 relative">
                        <div className="absolute inset-0 bg-black/10 shadow-inner" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((s.base_stat / 255) * 100, 100)}%` }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                          className="h-full rounded-full relative"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}, inset 0 0 5px rgba(255,255,255,0.5)`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <h3 className="text-2xl font-black text-foreground/90 flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  {t('detail.defensive_coverage')}
                </h3>

                {!effectiveness ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {effectiveness.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 mb-4 flex items-center gap-2">
                          <ShieldAlert className="w-3 h-3" /> {t('detail.receives_double')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {effectiveness.weaknesses.map(([type, multiplier]) => (
                            <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-secondary/20">
                              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{t(`types.${type}`)}</span>
                              <span className="text-[9px] font-black opacity-40">x{multiplier}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {effectiveness.resistances.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/60 mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" /> {t('detail.resists_damage')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {effectiveness.resistances.map(([type, multiplier]) => (
                            <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-secondary/20">
                              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{t(`types.${type}`)}</span>
                              <span className="text-[9px] font-black opacity-40">x{multiplier}</span>
                            </div>
                          ))}
                          {effectiveness.immunities.map(([type]) => (
                            <div key={type} className="flex items-center justify-between p-2 rounded-xl bg-background/40 border border-blue-500/20">
                              <span className="text-[10px] font-bold uppercase truncate" style={{ color: TYPE_COLORS[type] }}>{t(`types.${type}`)}</span>
                              <span className="text-[9px] font-black text-blue-400">{t('detail.immune')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {effectiveness.immunities.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 mb-4 flex items-center gap-2">
                          <Zap className="w-3 h-3" /> {t('detail.immunities')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {effectiveness.immunities.map(([type]) => (
                            <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-secondary/20">
                              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{t(`types.${type}`)}</span>
                              <span className="text-[9px] font-black opacity-40">x0</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Moves Tab */}
            <TabsContent value="moves" className="space-y-6">
              <PokemonMoves pokemonName={pokemon.name} />
            </TabsContent>

            {/* Evolution Tab */}
            <TabsContent value="evolution" className="space-y-6">
              {species?.evolution_chain?.url ? (
                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                  <h3 className="text-xl font-black mb-8 text-foreground/90 border-b border-white/10 pb-4 text-center">{t('detail.evolution_chain')}</h3>
                  <EvolutionChain url={species.evolution_chain.url} speciesName={name} />
                </div>
              ) : (
                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] flex items-center justify-center min-h-[200px]">
                  <p className="text-foreground/50 font-bold uppercase tracking-widest text-sm">{t('detail.no_evolution')}</p>
                </div>
              )}
            </TabsContent>

            {/* Builds Tab */}
            <TabsContent value="builds" className="space-y-6">
              <PokemonBuilds pokemon={pokemon} />
            </TabsContent>

            {/* Infos Tab (Educational) */}
            <TabsContent value="infos" className="space-y-6">
              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <h3 className="text-2xl font-black mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <BrainCircuit className="w-6 h-6 text-purple-500" />
                  </div>
                  {t('detail.battle_guide')}
                </h3>

                <div className="space-y-8">
                  <div className="bg-secondary/20 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60 mb-4 flex items-center gap-2">
                      <Swords className="w-4 h-4 text-primary" /> {t('detail.suggested_role')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ? pokemon.stats.find(s => s.stat.name === 'speed')!.base_stat > 100 && (
                        <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                          <p className="text-xs font-black text-primary uppercase mb-1">{t('detail.roles.fast_sweeper.title')}</p>
                          <p className="text-[11px] text-foreground/50 leading-relaxed">{t('detail.roles.fast_sweeper.desc')}</p>
                        </div>
                      ) : null}
                      {((pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0) > 100 || (pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0) > 100) && (
                        <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                          <p className="text-xs font-black text-red-500 uppercase mb-1">{t('detail.roles.wall_breaker.title')}</p>
                          <p className="text-[11px] text-foreground/50 leading-relaxed">{t('detail.roles.wall_breaker.desc')}</p>
                        </div>
                      )}
                      {((pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0) > 100 || (pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0) > 100) && (
                        <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                          <p className="text-xs font-black text-blue-500 uppercase mb-1">{t('detail.roles.tank.title')}</p>
                          <p className="text-[11px] text-foreground/50 leading-relaxed">{t('detail.roles.tank.desc')}</p>
                        </div>
                      )}
                      <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                        <p className="text-xs font-black text-green-500 uppercase mb-1">{t('detail.roles.strategic.title')}</p>
                        <p className="text-[11px] text-foreground/50 leading-relaxed">{t('detail.roles.strategic.desc')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60 mb-6 flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" /> {t('detail.type_matchups')}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Weaknesses */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 flex items-center gap-2">
                          <ShieldAlert className="w-3 h-3" /> {t('detail.receives_double')}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {effectiveness?.weaknesses.map(([type, mult]) => (
                            <div key={type} className="flex items-center justify-between p-2 rounded-xl bg-background/40 border border-white/5">
                              <span className="text-[10px] font-bold uppercase truncate" style={{ color: TYPE_COLORS[type] }}>{t(`types.${type}`)}</span>
                              <span className="text-[9px] font-black opacity-40">x{mult}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resistances */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/60 flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" /> {t('detail.resists_damage')}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {effectiveness?.resistances.map(([type, mult]) => (
                            <div key={type} className="flex items-center justify-between p-2 rounded-xl bg-background/40 border border-white/5">
                              <span className="text-[10px] font-bold uppercase truncate" style={{ color: TYPE_COLORS[type] }}>{t(`types.${type}`)}</span>
                              <span className="text-[9px] font-black opacity-40">x{mult}</span>
                            </div>
                          ))}
                          {effectiveness?.immunities.map(([type]) => (
                            <div key={type} className="flex items-center justify-between p-2 rounded-xl bg-background/40 border border-blue-500/20">
                              <span className="text-[10px] font-bold uppercase truncate" style={{ color: TYPE_COLORS[type] }}>{t(`types.${type}`)}</span>
                              <span className="text-[9px] font-black text-blue-400">{t('detail.immune')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" /> {t('detail.type_synergy')}
                    </h4>
                    <p className="text-xs text-foreground/50 leading-relaxed mb-4">
                      {t('detail.type_synergy_desc', { name: displayName, types: typeLabel })}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">{t('detail.offensive_tips')}</p>
                        <ul className="space-y-2">
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{t('detail.offensive_tip_1')}</span>
                          </li>
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{t('detail.offensive_tip_2')}</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">{t('detail.defensive_tips')}</p>
                        <ul className="space-y-2">
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{t('detail.defensive_tip_1')}</span>
                          </li>
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{t('detail.defensive_tip_2')}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Moves Tab */}
            <TabsContent value="moves" className="space-y-6">
              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <h3 className="text-2xl font-black text-foreground/90 flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  {t('detail.moveset')}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {/* Categorize moves by learn method */}
                  {['level-up', 'machine', 'egg', 'tutor'].map((method) => {
                    const methodMoves = pokemon.moves.filter(m => 
                      m.version_group_details.some(d => d.move_learn_method.name === method)
                    ).sort((a, b) => {
                      const levelA = a.version_group_details.find(d => d.move_learn_method.name === method)?.level_learned_at || 0;
                      const levelB = b.version_group_details.find(d => d.move_learn_method.name === method)?.level_learned_at || 0;
                      return levelA - levelB;
                    });

                    if (methodMoves.length === 0) return null;

                    return (
                      <div key={method} className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mt-4 mb-2">
                          {method === 'level-up' ? t('detail.move_method.level_up') : method === 'machine' ? t('detail.move_method.machine') : method === 'egg' ? t('detail.move_method.egg') : t('detail.move_method.tutor')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {methodMoves.map((m) => (
                            <div key={m.move.name} className="flex items-center justify-between p-4 bg-secondary/20 border border-white/5 rounded-2xl group hover:border-primary/30 transition-all">
                              <div className="flex flex-col gap-1">
                                <span className="font-black text-sm text-foreground/80 capitalize">
                                  {formatName(m.move.name)}
                                </span>
                                {method === 'level-up' && (
                                  <span className="text-[10px] font-bold text-primary/60">
                                    {t('detail.level', { level: m.version_group_details.find(d => d.move_learn_method.name === method)?.level_learned_at || 1 })}
                                  </span>
                                )}
                              </div>
                              <div className="p-1.5 bg-primary/10 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity">
                                <Target className="w-3.5 h-3.5 text-primary" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-6">
              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <h3 className="text-2xl font-black text-foreground/90 flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <MapPin className="w-6 h-6 text-green-500" />
                  </div>
                  {t('detail.where_to_find')}
                </h3>

                {encounters && encounters.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {encounters.map((enc: PokemonEncounter, i: number) => (
                      <div key={i} className="p-6 bg-secondary/20 border border-white/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background/40 rounded-xl">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-black text-base text-foreground/80 capitalize">
                            {formatName(enc.location_area.name)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {enc.version_details.map((vd: PokemonEncounterVersionDetail, vi: number) => (
                            <div key={vi} className="p-4 bg-background/40 rounded-2xl border border-white/5 flex flex-col gap-2">
                              <div className="flex items-center mb-1">
                                <span className="text-[10px] font-black uppercase text-primary/60">{formatName(vd.version.name)}</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                {(() => {
                                  // Group encounter details by method
                                  const groupedDetails: Record<string, PokemonEncounterDetail> = {};
                                  vd.encounter_details.forEach((ed: PokemonEncounterDetail) => {
                                    const methodName = ed.method.name;
                                    if (!groupedDetails[methodName]) {
                                      groupedDetails[methodName] = {
                                        method: ed.method,
                                        chance: 0,
                                        min_level: ed.min_level,
                                        max_level: ed.max_level,
                                        condition_values: [...(ed.condition_values || [])]
                                      };
                                    }
                                    groupedDetails[methodName].chance += ed.chance;
                                    groupedDetails[methodName].min_level = Math.min(groupedDetails[methodName].min_level, ed.min_level);
                                    groupedDetails[methodName].max_level = Math.max(groupedDetails[methodName].max_level, ed.max_level);
                                    // Add unique condition values
                                    (ed.condition_values || []).forEach((c) => {
                                      if (!groupedDetails[methodName].condition_values.find((cv) => cv.name === c.name)) {
                                        groupedDetails[methodName].condition_values.push(c);
                                      }
                                    });
                                  });

                                  return Object.values(groupedDetails).map((gd: PokemonEncounterDetail, ei: number) => (
                                    <div key={ei} className="flex flex-col gap-1 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-foreground/70 capitalize">{formatName(gd.method.name)}</span>
                                        <span className="font-black text-foreground/90">{gd.chance}%</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex-1 h-1.5 rounded-full bg-secondary/50 overflow-hidden border border-white/5">
                                          <div
                                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${Math.min(gd.chance, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                      <div className="text-[10px] text-foreground/50">
                                        Lv. {gd.min_level}{gd.min_level !== gd.max_level ? ` - ${gd.max_level}` : ''}
                                      </div>
                                      {gd.condition_values && gd.condition_values.length > 0 && (
                                        <div className="text-[9px] text-primary/70 uppercase">
                                          {gd.condition_values.map((c) => formatName(c.name)).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-secondary/30 rounded-full mb-4">
                      <SearchX className="w-10 h-10 text-foreground/20" />
                    </div>
                    <p className="text-foreground/50 font-bold uppercase tracking-widest text-sm">{t('detail.no_location')}</p>
                    <p className="text-[10px] text-foreground/30 mt-2 max-w-xs uppercase">{t('detail.no_location_desc')}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Cards Tab */}
            <TabsContent value="cards" className="space-y-6">
              <PokemonCards name={pokemon.name} localizedName={displayName} lang={resolvedLang} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
