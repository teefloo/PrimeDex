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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="pt-10 pb-8">
      <motion.div 
        className="page-shell page-surface relative z-10 overflow-hidden px-5 py-8 md:px-8 md:py-10 shadow-[0_24px_72px_-34px_rgba(0,0,0,0.32)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.p variants={itemVariants} className="page-eyebrow justify-center">
            PrimeDex
          </motion.p>
          <motion.h1 
            variants={itemVariants} 
            className="mx-auto max-w-4xl text-5xl font-black tracking-tight leading-[0.9] md:text-7xl lg:text-[5.8rem]"
          >
            <span className="gradient-text-hero">
              {t('home.hero_title')}
            </span>
          </motion.h1>
          <motion.p variants={itemVariants} className="page-subtitle mx-auto mt-4 max-w-2xl">
            {t('home.hero_subtitle')}
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="mt-10 w-full max-w-5xl mx-auto">
          <div className="mb-5 relative z-20" id="hero-search-bar">
            <SearchBar />
          </div>

          <div className="section-frame p-5 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <FavoriteToggle />
                <CaughtFilter />
                <AdvancedFiltersWrapper />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent hidden md:block" />
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
