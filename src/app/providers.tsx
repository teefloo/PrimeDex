'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { usePrimeDexStore } from '@/store/primedex';
import { I18nextProvider } from 'react-i18next';
import i18n, { loadLanguage } from '@/lib/i18n';
import { TooltipProvider } from '@/components/ui/tooltip';


function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setSystemLanguage, language, systemLanguage, _hasHydrated } = usePrimeDexStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    // Detect system language
    if (navigator.language) {
      const baseLang = navigator.language.split('-')[0];
      setSystemLanguage(baseLang);
    }

    const root = document.documentElement;

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);

      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, setSystemLanguage, _hasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) return;
    const resolvedLang = language === 'auto' ? systemLanguage : language;
    // Load language bundle on demand, then switch
    loadLanguage(resolvedLang).then(() => {
      i18n.changeLanguage(resolvedLang);
    });
    // Mirror to localStorage for synchronous initial boot on next reload
    localStorage.setItem('primedex-lang', resolvedLang);
  }, [language, systemLanguage, _hasHydrated]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20 animate-pulse">Initializing...</p>
        </div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
