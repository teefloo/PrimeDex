'use client';

import { usePokedexStore } from '@/store/pokedex';
import { cn } from '@/lib/utils';
import { X, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REGIONS = [
  { name: 'Kanto', gen: '1' },
  { name: 'Johto', gen: '2' },
  { name: 'Hoenn', gen: '3' },
  { name: 'Sinnoh', gen: '4' },
  { name: 'Unova', gen: '5' },
  { name: 'Kalos', gen: '6' },
  { name: 'Alola', gen: '7' },
  { name: 'Galar', gen: '8' },
  { name: 'Paldea', gen: '9' },
];

export default function RegionFilter() {
  const { selectedGeneration, setSelectedGeneration } = usePokedexStore();

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="w-full pb-4 pt-2"
    >
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center px-4 mx-auto max-w-6xl">
        <div className="hidden sm:flex items-center gap-2 mr-2 px-3 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Map className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Regions</span>
        </div>

        <AnimatePresence mode="popLayout">
          {selectedGeneration && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0, width: 0 }}
              animate={{ scale: 1, opacity: 1, width: 'auto' }}
              exit={{ scale: 0.8, opacity: 0, width: 0 }}
              onClick={() => setSelectedGeneration(null)}
              className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-full text-xs text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap overflow-hidden"
            >
              <X className="w-3 h-3" />
              <span className="font-bold uppercase tracking-tighter">Reset</span>
            </motion.button>
          )}
        </AnimatePresence>
        
        {REGIONS.map((region) => {
          const isActive = selectedGeneration === parseInt(region.gen);
          
          return (
            <button
              key={region.name}
              onClick={() => setSelectedGeneration(isActive ? null : parseInt(region.gen))}
              className={cn(
                "relative px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 overflow-hidden group border",
                isActive 
                  ? "bg-primary text-white border-primary shadow-[0_8px_20px_-6px_rgba(255,50,50,0.5)] scale-105"
                  : "bg-secondary/40 backdrop-blur-md text-foreground/60 hover:text-foreground border-white/10 hover:border-white/30"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {region.name}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
