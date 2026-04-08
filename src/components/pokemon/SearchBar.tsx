'use client';

import { usePrimeDexStore } from '@/store/primedex';
import { Search, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { useQueryClient } from '@tanstack/react-query';
import { pokemonKeys } from '@/lib/api/keys';
import { getAllPokemonSummary } from '@/lib/api';
import { useMounted } from '@/hooks/useMounted';

export default function SearchBar() {
  const { searchTerm, setSearchTerm, language, systemLanguage } = usePrimeDexStore();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const mounted = useMounted();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const resolvedLang = language === 'auto' ? systemLanguage : language;

  const prefetchIndex = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: pokemonKeys.allSummary(resolvedLang),
      queryFn: () => getAllPokemonSummary(),
      staleTime: 24 * 60 * 60 * 1000,
    });
  }, [queryClient, resolvedLang]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        } else if (e.key === 'k') {
          // If already in input, still prevent default browser action for Cmd+K / Ctrl+K
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMac = mounted && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex items-center w-full max-w-2xl mx-auto my-8 px-4 group"
    >
      {/* Glow effect behind search bar */}
      <div className={`absolute inset-0 -m-2 rounded-[2rem] transition-all duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 rounded-[2rem] blur-2xl" />
      </div>

      {/* Search icon */}
      <div className="absolute left-8 pointer-events-none z-10 transition-colors duration-300">
        <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-foreground/30'}`} />
      </div>
      
      <div className="w-full relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('search.placeholder')}
          value={mounted ? localSearch : ''}
          onFocus={() => { setIsFocused(true); prefetchIndex(); }}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            prefetchIndex();
          }}
          className="w-full pl-12 pr-20 py-7 rounded-full bg-white/[0.04] dark:bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] dark:border-white/[0.06] text-foreground placeholder:text-foreground/30 text-lg font-medium shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-500 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/30 focus-visible:shadow-[0_8px_40px_rgba(227,53,13,0.1)] focus-visible:bg-white/[0.06]"
          aria-label={t('search.placeholder')}
          id="pokemon-search"
        />

        {/* Keyboard shortcut badge */}
        <div className={`absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 transition-opacity duration-300 pointer-events-none ${localSearch ? 'opacity-0' : 'opacity-100'}`}>
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-foreground/30 tracking-wide">
            {isMac ? <Command className="w-3 h-3" /> : <span className="px-0.5">Ctrl</span>} K
          </kbd>
        </div>
      </div>

      {/* Clear button */}
      <AnimatePresence>
        {localSearch && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              setLocalSearch('');
              setSearchTerm('');
            }}
            className="absolute right-6 p-2 rounded-full text-foreground/30 hover:text-primary hover:bg-primary/10 transition-all duration-300 focus:outline-none z-10"
            aria-label={t('search.clear')}
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
