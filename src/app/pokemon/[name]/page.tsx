'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { getPokemonDetail, getPokemonSpecies, getTypeRelations } from '@/lib/api';
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
  BrainCircuit
} from 'lucide-react';
import { TYPE_COLORS } from '@/types/pokemon';
import { motion, AnimatePresence } from 'framer-motion';
import { usePokedexStore } from '@/store/pokedex';
import { cn, formatId } from '@/lib/utils';
import React, { useState, useMemo, useEffect } from 'react';
import { EvolutionChain } from '@/components/pokemon/EvolutionChain';
import { AdvancedInfo } from '@/components/pokemon/AdvancedInfo';
import { PokemonBuilds } from '@/components/pokemon/PokemonBuilds';
import { Button } from '@/components/ui/button';
import { HeightComparison } from '@/components/pokemon/HeightComparison';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from 'react-i18next';
import { getLocalizedPokemonData } from '@/lib/api';

import Image from 'next/image';

const STAT_LABELS: Record<string, string> = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  'speed': 'SPD',
};

const HABITATS: Record<string, string> = {
  cave: '🗿', forest: '🌲', grassland: '🌿', mountain: '🏔️',
  rare: '⭐', 'rough-terrain': '🪨', sea: '🌊', urban: '🏙️', 'waters-edge': '🏞️'
};

const POKE_COLORS: Record<string, string> = {
  black: '#2E2E2E', blue: '#3B82F6', brown: '#92400E', gray: '#6B7280',
  green: '#16A34A', pink: '#EC4899', purple: '#9333EA', red: '#DC2626',
  white: '#F9FAFB', yellow: '#EAB308'
};

interface LocalizedGqlData {
  pokemon_v2_pokemonspeciesnames: { name: string }[];
  pokemon_v2_pokemonspeciesflavortexts: { flavor_text: string }[];
}

export default function PokemonDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const name = params?.name as string;
  const router = useRouter();
  const [showShiny, setShowShiny] = useState(false);
  const [playingCry, setPlayingCry] = useState<'latest' | 'legacy' | null>(null);
  const { isFavorite, addFavorite, removeFavorite, addToHistory, language, systemLanguage } = usePokedexStore();

  const { data, isLoading } = useQuery({
    queryKey: ['pokemon-full-detail', name],
    queryFn: async () => {
      const langId = usePokedexStore.getState().getLanguageId();
      const [pokemon, species, localized] = await Promise.all([
        getPokemonDetail(name),
        getPokemonSpecies(name).catch(() => null),
        getLocalizedPokemonData(name, langId).catch(() => null)
      ]);
      return { pokemon, species, localized: localized as LocalizedGqlData | null };
    },
    enabled: !!name,
  });

  const pokemon = data?.pokemon;
  const species = data?.species;
  const localized = data?.localized;

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

  const resolvedLang = language === 'auto' ? systemLanguage : language;

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

  const statMax = 255;
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
    const title = `Pokédex – ${displayName}`;
    const text = `Découvre ${displayName} sur le Pokédex !`;
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
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] mix-blend-screen"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] mix-blend-screen opacity-50"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-[50vh] w-full flex flex-col items-center justify-end pb-16 pt-28">
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-6 md:left-12 p-3 bg-secondary/30 backdrop-blur-md rounded-full border border-white/10 z-30 text-foreground/70 hover:text-foreground hover:bg-white/10 hover:scale-105 transition-all"
          aria-label={t('common.back') || 'Go back'}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="absolute top-8 right-6 md:right-12 z-30 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="rounded-full transition-all h-12 w-12 bg-secondary/30 border-white/10 text-foreground/80 hover:bg-secondary/50"
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
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-600 dark:text-yellow-400" 
                : "bg-secondary/30 border-white/10 text-foreground/60"
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
                ? "bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30" 
                : "bg-secondary/30 border-white/10 text-foreground/40 hover:text-red-500/60"
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
              alt={displayName}
              width={400}
              height={400}
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
                    <span>{HABITATS[species.habitat.name] || '🌍'}</span> {species.habitat.name}
                  </p>
                ) : (
                  <p className="text-xs text-foreground/40 font-semibold uppercase tracking-widest bg-secondary/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                    <span>🌍</span> {t('detail.unknown_habitat')}
                  </p>
                )}
                {species.color && POKE_COLORS[species.color.name] && (
                  <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold uppercase tracking-widest bg-secondary/40 px-3 py-1 rounded-full border border-white/5">
                    <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: POKE_COLORS[species.color.name] }} />
                    <span>{species.color.name}</span>
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
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className="glass-tag px-6 py-2 text-sm shadow-lg"
                style={{ 
                  backgroundColor: `${TYPE_COLORS[t.type.name]}dd`,
                  borderColor: TYPE_COLORS[t.type.name]
                }}
              >
                {t.type.name}
              </span>
            ))}
          </div>

          {/* Cries / Audio */}
          {pokemon.cries && (pokemon.cries.latest || pokemon.cries.legacy) && (
            <div className="flex gap-4 justify-center mt-6">
              {pokemon.cries.latest && (
                <Button 
                  variant="outline" 
                  onClick={() => playCry('latest')}
                  className={cn("rounded-full gap-2 transition-all", playingCry === 'latest' && "border-primary text-primary bg-primary/10")}
                >
                  {playingCry === 'latest' ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />} 🔊 {t('detail.cry_latest')}
                </Button>
              )}
              {pokemon.cries.legacy && (
                <Button 
                  variant="outline" 
                  onClick={() => playCry('legacy')}
                  className={cn("rounded-full gap-2 transition-all", playingCry === 'legacy' && "border-primary text-primary bg-primary/10")}
                >
                  {playingCry === 'legacy' ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />} 🔊 {t('detail.cry_legacy')}
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
            <TabsList className="grid w-full grid-cols-5 mb-8 h-14 rounded-2xl bg-secondary/30 p-1 border border-white/5">
              <TabsTrigger value="about" className="rounded-xl font-bold uppercase tracking-wider text-[10px] md:text-xs">{t('detail.about')}</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl font-bold uppercase tracking-wider text-[10px] md:text-xs">{t('detail.stats')}</TabsTrigger>
              <TabsTrigger value="evolution" className="rounded-xl font-bold uppercase tracking-wider text-[10px] md:text-xs">{t('detail.evolution')}</TabsTrigger>
              <TabsTrigger value="builds" className="rounded-xl font-bold uppercase tracking-wider text-[10px] md:text-xs">Builds</TabsTrigger>
              <TabsTrigger value="infos" className="rounded-xl font-bold uppercase tracking-wider text-[10px] md:text-xs">{t('detail.infos') || 'Infos'}</TabsTrigger>
            </TabsList>
            
            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                <h3 className="text-xl font-black mb-4 text-foreground/90 border-b border-white/10 pb-4">{t('detail.entry')}</h3>
                {!species ? (
                  <div className="h-24 animate-pulse bg-white/5 rounded-2xl" />
                ) : (
                  <p className="text-base text-foreground/70 leading-relaxed font-medium">
                    {flavorText || "No description available."}
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
                        {STAT_LABELS[s.stat.name] || s.stat.name}
                      </span>
                      <span className="w-10 font-black text-right text-foreground/90 tabular-nums">
                        {s.base_stat}
                      </span>
                      <div className="flex-1 h-3.5 rounded-full bg-secondary/50 overflow-hidden border border-white/5 relative">
                        <div className="absolute inset-0 bg-black/10 shadow-inner" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((s.base_stat / statMax) * 100, 100)}%` }}
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
                          <ShieldAlert className="w-3 h-3" /> {t('detail.weaknesses')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {effectiveness.weaknesses.map(([type, multiplier]) => (
                            <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-secondary/20">
                              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{type}</span>
                              <span className="text-[9px] font-black opacity-40">x{multiplier}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {effectiveness.resistances.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/60 mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" /> {t('detail.resistances')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {effectiveness.resistances.map(([type, multiplier]) => (
                            <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-secondary/20">
                              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{type}</span>
                              <span className="text-[9px] font-black opacity-40">x{multiplier}</span>
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
                              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: TYPE_COLORS[type] }}>{type}</span>
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

            {/* Evolution Tab */}
            <TabsContent value="evolution" className="space-y-6">
              {species?.evolution_chain?.url ? (
                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                  <h3 className="text-xl font-black mb-8 text-foreground/90 border-b border-white/10 pb-4 text-center">{t('detail.evolution_chain')}</h3>
                  <EvolutionChain url={species.evolution_chain.url} />
                </div>
              ) : (
                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] flex items-center justify-center min-h-[200px]">
                  <p className="text-foreground/50 font-bold uppercase tracking-widest text-sm">{t('detail.no_evolution')}</p>
                </div>
              )}
              
              {pokemon.moves.length > 0 && (
                <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-xl font-black text-foreground/90">{t('detail.main_moves')}</h3>
                    <span className="px-2 py-1 bg-secondary/50 rounded-md text-xs font-bold text-foreground/60">{pokemon.moves.length} total</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pokemon.moves.slice(0, 8).map((m) => (
                      <div key={m.move.name} className="flex items-center justify-between p-4 bg-secondary/20 border border-white/5 rounded-2xl group hover:border-primary/30 transition-all">
                        <span className="font-black text-sm text-foreground/80 capitalize">
                          {m.move.name.replace('-', ' ')}
                        </span>
                        <div className="p-1.5 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
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
                  {t('detail.battle_guide') || 'Battle Guide'}
                </h3>

                <div className="space-y-8">
                  <div className="bg-secondary/20 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60 mb-4 flex items-center gap-2">
                      <Swords className="w-4 h-4 text-primary" /> {t('detail.suggested_role') || 'Potential Roles'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ? pokemon.stats.find(s => s.stat.name === 'speed')!.base_stat > 100 && (
                        <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                          <p className="text-xs font-black text-primary uppercase mb-1">Fast Sweeper</p>
                          <p className="text-[11px] text-foreground/50 leading-relaxed">Its high speed allows it to attack first and potentially KO opponents before they can react.</p>
                        </div>
                      ) : null}
                      {((pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0) > 100 || (pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0) > 100) && (
                        <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                          <p className="text-xs font-black text-red-500 uppercase mb-1">Wall Breaker</p>
                          <p className="text-[11px] text-foreground/50 leading-relaxed">Possesses massive offensive power capable of punching holes through defensive teams.</p>
                        </div>
                      )}
                      {((pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0) > 100 || (pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0) > 100) && (
                        <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                          <p className="text-xs font-black text-blue-500 uppercase mb-1">Tank / Wall</p>
                          <p className="text-[11px] text-foreground/50 leading-relaxed">High defensive stats make it excellent for soaking up hits and stalling the opponent.</p>
                        </div>
                      )}
                      <div className="p-4 bg-background/40 rounded-2xl border border-white/5">
                        <p className="text-xs font-black text-green-500 uppercase mb-1">Strategic Use</p>
                        <p className="text-[11px] text-foreground/50 leading-relaxed">Combine its types and abilities to find unique niches in your team composition.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground/60 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" /> {t('detail.type_synergy') || 'Type Synergy'}
                    </h4>
                    <p className="text-xs text-foreground/50 leading-relaxed mb-4">
                      {displayName} is a {pokemon.types.map(t => t.type.name).join('/')} type Pokémon. 
                      Understanding how these types interact with others is key to winning battles.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">Offensive Tips</p>
                        <ul className="space-y-2">
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>Use same-type attacks (STAB) for 50% more damage.</span>
                          </li>
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>Target weaknesses to deal double or quadruple damage.</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">Defensive Tips</p>
                        <ul className="space-y-2">
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>Switch to a teammate when facing a type you are weak to.</span>
                          </li>
                          <li className="text-[11px] text-foreground/60 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>Leverage immunities to completely avoid certain attacks.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
