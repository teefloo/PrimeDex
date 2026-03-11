'use client';

import Link, { LinkProps } from 'next/link';
import { 
  Settings, 
  Sun, 
  Moon, 
  Heart, 
  Users, 
  BrainCircuit,
  Languages
} from 'lucide-react';
import { usePokedexStore } from '@/store/pokedex';
import SettingsModal from './SettingsModal';
import { useEffect, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import PokedexLogo from '@/components/ui/PokedexLogo';

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
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        size === "sm" && "h-8 px-3 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { toggleSettings, theme, setTheme, caughtPokemon, language, setLanguage } = usePokedexStore();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => {
      clearTimeout(timer);
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

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out px-4 py-4 md:px-6 md:py-5",
          scrolled && "px-2 py-2 md:px-4 md:py-3"
        )}
      >
        <div 
          className={cn(
            "mx-auto flex items-center transition-all duration-500 ease-in-out",
            scrolled 
              ? "max-w-5xl bg-background/80 backdrop-blur-2xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-full px-4 py-2 md:px-6 md:py-3" 
              : "container bg-transparent px-2"
          )}
        >
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Go to Pokédex Home">
              <PokedexLogo className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tighter flex items-center drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(227,53,13,0.4)] transition-all leading-none">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                    Poké
                  </span>
                  dex
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/40">
                    {caughtPokemon.length} / 1025 {t('detail.caught_status') || 'CAUGHT'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-2 bg-secondary/40 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-sm">
            <HeaderLink href="/team" variant="ghost" size="sm" className="rounded-full gap-2 font-black uppercase tracking-widest text-[10.5px] hover:bg-primary/10 hover:text-primary transition-all">
              <Users className="w-3.5 h-3.5" /> {t('nav.team')}
            </HeaderLink>
            <HeaderLink href="/quiz" variant="ghost" size="sm" className="rounded-full gap-2 font-black uppercase tracking-widest text-[10.5px] hover:bg-primary/10 hover:text-primary transition-all">
              <BrainCircuit className="w-3.5 h-3.5" /> {t('nav.quiz')}
            </HeaderLink>
          </nav>

          <div className="flex-1 flex items-center justify-end gap-1.5 md:gap-2">
            <Link href="/favorites">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 md:p-2.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                title={t('nav.favorites')}
              >
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden xl:inline text-xs font-black uppercase tracking-widest px-1">{t('nav.favorites')}</span>
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleLanguage}
              className="p-2 md:p-2.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border text-foreground hover:bg-accent transition-colors shadow-sm min-w-[40px] md:min-w-[48px] flex items-center justify-center gap-1.5"
              title={`${t('settings.language')}: ${language}`}
            >
              <Languages className="w-4 h-4 text-foreground/40" />
              <span className="text-[10px] font-black uppercase">{language === 'auto' ? 'EN' : language}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleTheme}
              className="p-2 md:p-2.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border text-foreground hover:bg-accent transition-colors shadow-sm"
              title={`${t('settings.theme')}: ${theme}`}
              aria-label={t('settings.theme_toggle') || 'Toggle theme'}
            >
              {!mounted ? (
                <div className="w-4 h-4 md:w-5 md:h-5" />
              ) : isDark ? (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              ) : (
                <div className="w-4 h-4 md:w-5 md:h-5 text-amber-500 flex items-center justify-center">
                  <Sun className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, rotate: 45 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSettings}
              className="p-2 md:p-2.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border text-foreground hover:bg-accent transition-all shadow-sm"
              title={t('settings.title')}
              aria-label={t('settings.title') || 'Open settings'}
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
        </div>
      </header>
      <SettingsModal />
    </>
  );
}
