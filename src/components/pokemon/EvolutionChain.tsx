'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  const { data: sprite } = useQuery({
    queryKey: ['pokemon-sprite', name],
    queryFn: async () => {
      const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
      return data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
    },
    staleTime: Infinity,
  });

  return (
    <Link href={`/pokemon/${name}`}>
      <motion.div
        whileHover={{ y: -5, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center cursor-pointer group"
      >
        <div className="w-20 h-20 md:w-28 md:h-28 bg-secondary/30 border border-white/5 rounded-[2rem] flex items-center justify-center p-3 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {sprite ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sprite}
              alt={name}
              className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300 relative z-10"
              loading="lazy"
            />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-foreground/20" />
          )}
        </div>
        <span className="mt-4 text-sm font-bold capitalize text-foreground/70 group-hover:text-primary transition-colors tracking-wide">
          {name}
        </span>
      </motion.div>
    </Link>
  );
}

function ChainNode({ node }: { node: ChainLink }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
      <EvolutionItem name={node.species.name} />

      {node.evolves_to.length > 0 && (
        <div className="flex flex-col gap-8 md:gap-10 relative">
          {node.evolves_to.map((evolution) => (
            <div key={evolution.species.name} className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative">
              <div className="p-3 bg-secondary/30 rounded-full border border-white/5 text-foreground/40 shadow-sm">
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
      <div className="mt-8 p-8 h-40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.chain) return null;

  return (
    <div className="overflow-x-auto pb-8 scrollbar-hide">
      <div className="flex justify-center min-w-max px-4">
        <ChainNode node={data.chain} />
      </div>
    </div>
  );
}
