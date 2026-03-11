'use client';

import { usePokedexStore } from '@/store/pokedex';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { PokemonDetail } from '@/types/pokemon';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = usePokedexStore();

  const pokemonQueries = useQueries({
    queries: compareList.map(id => ({
      queryKey: ['pokemon', id],
      queryFn: async () => {
        const { data } = await axios.get<PokemonDetail>(`https://pokeapi.co/api/v2/pokemon/${id}`);
        return data;
      },
      staleTime: 10 * 60 * 1000,
    }))
  });

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="glass-panel p-4 rounded-[2rem] border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
          <AnimatePresence mode="popLayout">
            {pokemonQueries.map((q, idx) => {
              const p = q.data;
              const id = compareList[idx];
              
              return (
                <motion.div 
                  key={id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group shrink-0"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/50 border border-white/10 flex items-center justify-center p-2">
                    {q.isLoading ? (
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : p ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={p.sprites.front_default} 
                        alt={p.name} 
                        className="w-full h-full object-contain filter drop-shadow-md"
                      />
                    ) : null}
                  </div>
                  <button 
                    onClick={() => removeFromCompare(id)}
                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {compareList.length < 3 && (
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-foreground/20">
              <span className="text-xs font-black">+{3 - compareList.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearCompare}
            className="hover:bg-destructive/10 hover:text-destructive rounded-full"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          
          <Link href="/compare">
            <Button 
              className="rounded-xl font-black uppercase tracking-widest gap-2 px-6 shadow-lg shadow-primary/20"
              disabled={compareList.length < 2}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Compare
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
