'use client';

import { usePokedexStore } from '@/store/pokedex';
import { TYPE_COLORS } from '@/types/pokemon';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TypeFilter() {
  const { selectedType, setSelectedType } = usePokedexStore();
  const types = Object.keys(TYPE_COLORS);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full overflow-x-auto pb-8 pt-4 scrollbar-hide"
    >
      <div className="flex flex-nowrap md:flex-wrap gap-3 justify-start md:justify-center px-4 min-w-max md:min-w-0 mx-auto max-w-6xl">
        <AnimatePresence>
          {selectedType && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0, width: 0 }}
              animate={{ scale: 1, opacity: 1, width: 'auto' }}
              exit={{ scale: 0.8, opacity: 0, width: 0 }}
              onClick={() => setSelectedType(null)}
              className="flex items-center gap-1 glass-btn px-4 py-2.5 text-sm text-foreground/80 hover:text-destructive whitespace-nowrap overflow-hidden"
            >
              <X className="w-4 h-4" />
              <span className="font-semibold">Clear</span>
            </motion.button>
          )}
        </AnimatePresence>
        
        {types.map((type) => {
          const isActive = selectedType === type;
          const color = TYPE_COLORS[type];
          
          return (
            <button
              key={type}
              onClick={() => setSelectedType(isActive ? null : type)}
              className={cn(
                "relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden group",
                isActive 
                  ? "text-white shadow-lg scale-105"
                  : "bg-secondary/40 backdrop-blur-md text-foreground/70 hover:text-foreground border border-white/10 hover:border-white/30"
              )}
              style={isActive ? {
                backgroundColor: color,
                boxShadow: `0 8px 20px -6px ${color}`,
              } : {}}
            >
              {!isActive && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ backgroundColor: color }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {isActive && (
                  <motion.span 
                    layoutId="activeTypeIndicator"
                    className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                  />
                )}
                {type}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
