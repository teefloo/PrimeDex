'use client';

import Link from 'next/link';
import { 
  Gamepad2, 
  Settings, 
  Sun, 
  Moon, 
  Heart, 
  Users, 
  BrainCircuit 
} from 'lucide-react';
import { usePokedexStore } from '@/store/pokedex';
import SettingsModal from './SettingsModal';
import { useEffect, useState, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeaderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

function HeaderButton({ children, variant, size, className, ...props }: HeaderButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        size === "sm" && "h-8 px-3 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Header() {
  const { toggleSettings, theme, setTheme } = usePokedexStore();
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

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-background/60 backdrop-blur-xl border-b border-border shadow-sm py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Go to Pokédex Home">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-primary/80 to-primary text-white shadow-lg shadow-primary/20"
            >
              <Gamepad2 className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Poké
              </span>
              dex
            </h1>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-secondary/30 backdrop-blur-md border border-white/5 p-1 rounded-2xl">
            <Link href="/team">
              <HeaderButton variant="ghost" size="sm" className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 hover:text-primary transition-colors">
                <Users className="w-3.5 h-3.5" /> Team
              </HeaderButton>
            </Link>
            <Link href="/quiz">
              <HeaderButton variant="ghost" size="sm" className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 hover:text-primary transition-colors">
                <BrainCircuit className="w-3.5 h-3.5" /> Quiz
              </HeaderButton>
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/favorites">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2"
                title="View Favorites"
              >
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden xl:inline text-xs font-black uppercase tracking-widest px-1">Favorites</span>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleTheme}
              className="p-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-foreground hover:bg-accent transition-colors"
              title={`Theme: ${theme}`}
            >
              {mounted && isDark ? (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSettings}
              className="p-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-foreground hover:bg-accent transition-colors"
              title="Settings"
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
