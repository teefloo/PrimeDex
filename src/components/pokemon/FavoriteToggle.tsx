'use client';

import { usePrimeDexStore } from '@/store/primedex';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export default function FavoriteToggle() {
  const { showFavoritesOnly, setShowFavoritesOnly, favorites } = usePrimeDexStore();
  const { t } = useTranslation();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-400 border",
        showFavoritesOnly 
          ? "bg-rose-500 text-white border-rose-400/50 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.5)]" 
          : "bg-white/[0.03] backdrop-blur-xl text-foreground/50 hover:text-foreground/80 border-white/[0.06] hover:border-white/[0.12]"
      )}
    >
      <Heart className={cn("w-3.5 h-3.5 transition-all", showFavoritesOnly && "fill-current scale-110")} />
      <span>{t('favorites.toggle', { count: favorites.length })}</span>
    </motion.button>
  );
}
