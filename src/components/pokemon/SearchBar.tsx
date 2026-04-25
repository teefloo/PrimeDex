'use client';

import { usePrimeDexStore } from '@/store/primedex';
import { Search, X, Command } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { useQueryClient } from '@tanstack/react-query';
import { pokemonKeys } from '@/lib/api/keys';
import { getAllPokemonSearchIndex } from '@/lib/api';

export default function SearchBar() {
  const { searchTerm, setSearchTerm } = usePrimeDexStore();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const prefetchIndex = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: pokemonKeys.allSearchIndex(),
      queryFn: () => getAllPokemonSearchIndex(),
      staleTime: 24 * 60 * 60 * 1000,
    });
  }, [queryClient]);

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
    setIsMac(typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

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

  return (
    <div
      className="relative mx-auto my-6 flex w-full max-w-2xl items-center px-4 group"
    >
      {/* Glow effect behind search bar */}
      <div className={`absolute inset-0 -m-2 rounded-[2rem] transition-all duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 rounded-[2rem] blur-2xl" />
      </div>

      <div className="relative w-full">
        {/* Search icon */}
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-300">
          <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-foreground/60'}`} />
        </div>

        <Input
          ref={inputRef}
          type="text"
          placeholder={t('search.placeholder')}
          value={localSearch}
          onFocus={() => { setIsFocused(true); prefetchIndex(); }}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            prefetchIndex();
          }}
          className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] py-6 pl-12 pr-20 text-base font-medium text-foreground shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-500 placeholder:text-foreground/60 focus-visible:border-primary/30 focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:shadow-[0_8px_40px_rgba(227,53,13,0.1)] md:text-lg"
          aria-label={t('search.placeholder')}
          id="pokemon-search"
        />

        {/* Keyboard shortcut badge */}
        <div className={`absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 transition-opacity duration-300 pointer-events-none ${localSearch ? 'opacity-0' : 'opacity-100'}`}>
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-foreground/70 tracking-wide">
            {isMac ? <Command className="w-3 h-3" /> : <span className="px-0.5">Ctrl</span>} K
          </kbd>
        </div>
      </div>

      {/* Clear button */}
      {localSearch && (
        <button
          type="button"
          onClick={() => {
            setLocalSearch('');
            setSearchTerm('');
          }}
          className="absolute right-6 z-10 rounded-full p-2 text-foreground/60 transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('search.clear')}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
