'use client';

import { usePokedexStore } from '@/store/pokedex';
import { X, Volume2, VolumeX, Sun, Moon, Monitor, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'auto', name: 'Auto', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function SettingsModal() {
  const { isSettingsOpen, toggleSettings, soundEnabled, toggleSound, theme, setTheme, language, setLanguage } = usePokedexStore();
  const { t } = useTranslation();

  const themeOptions = [
    { value: 'light' as const, label: t('settings.light'), icon: Sun },
    { value: 'dark' as const, label: t('settings.dark'), icon: Moon },
    { value: 'system' as const, label: t('settings.system'), icon: Monitor },
  ];

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('settings.title')}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={toggleSettings}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative w-full max-w-sm rounded-[2rem] p-8 overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[50px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 blur-[50px] rounded-full" />

            <div className="relative z-10 flex justify-between items-center mb-8 pb-4 border-b border-white/10">
              <h2 className="text-2xl font-black text-foreground tracking-tight">{t('settings.title')}</h2>
              <button
                onClick={toggleSettings}
                className="p-2 rounded-full text-foreground/50 hover:bg-white/10 hover:text-foreground transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 space-y-8">
              {/* Sound Toggle */}
              <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl transition-colors ${soundEnabled ? 'text-primary bg-primary/20' : 'text-foreground/50 bg-white/5'}`}>
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <span className="font-bold text-foreground/80">{t('settings.sound')}</span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${soundEnabled ? 'bg-primary' : 'bg-white/10'}`}
                  aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
                  role="switch"
                  aria-checked={soundEnabled}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${soundEnabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>

              {/* Theme Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2.5 rounded-xl text-foreground/70 bg-secondary/30 border border-white/5">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-foreground/80">{t('settings.theme')}</span>
                </div>
                <div className="flex gap-3 bg-secondary/20 p-2 rounded-2xl border border-white/5">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all duration-300 ${theme === value
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-foreground/50 hover:bg-white/5 hover:text-foreground/80'
                        }`}
                      aria-pressed={theme === value}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2.5 rounded-xl text-foreground/70 bg-secondary/30 border border-white/5">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-foreground/80">{t('settings.language')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-secondary/20 p-2 rounded-2xl border border-white/5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center justify-center gap-2 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-300 ${language === lang.code
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-foreground/50 hover:bg-white/5 hover:text-foreground/80'
                        }`}
                    >
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span className="uppercase">{lang.code === 'auto' ? t('settings.auto') : lang.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-foreground/30 font-bold tracking-[0.2em] uppercase">
                  Pokédex Redesign v3.0
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
