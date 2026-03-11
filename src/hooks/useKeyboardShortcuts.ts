'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePokedexStore } from '@/store/pokedex';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleSettings, setShowFavoritesOnly, showFavoritesOnly, compareList, team, theme, setTheme } = usePokedexStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      // Meta key shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
          break;
        case 'f':
          setShowFavoritesOnly(!showFavoritesOnly);
          break;
        case 'c':
          router.push('/compare');
          break;
        case 't':
          router.push('/team');
          break;
        case 'q':
          router.push('/quiz');
          break;
        case 's':
          toggleSettings();
          break;
        case 'h':
          router.push('/');
          break;
        case 'd':
          setTheme(theme === 'dark' ? 'light' : 'dark');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleSettings, setShowFavoritesOnly, showFavoritesOnly, compareList, team, theme, setTheme]);
}
