'use client';

import Header from '@/components/layout/Header';
import { useQuery } from '@tanstack/react-query';
import { getAllPokemonNames, getPokemonDetail } from '@/lib/api';
import { 
  Gamepad2, 
  Trophy, 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { PokemonDetail } from '@/types/pokemon';
import { useTranslation } from 'react-i18next';

type GameState = 'idle' | 'loading' | 'playing' | 'answered' | 'finished';

export default function QuizPage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentPokemon, setCurrentPokemon] = useState<PokemonDetail | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: allNames } = useQuery({
    queryKey: ['allPokemonNames'],
    queryFn: getAllPokemonNames,
    staleTime: 30 * 60 * 1000,
  });

  const startNewRound = useCallback(async () => {
    if (!allNames) return;
    
    setGameState('loading');
    setSelectedOption(null);
    setIsCorrect(null);

    const randomIndex = Math.floor(Math.random() * Math.min(allNames.length, 1025));
    const pokemon = allNames[randomIndex];
    
    const detail = await getPokemonDetail(pokemon.name);
    setCurrentPokemon(detail);

    const otherOptions: string[] = [];
    while (otherOptions.length < 3) {
      const idx = Math.floor(Math.random() * Math.min(allNames.length, 1025));
      const p = allNames[idx];
      if (p.name !== pokemon.name && !otherOptions.includes(p.name)) {
        otherOptions.push(p.name);
      }
    }

    setOptions([pokemon.name, ...otherOptions].sort(() => Math.random() - 0.5));
    setGameState('playing');
  }, [allNames]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    startNewRound();
  };

  const handleAnswer = (option: string) => {
    if (gameState !== 'playing' || !currentPokemon) return;
    
    setSelectedOption(option);
    const correct = option === currentPokemon.name;
    setIsCorrect(correct);
    setGameState('answered');

    if (correct) {
      setScore(s => s + 10);
      setTimeout(startNewRound, 1500);
    } else {
      setTimeout(startNewRound, 2000);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' || gameState === 'answered') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished');
            clearInterval(timer);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10 max-w-4xl text-center">
        <section className="mb-12 pt-10">
          <div className="inline-block p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-6">
            <Gamepad2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-5xl font-black tracking-tight mb-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{t('quiz.title')}</h2>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">{t('quiz.subtitle')}</p>
        </section>

        <div className="max-w-2xl mx-auto">
          {gameState === 'idle' || gameState === 'finished' ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel p-12 rounded-[3rem] space-y-8"
            >
              {gameState === 'finished' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-6 bg-yellow-500/10 rounded-full border border-yellow-500/20 animate-bounce">
                      <Trophy className="w-16 h-16 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black">{t('quiz.game_over')}</h3>
                  <p className="text-xl font-bold text-foreground/60">{t('quiz.final_score')} <span className="text-primary text-2xl">{score}</span></p>
                </div>
              )}
              
              <div className="space-y-4">
                <Button 
                  onClick={startGame} 
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {gameState === 'idle' ? t('quiz.start') : t('quiz.try_again')}
                </Button>
                <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Timer className="w-3 h-3" /> {t('quiz.instructions')}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center px-6">
                <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-black text-xl tabular-nums">{score}</span>
                </div>
                
                <div className={cn(
                  "glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 transition-colors",
                  timeLeft < 10 ? "border-red-500/50 bg-red-500/10 text-red-500" : ""
                )}>
                  <Timer className={cn("w-5 h-5", timeLeft < 10 && "animate-pulse")} />
                  <span className="font-black text-xl tabular-nums">{timeLeft}s</span>
                </div>
              </div>

              <div className="relative h-80 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] opacity-50" />
                
                <AnimatePresence mode="wait">
                  {gameState === 'loading' ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader2 className="w-16 h-16 animate-spin text-primary/40" />
                    </motion.div>
                  ) : currentPokemon ? (
                    <motion.div
                      key={currentPokemon.id}
                      initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      className="relative w-64 h-64"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={currentPokemon.sprites.other['official-artwork'].front_default || currentPokemon.sprites.front_default} 
                        alt="Mystery Pokemon"
                        className={cn(
                          "w-full h-full object-contain transition-all duration-700 drop-shadow-2xl",
                          gameState === 'playing' ? "brightness-0 contrast-100 opacity-80" : "brightness-100"
                        )}
                      />
                      
                      {gameState === 'answered' && (
                        <motion.div 
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-4 -right-4 z-20"
                        >
                          {isCorrect ? (
                            <div className="bg-green-500 text-white p-3 rounded-full shadow-lg shadow-green-500/50">
                              <CheckCircle2 className="w-8 h-8" />
                            </div>
                          ) : (
                            <div className="bg-red-500 text-white p-3 rounded-full shadow-lg shadow-red-500/50">
                              <AlertCircle className="w-8 h-8" />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map((option) => (
                  <button
                    key={option}
                    disabled={gameState !== 'playing'}
                    onClick={() => handleAnswer(option)}
                    className={cn(
                      "h-16 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-2",
                      gameState === 'playing' 
                        ? "bg-secondary/20 border-white/5 hover:border-primary/50 hover:bg-primary/5 active:scale-95" 
                        : selectedOption === option
                          ? isCorrect 
                            ? "bg-green-500/20 border-green-500 text-green-500" 
                            : "bg-red-500/20 border-red-500 text-red-500"
                          : option === currentPokemon?.name && gameState === 'answered'
                            ? "bg-green-500/20 border-green-500/50 text-green-500 opacity-80"
                            : "bg-secondary/10 border-white/5 opacity-40"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
