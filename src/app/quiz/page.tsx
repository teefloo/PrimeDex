'use client';

import Header from '@/components/layout/Header';
import { useQuery } from '@tanstack/react-query';
import { 
  getAllPokemonSummary,
  getPokemonDetail, 
  getPokemonByGeneration, 
  getPokemonByType 
} from '@/lib/api';
import { 
  Gamepad2, 
  Trophy, 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Filter,
  BarChart3,
  Calendar,
  EyeOff,
  Heart,
  Flame,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { PokemonDetail } from '@/types/pokemon';
import { useTranslation } from '@/lib/i18n';
import { usePrimeDexStore } from '@/store/primedex';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useMounted } from '@/hooks/useMounted';

type GameMode = 'time-attack' | 'survival' | 'marathon';
type QuizChallenge = 'classic' | 'silhouette' | 'stats';
type GameState = 'idle' | 'loading' | 'playing' | 'answered' | 'finished';

const GENERATIONS = [
  { id: '1', name: 'Gen 1' },
  { id: '2', name: 'Gen 2' },
  { id: '3', name: 'Gen 3' },
  { id: '4', name: 'Gen 4' },
  { id: '5', name: 'Gen 5' },
  { id: '6', name: 'Gen 6' },
  { id: '7', name: 'Gen 7' },
  { id: '8', name: 'Gen 8' },
  { id: '9', name: 'Gen 9' },
];

const TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Simple seeded random
const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ h >>> 16, 0x85ebca6b);
    h = Math.imul(h ^ h >>> 13, 0xc2b2ae35);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <QuizPageContent />
    </Suspense>
  );
}

function QuizPageContent() {
  const searchParams = useSearchParams();
  const targetPokemon = searchParams?.get('pokemon');

  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('marathon');
  const [quizChallenge, setQuizChallenge] = useState<QuizChallenge>('classic');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lives, setLives] = useState(3);
  const [currentPokemon, setCurrentPokemon] = useState<PokemonDetail | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedGen, setSelectedGen] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filteredPool, setFilteredPool] = useState<Array<{ name: string }>>([]);
  const [isDaily, setIsDaily] = useState(false);
  const [dailyIndex, setDailyIndex] = useState(0);
  
  const { t, i18n } = useTranslation();
  const { language, systemLanguage, quizHighScores, updateQuizHighScore, addBadge, badges } = usePrimeDexStore();
  const mounted = useMounted();

  const resolvedLang = mounted 
    ? (language === 'auto' ? systemLanguage : language) 
    : i18n.language || 'en';

  const { data: allNames } = useQuery({
    queryKey: ['allPokemonSummary'],
    queryFn: getAllPokemonSummary,
    staleTime: 30 * 60 * 1000,
  });

  const getLocalizedName = useCallback((internalName: string) => {
    if (!allNames) return internalName;
    const summary = allNames.find((p) => p.name === internalName);
    if (!summary) return internalName;
    
    const speciesNames = summary.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames || [];
    const localized = speciesNames.find((sn) => sn.pokemon_v2_language?.name === resolvedLang);
    return localized?.name || internalName;
  }, [allNames, resolvedLang]);

  // Handle target pokemon from query params
  useEffect(() => {
    if (mounted && targetPokemon && gameState === 'idle' && allNames) {
      const startTargetQuiz = async () => {
        setGameState('loading');
        setQuizChallenge('classic');
        setGameMode('marathon');
        
        try {
          const detail = await getPokemonDetail(targetPokemon);
          setCurrentPokemon(detail);
          
          const otherOptions: string[] = [];
          while (otherOptions.length < 3) {
            const idx = Math.floor(Math.random() * allNames.length);
            const p = allNames[idx];
            if (p.name !== targetPokemon && !otherOptions.includes(p.name)) {
              otherOptions.push(p.name);
            }
          }
          setOptions([targetPokemon, ...otherOptions].sort(() => Math.random() - 0.5));
          setGameState('playing');
        } catch {
          toast.error(t('quiz.fetch_failed'));
          setGameState('idle');
        }
      };
      startTargetQuiz();
    }
  }, [mounted, targetPokemon, allNames, gameState, t]);

  const getNextPokemon = useCallback(() => {
    const pool = filteredPool.length > 0 ? filteredPool : (allNames || []);
    if (pool.length === 0) return null;

    if (isDaily) {
      const today = new Date().toISOString().split('T')[0];
      const rng = seededRandom(`${today}-${dailyIndex}`);
      const randomIndex = Math.floor(rng() * pool.length);
      return pool[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    }
  }, [allNames, filteredPool, isDaily, dailyIndex]);

  const startNewRound = useCallback(async () => {
    if (isDaily && dailyIndex >= 9) {
      setGameState('finished');
      return;
    }

    const pokemon = getNextPokemon();
    if (!pokemon) return;
    
    setGameState('loading');
    setSelectedOption(null);
    setIsCorrect(null);
    
    const detail = await getPokemonDetail(pokemon.name);
    setCurrentPokemon(detail);

    const otherOptions: string[] = [];
    const mainPool = allNames || [];
    
    // For Daily Challenge, seeded options too
    const today = new Date().toISOString().split('T')[0];
    const rngSeed = isDaily ? `${today}-${dailyIndex}` : Math.random().toString();
    const rng = seededRandom(`options-${rngSeed}`);
    
    while (otherOptions.length < 3) {
      const idx = Math.floor(rng() * mainPool.length);
      const p = mainPool[idx];
      if (p.name !== pokemon.name && !otherOptions.includes(p.name)) {
        otherOptions.push(p.name);
      }
    }

    setOptions([pokemon.name, ...otherOptions].sort(() => rng() - 0.5));
    setGameState('playing');
  }, [allNames, getNextPokemon, isDaily, dailyIndex]);

  const startGame = async (challenge: QuizChallenge, mode: GameMode = 'marathon', daily: boolean = false) => {
    setGameState('loading');
    setIsDaily(daily);
    setDailyIndex(0);
    setQuizChallenge(challenge);
    setGameMode(mode);
    
    let pool: Array<{ name: string; url?: string }> = allNames?.map((p) => ({ name: p.name })) || [];
    
    if (selectedGen || selectedType) {
      const genPool = selectedGen ? await getPokemonByGeneration(selectedGen) : null;
      const typePool = selectedType ? await getPokemonByType(selectedType) : null;
      
      if (genPool && typePool) {
        pool = genPool.filter(p1 => typePool!.some(p2 => p2.name === p1.name));
      } else if (genPool) {
        pool = genPool;
      } else if (typePool) {
        pool = typePool;
      }
    }

    if (pool.length < 4) {
      toast.error(t('quiz.not_enough'));
      setGameState('idle');
      return;
    }

    setFilteredPool(pool);
    setScore(0);
    setLives(3);
    setTimeLeft(30);
    
    const today = new Date().toISOString().split('T')[0];
    const firstRng = daily ? seededRandom(`${today}-0`) : Math.random;
    const firstPokemon = pool[Math.floor((typeof firstRng === 'function' ? firstRng() : Math.random()) * pool.length)];
    
    const detail = await getPokemonDetail(firstPokemon.name);
    setCurrentPokemon(detail);

    const otherOptions: string[] = [];
    const mainPool = allNames || [];
    const optionsRng = daily ? seededRandom(`options-${today}-0`) : Math.random;

    while (otherOptions.length < 3) {
      const idx = Math.floor((typeof optionsRng === 'function' ? optionsRng() : Math.random()) * mainPool.length);
      const p = mainPool[idx];
      if (p.name !== firstPokemon.name && !otherOptions.includes(p.name)) {
        otherOptions.push(p.name);
      }
    }

    setOptions([firstPokemon.name, ...otherOptions].sort(() => (typeof optionsRng === 'function' ? optionsRng() : Math.random()) - 0.5));
    setGameState('playing');
  };

  const handleAnswer = (option: string) => {
    if (gameState !== 'playing' || !currentPokemon) return;
    
    setSelectedOption(option);
    const correct = option === currentPokemon.name;
    setIsCorrect(correct);
    setGameState('answered');

    if (correct) {
      setScore(s => {
        const newScore = s + (gameMode === 'time-attack' ? 10 : 1);
        
        // Badge logic
        if (newScore >= 10 && gameMode === 'marathon') addBadge('quiz-novice');
        if (newScore >= 50 && gameMode === 'marathon') addBadge('quiz-master');
        if (newScore >= 100 && gameMode === 'time-attack') addBadge('speed-demon');
        if (quizChallenge === 'silhouette' && newScore >= 20) addBadge('eagle-eye');
        if (quizChallenge === 'stats' && newScore >= 20) addBadge('professor');
        
        return newScore;
      });
      
      if (isDaily) {
        setDailyIndex(i => i + 1);
      }
      
      if (targetPokemon) {
        setTimeout(() => {
          setGameState('finished');
          toast.success(t('quiz.targeted_finish'));
        }, 1500);
      } else {
        setTimeout(startNewRound, 1500);
      }
    } else {
      if (isDaily) {
        setDailyIndex(i => i + 1);
      }
      if (gameMode === 'survival') {
        setLives(l => {
          if (l <= 1) {
            setGameState('finished');
            return 0;
          }
          return l - 1;
        });
      }
      setTimeout(startNewRound, 2000);
    }
  };

  useEffect(() => {
    if (gameState === 'finished' && !isDaily) {
      updateQuizHighScore(quizChallenge, score);
    }
  }, [gameState, quizChallenge, score, updateQuizHighScore, isDaily]);

  useEffect(() => {
    if (gameMode === 'time-attack' && (gameState === 'playing' || gameState === 'answered')) {
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
  }, [gameState, gameMode]);

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
            <div className="space-y-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel p-8 md:p-12 rounded-[3rem] space-y-8"
              >
                {gameState === 'finished' && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-6 bg-yellow-500/10 rounded-full border border-yellow-500/20 animate-bounce">
                        <Trophy className="w-16 h-16 text-yellow-500" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black">{t('quiz.game_over')}</h3>
                    <p className="text-xl font-bold text-foreground/60">
                      {isDaily ? t('quiz.daily_score') : t('quiz.final_score')} 
                      <span className="text-primary text-2xl ml-2">{score}</span>
                    </p>
                  </div>
                )}

                {/* Daily Challenge */}
                <Button 
                  onClick={() => startGame('classic', 'marathon', true)}
                  className="w-full h-20 rounded-2xl font-black uppercase tracking-widest text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 border-none shadow-xl shadow-orange-500/20 gap-3"
                >
                  <Calendar className="w-6 h-6" />
                  {t('quiz.daily')}
                </Button>

                {/* Filters */}
                <div className="space-y-6 bg-secondary/20 p-6 rounded-[2rem] border border-white/5 text-center">
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{t('quiz.customize')}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">{t('filters.generation')}</p>
                      <select 
                        value={selectedGen || ''} 
                        onChange={(e) => setSelectedGen(e.target.value || null)}
                        className="w-full h-12 rounded-xl bg-background/50 border border-white/10 px-4 text-sm font-bold appearance-none cursor-pointer focus:border-primary/50 transition-colors"
                      >
                        <option value="">{t('quiz.all_generations')}</option>
                        {GENERATIONS.map(gen => (
                          <option key={gen.id} value={gen.id}>{gen.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">{t('filters.types')}</p>
                      <select 
                        value={selectedType || ''} 
                        onChange={(e) => setSelectedType(e.target.value || null)}
                        className="w-full h-12 rounded-xl bg-background/50 border border-white/10 px-4 text-sm font-bold appearance-none cursor-pointer focus:border-primary/50 transition-colors"
                      >
                        <option value="">{t('quiz.all_types')}</option>
                        {TYPES.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'classic' as QuizChallenge, name: t('quiz.classic'), icon: <Gamepad2 className="w-5 h-5" />, desc: t('quiz.classic_desc') || 'Show image' },
                    { id: 'silhouette' as QuizChallenge, name: t('quiz.silhouette'), icon: <EyeOff className="w-5 h-5" />, desc: t('quiz.silhouette_desc') || 'Who\'s that?' },
                    { id: 'stats' as QuizChallenge, name: t('quiz.stats_mode'), icon: <BarChart3 className="w-5 h-5" />, desc: t('quiz.stats_desc') || 'Base stats' }
                  ].map((mode) => (
                    <Button 
                      key={mode.id}
                      onClick={() => startGame(mode.id)} 
                      className="h-24 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <div className="flex items-center gap-2">
                        {mode.icon}
                        {mode.name}
                      </div>
                      <span className="text-[10px] opacity-50 font-bold">{mode.desc}</span>
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => startGame(quizChallenge, 'time-attack')} 
                    className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs border-white/10 hover:bg-primary/10 flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      {t('quiz.time_attack')} (30s)
                    </div>
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => startGame(quizChallenge, 'survival')} 
                    className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs border-white/10 hover:bg-red-500/10 flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      {t('quiz.survival')} (3 {t('quiz.lives')})
                    </div>
                  </Button>
                </div>

                {quizHighScores && (
                  <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">{t('quiz.classic')}</p>
                      <p className="text-xl font-black text-primary">{quizHighScores.classic}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">{t('quiz.silhouette')}</p>
                      <p className="text-xl font-black text-primary">{quizHighScores.silhouette}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">{t('quiz.stats_mode')}</p>
                      <p className="text-xl font-black text-primary">{quizHighScores.stats}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Badges Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-8 rounded-[3rem] space-y-6"
              >
                <h3 className="text-xl font-black flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  {t('quiz.achievements')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: 'quiz-novice', name: t('quiz.badge_novice'), icon: <Gamepad2 />, desc: t('quiz.badge_novice_desc') },
                    { id: 'quiz-master', name: t('quiz.badge_master'), icon: <Trophy />, desc: t('quiz.badge_master_desc') },
                    { id: 'speed-demon', name: t('quiz.badge_speed_demon'), icon: <Zap />, desc: t('quiz.badge_speed_demon_desc') },
                    { id: 'eagle-eye', name: t('quiz.badge_eagle_eye'), icon: <EyeOff />, desc: t('quiz.badge_eagle_eye_desc') },
                    { id: 'professor', name: t('quiz.badge_professor'), icon: <BrainCircuit />, desc: t('quiz.badge_professor_desc') },
                  ].map(badge => {
                    const isUnlocked = badges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                          isUnlocked 
                            ? "bg-primary/10 border-primary/20 text-primary" 
                            : "bg-secondary/10 border-white/5 text-foreground/20"
                        )}
                      >
                        <div className={cn("p-2 rounded-xl", isUnlocked ? "bg-primary/20" : "bg-secondary/20")}>
                          {badge.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{badge.name}</span>
                        {isUnlocked && <span className="text-[8px] font-medium opacity-60 text-center leading-tight">{badge.desc}</span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center px-6">
                <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3">
                  {gameMode === 'marathon' ? <Flame className="w-5 h-5 text-orange-500" /> : <Trophy className="w-5 h-5 text-yellow-500" />}
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-tighter">{t('quiz.score_current')}</span>
                    <span className="font-black text-xl tabular-nums leading-none">{score}</span>
                  </div>
                </div>

                <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-tighter">{t('quiz.score_high')}</span>
                    <span className="font-black text-xl tabular-nums leading-none">
                      {isDaily ? '-' : quizHighScores[quizChallenge]}
                    </span>
                  </div>
                </div>
                
                {gameMode === 'time-attack' && (
                  <div className={cn(
                    "glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 transition-colors",
                    timeLeft < 10 ? "border-red-500/50 bg-red-500/10 text-red-500" : ""
                  )}>
                    <Timer className={cn("w-5 h-5", timeLeft < 10 && "animate-pulse")} />
                    <span className="font-black text-xl tabular-nums">{timeLeft}s</span>
                  </div>
                )}

                {gameMode === 'survival' && (
                  <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Heart 
                          key={i} 
                          className={cn("w-5 h-5", i < lives ? "text-red-500 fill-current" : "text-foreground/10")} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isDaily && (
                  <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 border-orange-500/30">
                    <div className="flex flex-col items-start">
                      <span className="text-[8px] font-black text-orange-500/60 uppercase tracking-tighter">{t('quiz.progress')}</span>
                      <span className="font-black text-xl tabular-nums leading-none">{dailyIndex}/10</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative min-h-[20rem] flex items-center justify-center">
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
                      className="w-full flex flex-col items-center"
                    >
                      {quizChallenge === 'stats' ? (
                        <div className="glass-panel p-8 rounded-[2rem] w-full max-w-md space-y-4">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 mb-4">{t('quiz.who_stats')}</p>
                          {[
                            { label: t('stats.hp_short'), val: currentPokemon.stats[0].base_stat, color: '#FF0000' },
                            { label: t('stats.attack_short'), val: currentPokemon.stats[1].base_stat, color: '#F08030' },
                            { label: t('stats.defense_short'), val: currentPokemon.stats[2].base_stat, color: '#F8D030' },
                            { label: t('stats.special_attack_short'), val: currentPokemon.stats[3].base_stat, color: '#6890F0' },
                            { label: t('stats.special_defense_short'), val: currentPokemon.stats[4].base_stat, color: '#78C850' },
                            { label: t('stats.speed_short'), val: currentPokemon.stats[5].base_stat, color: '#F85888' },
                          ].map(s => (
                            <div key={s.label} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black">
                                <span>{s.label}</span>
                                <span>{gameState === 'answered' ? s.val : '???'}</span>
                              </div>
                              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(s.val / 255) * 100}%` }}
                                  className="h-full"
                                  style={{ backgroundColor: s.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative w-64 h-64">
                          <Image 
                            src={currentPokemon.sprites.other['official-artwork'].front_default || currentPokemon.sprites.front_default} 
                            alt="Mystery Pokemon"
                            width={256}
                            height={256}
                            className={cn(
                              "w-full h-full object-contain transition-all duration-700 drop-shadow-2xl",
                              gameState === 'playing' && quizChallenge === 'silhouette' ? "brightness-0 contrast-100 opacity-80" : "brightness-100"
                            )}
                          />
                        </div>
                      )}
                      
                      {gameState === 'answered' && (
                        <motion.div 
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="mt-4"
                        >
                          {isCorrect ? (
                            <div className="bg-green-500 text-white px-6 py-2 rounded-full shadow-lg shadow-green-500/50 flex items-center gap-2 font-black uppercase text-xs">
                              <CheckCircle2 className="w-4 h-4" /> {t('quiz.correct')}
                            </div>
                          ) : (
                            <div className="bg-red-500 text-white px-6 py-2 rounded-full shadow-lg shadow-red-500/50 flex items-center gap-2 font-black uppercase text-xs">
                              <AlertCircle className="w-4 h-4" /> {t('quiz.wrong')}
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
                    {getLocalizedName(option)}
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


