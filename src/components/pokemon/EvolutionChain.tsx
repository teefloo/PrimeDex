'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import Image from 'next/image';

import { REST_API_BASE } from '@/lib/api/client';
import apiClient from '@/lib/api/client';
import { usePrimeDexStore } from '@/store/primedex';
import { getPokemonDetail, getPokemonSpecies } from '@/lib/api';
import { cn, formatId } from '@/lib/utils';
import { getFormDisplayName } from '@/lib/form-names';
import { useTranslation } from '@/lib/i18n';

interface EvolutionChainProps {
  url: string;
  currentSpeciesName?: string;
  speciesData?: { varieties: { pokemon: { name: string; url: string } }[] } | null;
}

interface ChainLink {
  species: { name: string; url: string };
  evolves_to: ChainLink[];
}

interface ChainResponse {
  chain: ChainLink;
}

interface AlternateForm {
  name: string;
  id: number;
  formType: string;
}

function getBaseSpeciesName(name: string): string {
  return name.split(/-(mega|primal|ultra|gmax|alola|galar|hisui|paldea)/)[0] || name;
}

function collectAllSpeciesNames(node: ChainLink): string[] {
  const baseName = getBaseSpeciesName(node.species.name);
  const names = [baseName];
  for (const child of node.evolves_to) {
    names.push(...collectAllSpeciesNames(child));
  }
  return [...new Set(names)];
}

function detectFormType(formName: string): string {
  const lower = formName.toLowerCase();
  if (lower.includes('-mega')) return 'mega';
  if (lower.includes('-gmax')) return 'gmax';
  if (lower.includes('-primal')) return 'primal';
  if (lower.includes('-ultra')) return 'ultra';
  if (lower.includes('-alola')) return 'alola';
  if (lower.includes('-galar')) return 'galar';
  if (lower.includes('-hisui')) return 'hisui';
  if (lower.includes('-paldea')) return 'paldea';
  return 'standard';
}

function EvolutionItem({ name, isCurrent }: { name: string; isCurrent?: boolean }) {
  const { language, systemLanguage } = usePrimeDexStore();
  const resolvedLang = language === 'auto' ? systemLanguage : language;

  const { data: pokemonData, isError: pokemonError } = useQuery({
    queryKey: ['pokemon-evolution-item', name, resolvedLang],
    queryFn: () => getPokemonDetail(name),
    staleTime: Infinity,
  });

  const { data: speciesData, isError: speciesError } = useQuery({
    queryKey: ['species-evolution-item', name, resolvedLang],
    queryFn: () => getPokemonSpecies(name),
    staleTime: Infinity,
  });

  const sprite = pokemonData?.sprites.other['official-artwork'].front_default || pokemonData?.sprites.front_default;
  const displayName = speciesData?.names?.find(n => n.language.name === resolvedLang)?.name
    || speciesData?.names?.find(n => n.language.name === 'en')?.name
    || name;

  const hasError = pokemonError && speciesError;
  const hasPartialData = pokemonData || speciesData;

  return (
    <Link href={`/pokemon/${name}`} className="relative z-10 hover:z-20">
      <motion.div
        whileHover={{ y: -5, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex flex-col items-center cursor-pointer group",
          isCurrent && "scale-110"
        )}
      >
        <div className={cn(
          "w-24 h-24 md:w-32 md:h-32 bg-secondary/30 border border-white/5 rounded-[2.5rem] flex items-center justify-center p-4 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500 relative overflow-hidden shadow-sm",
          isCurrent && "bg-primary/10 border-primary/40 ring-2 ring-primary/30 shadow-lg shadow-primary/20"
        )}>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {!hasPartialData && hasError ? (
            <div className="text-center">
              <span className="text-xs font-black capitalize text-foreground/60">{displayName}</span>
            </div>
          ) : sprite ? (
            <Image
              src={sprite}
              alt={displayName}
              width={128}
              height={128}
              className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500 relative z-10"
            />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-foreground/20" />
          )}
        </div>
        <div className="mt-4 text-center">
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] block mb-0.5">
            {pokemonData ? formatId(pokemonData.id) : ''}
          </span>
          <span className={cn(
            "text-sm font-black capitalize text-foreground/80 group-hover:text-primary transition-colors tracking-tight",
            isCurrent && "text-primary font-black"
          )}>
            {displayName}
          </span>
          {isCurrent && (
            <span className="text-[8px] font-black uppercase tracking-widest text-primary mt-1 block">
              Current
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function AlternateFormItem({ form }: { form: AlternateForm }) {
  const store = usePrimeDexStore();
  const resolvedLang = store.language === 'auto' ? store.systemLanguage : store.language;
  const { t } = useTranslation();

  const { data: pokemonData, isLoading, isError } = useQuery({
    queryKey: ['pokemon-alternate-form', form.name, resolvedLang],
    queryFn: () => getPokemonDetail(form.name),
    staleTime: Infinity,
  });

  const baseName = form.name.split('-')[0] || form.name;
  const { data: speciesData } = useQuery({
    queryKey: ['species-alternate-form', baseName, resolvedLang],
    queryFn: () => getPokemonSpecies(baseName),
    staleTime: Infinity,
  });

  const sprite = pokemonData?.sprites.other['official-artwork'].front_default || pokemonData?.sprites.front_default;
  
  const displayName = (() => {
    const baseDisplayName = speciesData?.names?.find(n => n.language.name === resolvedLang)?.name
      || speciesData?.names?.find(n => n.language.name === 'en')?.name
      || baseName;
    
    return getFormDisplayName(form.name, baseDisplayName, resolvedLang);
  })();

  const formConfig: Record<string, {
    badge: string;
    gradient: string;
    border: string;
    borderHover: string;
    shadow: string;
    innerGradient: string;
    dropShadow: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    textHover: string;
  }> = {
    mega: {
      badge: t('detail.alternate_badge_mega'),
      gradient: 'from-purple-500/20 to-yellow-500/20',
      border: 'border-purple-400/30',
      borderHover: 'group-hover:border-purple-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      innerGradient: 'from-purple-400/10 to-yellow-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]',
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-400',
      badgeBorder: 'border-purple-500/30',
      textHover: 'group-hover:text-purple-400',
    },
    primal: {
      badge: t('detail.alternate_badge_primal'),
      gradient: 'from-orange-500/20 to-red-500/20',
      border: 'border-orange-400/30',
      borderHover: 'group-hover:border-orange-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
      innerGradient: 'from-orange-400/10 to-red-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]',
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-400',
      badgeBorder: 'border-orange-500/30',
      textHover: 'group-hover:text-orange-400',
    },
    ultra: {
      badge: t('detail.alternate_badge_ultra'),
      gradient: 'from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-400/30',
      borderHover: 'group-hover:border-yellow-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
      innerGradient: 'from-yellow-400/10 to-amber-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]',
      badgeBg: 'bg-yellow-500/20',
      badgeText: 'text-yellow-400',
      badgeBorder: 'border-yellow-500/30',
      textHover: 'group-hover:text-yellow-400',
    },
    gmax: {
      badge: 'GMax',
      gradient: 'from-pink-500/20 to-rose-500/20',
      border: 'border-pink-400/30',
      borderHover: 'group-hover:border-pink-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      innerGradient: 'from-pink-400/10 to-rose-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]',
      badgeBg: 'bg-pink-500/20',
      badgeText: 'text-pink-400',
      badgeBorder: 'border-pink-500/30',
      textHover: 'group-hover:text-pink-400',
    },
    alola: {
      badge: 'Alola',
      gradient: 'from-teal-500/20 to-emerald-500/20',
      border: 'border-teal-400/30',
      borderHover: 'group-hover:border-teal-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]',
      innerGradient: 'from-teal-400/10 to-emerald-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(20,184,166,0.4)]',
      badgeBg: 'bg-teal-500/20',
      badgeText: 'text-teal-400',
      badgeBorder: 'border-teal-500/30',
      textHover: 'group-hover:text-teal-400',
    },
    galar: {
      badge: 'Galar',
      gradient: 'from-indigo-500/20 to-violet-500/20',
      border: 'border-indigo-400/30',
      borderHover: 'group-hover:border-indigo-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]',
      innerGradient: 'from-indigo-400/10 to-violet-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]',
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-400',
      badgeBorder: 'border-indigo-500/30',
      textHover: 'group-hover:text-indigo-400',
    },
    hisui: {
      badge: 'Hisui',
      gradient: 'from-stone-500/20 to-neutral-500/20',
      border: 'border-stone-400/30',
      borderHover: 'group-hover:border-stone-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(168,162,158,0.3)]',
      innerGradient: 'from-stone-400/10 to-neutral-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(168,162,158,0.4)]',
      badgeBg: 'bg-stone-500/20',
      badgeText: 'text-stone-400',
      badgeBorder: 'border-stone-500/30',
      textHover: 'group-hover:text-stone-400',
    },
    paldea: {
      badge: 'Paldea',
      gradient: 'from-orange-500/20 to-amber-500/20',
      border: 'border-orange-400/30',
      borderHover: 'group-hover:border-orange-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
      innerGradient: 'from-orange-400/10 to-amber-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]',
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-400',
      badgeBorder: 'border-orange-500/30',
      textHover: 'group-hover:text-orange-400',
    },
    standard: {
      badge: 'Form',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-400/30',
      borderHover: 'group-hover:border-blue-400/60',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      innerGradient: 'from-blue-400/10 to-cyan-400/10',
      dropShadow: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]',
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-400',
      badgeBorder: 'border-blue-500/30',
      textHover: 'group-hover:text-blue-400',
    },
  };

  const config = formConfig[form.formType] || formConfig.standard;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary/30 border border-white/5 rounded-[2.5rem] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
        </div>
      </div>
    );
  }

  if (isError || !pokemonData) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary/30 border border-white/5 rounded-[2.5rem] flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400/60" />
        </div>
        <span className="mt-2 text-[8px] font-black text-red-400/60 uppercase tracking-wider">
          {t('detail.load_error', { defaultValue: 'Error' })}
        </span>
      </div>
    );
  }

  return (
    <Link href={`/pokemon/${form.name}`} className="relative z-10 hover:z-20">
      <motion.div
        whileHover={{ y: -5, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center cursor-pointer group"
      >
        <div className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${config.gradient} border ${config.border} rounded-[2.5rem] flex items-center justify-center p-4 ${config.borderHover} ${config.shadow} transition-all duration-500 relative overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-tr ${config.innerGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          {sprite ? (
            <Image
              src={sprite}
              alt={displayName}
              width={128}
              height={128}
              className={`w-full h-full object-contain filter ${config.dropShadow} group-hover:scale-110 transition-transform duration-500 relative z-10`}
            />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-foreground/20" />
          )}
        </div>
        <div className="mt-3 text-center">
          <span className={`px-2 py-0.5 ${config.badgeBg} ${config.badgeText} text-[8px] font-black uppercase tracking-wider rounded-full border ${config.badgeBorder} mb-1 inline-block`}>
            {config.badge}
          </span>
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] block mb-0.5">
            {pokemonData ? formatId(pokemonData.id) : ''}
          </span>
          <span className={`text-xs font-black capitalize text-foreground/80 ${config.textHover} transition-colors tracking-tight`}>
            {displayName}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

function AlternateFormsSection({ allForms, isLoading }: { allForms: AlternateForm[]; isLoading: boolean }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary/40" />
        <span className="text-sm font-bold text-foreground/40 uppercase tracking-wider">
          {t('detail.loading_forms', { defaultValue: 'Loading alternate forms...' })}
        </span>
      </div>
    );
  }

  if (allForms.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-black uppercase tracking-wider text-foreground/80">
          {t('detail.alternate_forms')}
        </h3>
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {allForms.map((form) => (
          <AlternateFormItem key={form.name} form={form} />
        ))}
      </div>
    </div>
  );
}

function ChainNode({ node, currentSpeciesName, allForms }: { node: ChainLink; currentSpeciesName?: string; allForms?: AlternateForm[] }) {
  const isCurrent = currentSpeciesName ? node.species.name === currentSpeciesName : false;
  const formType = allForms?.find(f => f.name === node.species.name)?.formType;
  const isAlternateForm = !!formType && formType !== 'standard';
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
      {isAlternateForm ? (
        <AlternateFormItem form={{ name: node.species.name, id: 0, formType }} />
      ) : (
        <EvolutionItem name={node.species.name} isCurrent={isCurrent} />
      )}

      {node.evolves_to.length > 0 && (
        <div className="flex flex-col gap-12 md:gap-16 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 md:hidden -translate-x-1/2 -z-10" />
          
          {node.evolves_to.map((evolution) => (
            <div key={evolution.species.name} className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative">
              <div className="p-3 bg-secondary/40 rounded-full border border-white/10 text-foreground/30 shadow-inner z-10 group-hover:text-primary/50 transition-colors">
                <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
              </div>
              <ChainNode node={evolution} currentSpeciesName={currentSpeciesName} allForms={allForms} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export function EvolutionChain({ url, currentSpeciesName, speciesData }: EvolutionChainProps) {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['evolutionChain', url],
    queryFn: async () => {
      const path = url.replace(REST_API_BASE, '');
      const { data } = await apiClient.get<ChainResponse>(path);
      return data;
    },
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const allSpeciesNames = useMemo(() => {
    if (!data?.chain) return [];
    return collectAllSpeciesNames(data.chain);
  }, [data]);

  const speciesQueries = useQueries({
    queries: allSpeciesNames.map((baseName) => ({
      queryKey: ['species-forms', baseName],
      queryFn: () => getPokemonSpecies(baseName),
      staleTime: Infinity,
      enabled: allSpeciesNames.length > 0,
    })),
  });

  const allFormsLoading = speciesQueries.some(q => q.isLoading);

  const speciesQueryData = speciesQueries.map(q => q.data);

  const allForms = useMemo(() => {
    const collected: AlternateForm[] = [];

    const addFormsFromSpecies = (species: { varieties?: { pokemon: { name: string; url: string } }[] } | null | undefined) => {
      if (!species?.varieties) return;
      for (const v of species.varieties) {
        const formType = detectFormType(v.pokemon.name);
        if (formType !== 'standard') {
          collected.push({
            name: v.pokemon.name,
            id: parseInt(v.pokemon.url.split('/').filter(Boolean).pop() || '0'),
            formType,
          });
        }
      }
    };

    if (speciesData) addFormsFromSpecies(speciesData);
    for (const queryData of speciesQueryData) {
      if (queryData) addFormsFromSpecies(queryData);
    }

    const seen = new Set<string>();
    return collected.filter((f) => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });
  }, [speciesData, speciesQueryData]);

  const enhancedChain = useMemo(() => {
    if (!data?.chain || allForms.length === 0) return data?.chain;

    const traverse = (node: ChainLink): ChainLink => {
      const newNode = { ...node, evolves_to: node.evolves_to.map(traverse) };
      const baseName = getBaseSpeciesName(newNode.species.name);
      const relevantForms = allForms.filter((f: AlternateForm) => {
        const formBase = getBaseSpeciesName(f.name);
        return formBase === baseName;
      });
      if (relevantForms.length > 0) {
        newNode.evolves_to = [
          ...newNode.evolves_to,
          ...relevantForms.map((f: AlternateForm) => ({
            species: { name: f.name, url: '' },
            evolves_to: [],
          })),
        ];
      }
      return newNode;
    };
    return traverse(data.chain);
  }, [data, allForms]);

  if (isLoading) {
    return (
      <div className="p-12 min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
      </div>
    );
  }

  if (isError || !enhancedChain) {
    return (
      <div className="p-12 min-h-[300px] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-400/60" />
        <p className="text-foreground/50 font-bold uppercase tracking-widest text-sm">
          {t('detail.evolution_chain_error', { defaultValue: 'Failed to load evolution chain' })}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-12 scrollbar-hide">
      <div className="flex flex-col items-center min-w-max px-8 py-4">
        <div className="flex justify-center w-full">
          <ChainNode node={enhancedChain} currentSpeciesName={currentSpeciesName} allForms={allForms} />
        </div>
        <AlternateFormsSection allForms={allForms} isLoading={allFormsLoading} />
      </div>
    </div>
  );
}
