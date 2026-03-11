'use client';

import { motion } from 'framer-motion';

interface HeightComparisonProps {
  pokemonHeight: number; // in decimeters
  pokemonName: string;
}

export function HeightComparison({ pokemonHeight, pokemonName }: HeightComparisonProps) {
  // Convert to meters
  const heightInMeters = pokemonHeight / 10;
  const humanHeight = 1.8; // 1.8 meters

  // Calculate proportional heights (max 100%)
  const maxHeight = Math.max(humanHeight, heightInMeters);
  
  // Base heights in percent relative to the container's max available height
  const humanPercent = (humanHeight / maxHeight) * 100;
  const pokemonPercent = (heightInMeters / maxHeight) * 100;

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-xl font-black mb-6 text-foreground/90 border-b border-white/10 pb-4 w-full text-center">
        Size Comparison
      </h3>
      <div className="flex items-end justify-center gap-12 h-64 w-full relative border-b-2 border-foreground/20 pb-2">
        {/* Human Silhouette */}
        <div className="flex flex-col items-center justify-end h-full">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${humanPercent}%`, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="w-16 md:w-20 bg-foreground/20 rounded-t-[2rem] flex items-end justify-center relative"
          >
            {/* Simple Human Shape */}
            <div className="absolute top-2 w-8 h-8 md:w-10 md:h-10 bg-foreground/30 rounded-full" />
            <div className="absolute top-12 w-12 h-1/2 md:w-16 bg-foreground/30 rounded-t-3xl" />
          </motion.div>
          <span className="text-sm font-bold text-foreground/60 mt-4">Human</span>
          <span className="text-xs text-foreground/40">{humanHeight.toFixed(1)} m</span>
        </div>

        {/* Pokemon Silhouette */}
        <div className="flex flex-col items-center justify-end h-full">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${pokemonPercent}%`, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="w-20 md:w-28 bg-primary/40 rounded-t-[2rem] relative flex items-end justify-center"
          >
            {/* Simple Pokemon abstract shape */}
            <div className="absolute top-4 w-12 h-12 md:w-16 md:h-16 bg-primary/50 rounded-full" />
            <div className="absolute top-16 w-16 h-1/2 md:w-24 bg-primary/50 rounded-t-3xl" />
          </motion.div>
          <span className="text-sm font-bold text-foreground/80 mt-4 capitalize truncate max-w-[100px]">{pokemonName}</span>
          <span className="text-xs font-medium text-foreground/60">{heightInMeters.toFixed(1)} m</span>
        </div>
      </div>
    </div>
  );
}
