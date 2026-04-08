'use client';

import Link, { LinkProps } from 'next/link';
import {
  Settings,
  Sun,
  Moon,
  Heart,
  Users,
  BrainCircuit,
  Languages,
  Sparkles,
  Swords,
  Search,
  Menu,
  ArrowLeftRight
} from 'lucide-react';
import { usePrimeDexStore } from '@/store/primedex';
import SettingsModal from './SettingsModal';
import { useEffect, useState, ReactNode, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAllPokemonSummary } from '@/lib/api/graphql';
import { pokemonKeys } from '@/lib/api/keys';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation, loadLanguage } from '@/lib/i18n';
import PrimeDexLogo from '@/components/ui/PrimeDexLogo';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useMounted } from '@/hooks/useMounted';

interface HeaderLinkProps extends LinkProps {
  children: ReactNode;
  variant?: 'ghost' | 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  title?: string;
}

function HeaderLink({ children, href, variant, size, className, ...props }: HeaderLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === 'ghost' && 'hover:bg-white/10 hover:text-foreground',
        size === 'sm' && 'h-9 px-4 text-xs',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { toggleSettings, theme, setTheme, caughtPokemon, language, setLanguage, searchTerm, setSearchTerm, systemLanguage } = usePrimeDexStore();
  const { t, i18n } = useTranslation();
  const mounted = useMounted();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const resolvedLang = mounted ? (language === 'auto' ? (systemLanguage || 'en') : language) : 'en';

  const { data: allPokemon } = useQuery({
    queryKey: pokemonKeys.allSummary(resolvedLang),
    queryFn: () => getAllPokemonSummary(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const searchResults = useMemo(() => {
    if (!localSearch || !allPokemon) return [];
    const searchLower = localSearch.toLowerCase();
    return allPokemon
      .filter(p => {
        const speciesNames = p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames || [];
        const localized = speciesNames.find(sn => sn.pokemon_v2_language?.name === resolvedLang);
        const name = (localized?.name || p.name).toLowerCase();
        return name.includes(searchLower) || p.name.includes(searchLower);
      })
      .slice(0, 5);
  }, [localSearch, allPokemon, resolvedLang]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  const languageLabel = mounted ? (language === 'auto' ? t('settings.auto') : language.toUpperCase()) : 'EN';
  const themeLabel = mounted
    ? (theme === 'system' ? t('settings.system') : theme === 'dark' ? t('settings.dark') : t('settings.light'))
    : t('settings.system');

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isDark = mounted && (
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const cycleLanguage = () => {
    const langs: ('en' | 'fr' | 'es' | 'de' | 'it' | 'ja' | 'ko')[] = ['en', 'fr', 'es', 'de', 'it', 'ja', 'ko'];
    const currentIdx = langs.indexOf(language === 'auto' ? 'en' : language as 'en' | 'fr' | 'es' | 'de' | 'it' | 'ja' | 'ko');
    const nextLang = langs[(currentIdx + 1) % langs.length];
    setLanguage(nextLang);
    loadLanguage(nextLang).then(() => {
      i18n.changeLanguage(nextLang);
    });
  };

  const caughtCount = mounted ? caughtPokemon.length : 0;
  const progressPercent = Math.round((caughtCount / 1025) * 100);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] px-4 py-4 md:px-6 md:py-5',
          scrolled && 'px-3 py-2 md:px-4 md:py-3'
        )}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'mx-auto flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            scrolled
              ? 'max-w-5xl bg-background/70 backdrop-blur-3xl border border-white/[0.08] dark:border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-full px-4 py-2 md:px-6 md:py-2.5'
              : 'container bg-transparent px-2'
          )}
        >
          {/* ── LOGO ── */}
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" className="flex items-center gap-3 group" aria-label={t('header.home_aria')}>
              <motion.div whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <PrimeDexLogo className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300 drop-shadow-[0_0_8px_rgba(227,53,13,0.3)] group-hover:drop-shadow-[0_0_16px_rgba(227,53,13,0.6)]" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter flex items-center leading-none">
                  <span className="gradient-text-primary">Prime</span>
                  <span className="text-foreground">Dex</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5 min-h-[14px]">
                  {mounted && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] md:text-[11px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/35">
                          {caughtCount} / 1025
                        </span>
                        <div className="w-12 h-[3px] rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* ── NAV PILLS ── */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] dark:bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] p-1 rounded-full">
            <HeaderLink href="/team" variant="ghost" size="sm" className="gap-2 font-black uppercase tracking-[0.15em] text-[10px] text-foreground/60 hover:text-primary">
              <Users className="w-3.5 h-3.5" /> {t('nav.team')}
            </HeaderLink>
            <div className="w-px h-4 bg-white/10" />
            <HeaderLink href="/types" variant="ghost" size="sm" className="gap-2 font-black uppercase tracking-[0.15em] text-[10px] text-foreground/60 hover:text-primary">
              <Sparkles className="w-3.5 h-3.5" /> {t('nav.types')}
            </HeaderLink>
            <div className="w-px h-4 bg-white/10" />
            <HeaderLink href="/moves" variant="ghost" size="sm" className="gap-2 font-black uppercase tracking-[0.15em] text-[10px] text-foreground/60 hover:text-primary">
              <Swords className="w-3.5 h-3.5" /> {t('nav.moves')}
            </HeaderLink>
            <div className="w-px h-4 bg-white/10" />
            <HeaderLink href="/quiz" variant="ghost" size="sm" className="gap-2 font-black uppercase tracking-[0.15em] text-[10px] text-foreground/60 hover:text-primary">
              <BrainCircuit className="w-3.5 h-3.5" /> {t('nav.quiz')}
            </HeaderLink>
          </nav>

          {/* ── ACTIONS ── */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-3">
            <div className="hidden md:flex flex-col relative group mr-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 group-hover:text-primary transition-colors duration-300" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={localSearch || ''}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-[10px] sm:text-xs font-bold rounded-full pl-9 pr-4 py-2 w-32 focus:w-48 lg:w-48 lg:focus:w-64 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/[0.06] text-foreground placeholder-foreground/30 shadow-sm"
                />
              </div>

              <AnimatePresence>
                {isSearchFocused && localSearch && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 right-0 w-64 bg-background/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                  >
                    <div className="flex flex-col gap-1">
                      {searchResults.map((pokemon) => {
                        const speciesNames = pokemon.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames || [];
                        const localized = speciesNames.find(sn => sn.pokemon_v2_language?.name === resolvedLang);
                        const displayName = localized?.name || pokemon.name;
                        
                        return (
                          <button
                            key={pokemon.name}
                            onClick={() => {
                              router.push(`/pokemon/${pokemon.name}`);
                              setLocalSearch(''); 
                              setSearchTerm('');
                              setIsSearchFocused(false);
                            }}
                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/10 transition-colors text-left group/item cursor-pointer"
                          >
                            <div className="w-8 h-8 relative rounded-full bg-white/5 flex-shrink-0 p-1 flex items-center justify-center">
                              <Image
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                alt={displayName}
                                width={32}
                                height={32}
                                className="object-contain drop-shadow-md group-hover/item:scale-110 transition-transform"
                                unoptimized
                              />
                            </div>
                            <span className="text-xs font-black capitalize flex-1 truncate text-foreground/80 group-hover/item:text-primary">{displayName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Link href="/favorites" aria-label={t('header.open_favorites')}>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="p-2.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-foreground/60 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-300 shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="hidden xl:inline text-[10px] font-black uppercase tracking-[0.15em] px-0.5">{t('nav.favorites')}</span>
                  </motion.div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-bold">
                {t('nav.favorites')}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={cycleLanguage}
                  className="p-2.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-foreground/60 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 shadow-sm min-w-[42px] flex items-center justify-center gap-1.5"
                  aria-label={t('header.change_language')}
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">{languageLabel}</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-bold">
                {t('header.language_title', { language: languageLabel })}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={cycleTheme}
                  className="p-2.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-foreground/60 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all duration-300 shadow-sm"
                  aria-label={t('settings.theme_toggle')}
                >
                  {!mounted ? (
                    <div className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  ) : isDark ? (
                    <Moon className="w-4 h-4 md:w-[18px] md:h-[18px] text-blue-400" />
                  ) : (
                    <Sun className="w-4 h-4 md:w-[18px] md:h-[18px] text-amber-500" />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-bold">
                {themeLabel}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: 60 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={toggleSettings}
                  className="p-2.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-foreground/60 hover:text-foreground hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 shadow-sm"
                  aria-label={t('header.open_settings')}
                >
                  <Settings className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </motion.button>
              </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-bold">
                {t('settings.title')}
              </TooltipContent>
            </Tooltip>

            {/* ── MOBILE MENU ── */}
            <div className="flex lg:hidden items-center">
              <Sheet>
                <SheetTrigger render={
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="p-2.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-foreground/60 hover:text-foreground hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 shadow-sm min-w-[42px] flex items-center justify-center gap-1.5"
                    aria-label={t('header.open_menu') || 'Menu'}
                  >
                    <Menu className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </motion.button>
                } />
                <SheetContent side="right" className="w-[85vw] max-w-[350px] p-0 bg-background/95 backdrop-blur-3xl border-l border-white/10">
                  <SheetHeader className="p-6 border-b border-white/5">
                    <SheetTitle className="text-left font-black tracking-tighter flex items-center text-2xl">
                      <span className="gradient-text-primary">Prime</span>
                      <span className="text-foreground">Dex</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col p-4 gap-2">
                    <SheetClose render={
                      <Link href="/" className="flex items-center gap-4 p-4 rounded-2xl text-base font-black uppercase tracking-widest text-foreground/70 hover:text-primary hover:bg-white/5 transition-all">
                        <PrimeDexLogo className="w-5 h-5 flex-shrink-0" /> {t('header.home_aria')}
                      </Link>
                    } />
                    <SheetClose render={
                      <Link href="/team" className="flex items-center gap-4 p-4 rounded-2xl text-base font-black uppercase tracking-widest text-foreground/70 hover:text-primary hover:bg-white/5 transition-all">
                        <Users className="w-5 h-5 flex-shrink-0" /> {t('nav.team')}
                      </Link>
                    } />
                    <SheetClose render={
                      <Link href="/compare" className="flex items-center gap-4 p-4 rounded-2xl text-base font-black uppercase tracking-widest text-foreground/70 hover:text-primary hover:bg-white/5 transition-all">
                        <ArrowLeftRight className="w-5 h-5 flex-shrink-0" /> {t('nav.compare')}
                      </Link>
                    } />
                    <SheetClose render={
                      <Link href="/types" className="flex items-center gap-4 p-4 rounded-2xl text-base font-black uppercase tracking-widest text-foreground/70 hover:text-primary hover:bg-white/5 transition-all">
                        <Sparkles className="w-5 h-5 flex-shrink-0" /> {t('nav.types')}
                      </Link>
                    } />
                    <SheetClose render={
                      <Link href="/moves" className="flex items-center gap-4 p-4 rounded-2xl text-base font-black uppercase tracking-widest text-foreground/70 hover:text-primary hover:bg-white/5 transition-all">
                        <Swords className="w-5 h-5 flex-shrink-0" /> {t('nav.moves')}
                      </Link>
                    } />
                    <SheetClose render={
                      <Link href="/quiz" className="flex items-center gap-4 p-4 rounded-2xl text-base font-black uppercase tracking-widest text-foreground/70 hover:text-primary hover:bg-white/5 transition-all">
                        <BrainCircuit className="w-5 h-5 flex-shrink-0" /> {t('nav.quiz')}
                      </Link>
                    } />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.div>
      </header>
      <SettingsModal />
    </>
  );
}
