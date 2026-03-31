'use client';

import { motion, Variants } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import SearchBar from '@/components/pokemon/SearchBar';
import TypeFilter from '@/components/pokemon/TypeFilter';
import RegionFilter from '@/components/pokemon/RegionFilter';
import FavoriteToggle from '@/components/pokemon/FavoriteToggle';
import CaughtFilter from '@/components/pokemon/CaughtFilter';
import SortSelector from '@/components/pokemon/SortSelector';
import AdvancedFiltersWrapper from '@/components/pokemon/AdvancedFiltersWrapper';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="text-center mb-16 pt-14 relative">
      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/15 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/3 w-[200px] h-[100px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '-1.5s' }} />
        <div className="absolute top-2/3 right-1/4 w-[150px] h-[80px] bg-purple-500/8 rounded-full blur-[60px] animate-pulse-glow" style={{ animationDelay: '-3s' }} />
      </div>

      <motion.div 
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Pill badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/40">
            {t('home.hero_subtitle')}
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter drop-shadow-sm leading-[0.9] mb-6">
          <span className="gradient-text-hero">
            {t('home.hero_title')}
          </span>
        </motion.h1>

        {/* Decorative line */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary/40" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
        </motion.div>

        {/* Search and Filters - Glassmorphic Panel */}
        <motion.div variants={itemVariants} className="w-full max-w-5xl mx-auto">
          {/* Main Search Bar separated slightly for prominence */}
          <div className="mb-6 relative z-20">
            <SearchBar />
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 flex flex-col space-y-6 relative overflow-hidden transition-all duration-500 hover:bg-white/[0.03]">
            {/* Inner subtle glow for the glass panel */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <FavoriteToggle />
                <CaughtFilter />
                <AdvancedFiltersWrapper />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent hidden md:block" />
              <div className="flex-shrink-0">
                <SortSelector />
              </div>
            </div>

            <div className="w-full space-y-4 relative z-10">
              <RegionFilter />
              <TypeFilter />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
