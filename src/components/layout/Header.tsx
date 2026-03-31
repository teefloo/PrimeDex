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
  Sparkles
} from 'lucide-react';
import { usePrimeDexStore } from '@/store/primedex';
import SettingsModal from './SettingsModal';
import { useEffect, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import PrimeDexLogo from '@/components/ui/PrimeDexLogo';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const { toggleSettings, theme, setTheme, caughtPokemon, language, setLanguage } = usePrimeDexStore();
  const { t, i18n } = useTranslation();
  const mounted = useMounted();
  const [scrolled, setScrolled] = useState(false);

  const languageLabel = mounted ? (language === 'auto' ? t('settings.auto') : language.toUpperCase()) : 'EN';
  const themeLabel = mounted
    ? (theme === 'system' ? t('settings.system') : theme === 'dark' ? t('settings.dark') : t('settings.light'))
    : t('settings.system');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
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
    i18n.changeLanguage(nextLang);
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
            'mx-auto flex items-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
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
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-foreground/35">
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
            <HeaderLink href="/quiz" variant="ghost" size="sm" className="gap-2 font-black uppercase tracking-[0.15em] text-[10px] text-foreground/60 hover:text-primary">
              <BrainCircuit className="w-3.5 h-3.5" /> {t('nav.quiz')}
            </HeaderLink>
          </nav>

          {/* ── ACTIONS ── */}
          <div className="flex-1 flex items-center justify-end gap-1.5 md:gap-2">
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
          </div>
        </motion.div>
      </header>
      <SettingsModal />
    </>
  );
}
