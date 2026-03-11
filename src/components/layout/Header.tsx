'use client';

import Link from 'next/link';
import { Gamepad2, Settings, Github, Sun, Moon } from 'lucide-react';
import { usePokedexStore } from '@/store/pokedex';
import SettingsModal from './SettingsModal';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const { toggleSettings, theme, setTheme } = usePokedexStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Avoid synchronous setState in effect
    const timer = setTimeout(() => setMounted(true), 0);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
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

          <div className="flex items-center gap-2 md:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleTheme}
              className="p-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-foreground hover:bg-accent transition-colors"
              title={`Theme: ${theme}`}
              aria-label={`Switch theme (currently ${theme})`}
            >
              {mounted && isDark ? (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
              )}
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/Teeflo/Poke"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-foreground hover:bg-accent transition-colors hidden sm:flex"
              title="View Source"
              aria-label="View source code on GitHub"
            >
              <Github className="w-4 h-4 md:w-5 md:h-5" />
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSettings}
              className="p-2.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-foreground hover:bg-accent transition-colors"
              title="Settings"
              aria-label="Open settings"
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
