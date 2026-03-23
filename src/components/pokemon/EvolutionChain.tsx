'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import Image from 'next/image';

import { usePrimeDexStore } from '@/store/primedex';
import { getPokemonDetail, getPokemonSpecies } from '@/lib/api';
import { formatId } from '@/lib/utils';

interface EvolutionChainProps {
  url: string;
}

interface ChainLink {
  species: { name: string; url: string };
  evolves_to: ChainLink[];
}

interface ChainResponse {
  chain: ChainLink;
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

function ChainNode({ node }: { node: ChainLink }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
      <EvolutionItem name={node.species.name} />

      {node.evolves_to.length > 0 && (
        <div className="flex flex-col gap-12 md:gap-16 relative">
          {/* Vertical line for multiple branches on mobile */}
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


export function EvolutionChain({ url }: EvolutionChainProps) {
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
      <div className="flex justify-center min-w-max px-8 py-4">
        <ChainNode node={data.chain} />
      </div>
    </div>
  );
}


