'use client';

import { usePrimeDexStore } from '@/store/primedex';
import { cn } from '@/lib/utils';
import { X, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const REGIONS = [
  { key: 'kanto', gen: '1' },
  { key: 'johto', gen: '2' },
  { key: 'hoenn', gen: '3' },
  { key: 'sinnoh', gen: '4' },
  { key: 'unova', gen: '5' },
  { key: 'kalos', gen: '6' },
  { key: 'alola', gen: '7' },
  { key: 'galar', gen: '8' },
  { key: 'paldea', gen: '9' },
];

export default function RegionFilter() {
  const { selectedGeneration, setSelectedGeneration } = usePrimeDexStore();
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="w-full pb-4 pt-2"
    >
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 md:gap-2.5 justify-start lg:justify-center px-4 mx-auto w-full max-w-7xl overflow-x-auto scrollbar-hide">
        {/* Region label */}
        <div className="hidden sm:flex items-center gap-2 mr-1 px-3 py-2 bg-primary/8 rounded-full border border-primary/15 shrink-0">
          <Map className="w-3.5 h-3.5 text-primary/70" />
          <span className="text-[11px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{t('regions.title')}</span>
        </div>

        <AnimatePresence mode="popLayout">
          {selectedGeneration && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0, width: 0 }}
              animate={{ scale: 1, opacity: 1, width: 'auto' }}
              exit={{ scale: 0.8, opacity: 0, width: 0 }}
              onClick={() => setSelectedGeneration(null)}
              className="flex items-center justify-center shrink-0 gap-1 bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-full text-xs text-destructive hover:bg-destructive/20 transition-all duration-300 whitespace-nowrap backdrop-blur-xl"
              aria-label={t('filters.reset')}
            >
              <X className="w-3 h-3 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px]">{t('filters.reset')}</span>
            </motion.button>
          )}
        </AnimatePresence>
        
        {REGIONS.map((region) => {
          const isActive = selectedGeneration === parseInt(region.gen);
          const label = t(`regions.${region.key}`);
          
          return (
            <motion.button
              key={region.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGeneration(isActive ? null : parseInt(region.gen))}
              className={cn(
                "relative px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-400 overflow-hidden group border",
                isActive 
                  ? "bg-primary text-white border-primary/50 shadow-[0_4px_20px_-4px_rgba(227,53,13,0.5)]"
                  : "bg-white/[0.03] backdrop-blur-xl text-foreground/45 hover:text-foreground/75 border-white/[0.06] hover:border-white/[0.12]"
              )}
            >
              {/* Hover glow */}
              {!isActive && (
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-400 rounded-full" />
              )}
              
              {/* Active inner shine */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
              )}
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
