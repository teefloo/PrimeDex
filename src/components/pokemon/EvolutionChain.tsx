'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import Image from 'next/image';

import { usePrimeDexStore } from '@/store/primedex';
import { getPokemonDetail, getPokemonSpecies } from '@/lib/api';
import { formatId } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface EvolutionChainProps {
  url: string;
  speciesName?: string;
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
  formType: 'mega' | 'primal' | 'ultra';
}

function EvolutionItem({ name }: { name: string }) {
  const { language, systemLanguage } = usePrimeDexStore();
  const resolvedLang = language === 'auto' ? systemLanguage : language;

  const { data: pokemonData } = useQuery({
    queryKey: ['pokemon-evolution-item', name, resolvedLang],
    queryFn: () => getPokemonDetail(name),
    staleTime: Infinity,
  });

  const { data: speciesData } = useQuery({
    queryKey: ['species-evolution-item', name, resolvedLang],
    queryFn: () => getPokemonSpecies(name),
    staleTime: Infinity,
  });

  const sprite = pokemonData?.sprites.other['official-artwork'].front_default || pokemonData?.sprites.front_default;
  const displayName = speciesData?.names?.find(n => n.language.name === resolvedLang)?.name
    || speciesData?.names?.find(n => n.language.name === 'en')?.name
    || name;

  return (
    <Link href={`/pokemon/${name}`} className="relative z-10 hover:z-20">
      <motion.div
        whileHover={{ y: -5, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center cursor-pointer group"
      >
        <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary/30 border border-white/5 rounded-[2.5rem] flex items-center justify-center p-4 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500 relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {sprite ? (
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
          <span className="text-sm font-black capitalize text-foreground/80 group-hover:text-primary transition-colors tracking-tight">
            {displayName}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

function AlternateFormItem({ form }: { form: AlternateForm }) {
  const store = usePrimeDexStore();
  const resolvedLang = store.language === 'auto' ? store.systemLanguage : store.language;
  const { t } = useTranslation();

  const { data: pokemonData, isLoading } = useQuery({
    queryKey: ['pokemon-alternate-form', form.name, resolvedLang],
    queryFn: () => getPokemonDetail(form.name),
    staleTime: Infinity,
  });

  const baseName = form.name.split(/-(mega|primal|ultra)/)[0] || form.name;
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
    
    if (form.formType === 'mega') {
      const suffix = form.name.includes('-mega-x') ? ' X' : form.name.includes('-mega-y') ? ' Y' : '';
      return `${baseDisplayName}-Méga${suffix}`;
    }
    if (form.formType === 'primal') {
      return `${baseDisplayName}-Primal`;
    }
    if (form.formType === 'ultra') {
      return `Ultra-${baseDisplayName}`;
    }
    return baseDisplayName;
  })();

  const formConfig = {
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
  };

  const config = formConfig[form.formType];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary/30 border border-white/5 rounded-[2.5rem] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
        </div>
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

function AlternateFormsSection({ speciesName }: { speciesName: string }) {
  const { t } = useTranslation();
  const { language, systemLanguage } = usePrimeDexStore();
  const resolvedLang = language === 'auto' ? systemLanguage : language;

  const { data: speciesData, isLoading: speciesLoading, isError: speciesError } = useQuery({
    queryKey: ['species-alternate-forms', speciesName, resolvedLang],
    queryFn: () => getPokemonSpecies(speciesName),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  const { data: pokemonData, isLoading: pokemonLoading, isError: pokemonError } = useQuery({
    queryKey: ['pokemon-alternate-forms', speciesName],
    queryFn: () => getPokemonDetail(speciesName),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  const isLoading = speciesLoading || pokemonLoading;
  const isError = speciesError || pokemonError;

  const alternateForms: AlternateForm[] = (() => {
    const forms = new Map<string, AlternateForm>();

    // Collect from species.varieties
    if (speciesData?.varieties) {
      const filtered = speciesData.varieties
        .filter(v => {
          if (v.is_default) return false;
          const name = v.pokemon.name;
          return name.includes('-mega') || name.includes('-primal') || name.includes('-ultra');
        });
      console.log('[AlternateFormsSection] Filtered varieties:', filtered.map(v => v.pokemon.name));
      
      filtered
        .forEach(v => {
          const name = v.pokemon.name;
          let formType: AlternateForm['formType'] = 'mega';
          if (name.includes('-primal')) formType = 'primal';
          else if (name.includes('-ultra')) formType = 'ultra';
          forms.set(name, {
            name,
            id: parseInt(v.pokemon.url.split('/').filter(Boolean).pop() || '0'),
            formType,
          });
        });
    }

    // Also collect from pokemon.forms (covers cases where varieties doesn't include mega forms)
    if (pokemonData?.forms) {
      const filteredForms = pokemonData.forms
        .filter(f => {
          const name = f.name;
          return name.includes('-mega') || name.includes('-primal') || name.includes('-ultra');
        });
      console.log('[AlternateFormsSection] Filtered forms:', filteredForms.map(f => f.name));
      
      filteredForms
        .forEach(f => {
          const name = f.name;
          let formType: AlternateForm['formType'] = 'mega';
          if (name.includes('-primal')) formType = 'primal';
          else if (name.includes('-ultra')) formType = 'ultra';
          // Extract ID from form URL
          const formId = parseInt(f.url.split('/').filter(Boolean).pop() || '0');
          if (!forms.has(name)) {
            forms.set(name, {
              name,
              id: formId,
              formType,
            });
          }
        });
    }

    console.log('[AlternateFormsSection] Final forms:', Array.from(forms.values()));
    return Array.from(forms.values());
  })();

  if (isLoading) {
    return (
      <div className="mt-12 pt-8 border-t border-white/10 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-12 pt-8 border-t border-white/10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-black uppercase tracking-wider text-foreground/80">
            {t('detail.alternate_forms')}
          </h3>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <p className="text-center text-xs text-red-400">Error loading alternate forms</p>
      </div>
    );
  }

  if (alternateForms.length === 0) {
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
        {alternateForms.map((form) => (
          <AlternateFormItem key={form.name} form={form} />
        ))}
      </div>
    </div>
  );
}

function ChainNode({ node }: { node: ChainLink }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
      <EvolutionItem name={node.species.name} />

      {node.evolves_to.length > 0 && (
        <div className="flex flex-col gap-12 md:gap-16 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 md:hidden -translate-x-1/2 -z-10" />
          
          {node.evolves_to.map((evolution) => (
            <div key={evolution.species.name} className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative">
              <div className="p-3 bg-secondary/40 rounded-full border border-white/10 text-foreground/30 shadow-inner z-10 group-hover:text-primary/50 transition-colors">
                <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
              </div>
              <ChainNode node={evolution} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export function EvolutionChain({ url, speciesName }: EvolutionChainProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['evolutionChain', url],
    queryFn: async () => {
      const { data } = await axios.get<ChainResponse>(url);
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-12 min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!data?.chain) return null;

  return (
    <div className="overflow-x-auto pb-12 scrollbar-hide">
      <div className="flex flex-col items-center min-w-max px-8 py-4">
        <div className="flex justify-center w-full">
          <ChainNode node={data.chain} />
        </div>
        {speciesName && <AlternateFormsSection speciesName={speciesName} />}
      </div>
    </div>
  );
}
