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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
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
  const [wrongAnswers, setWrongAnswers] = useState(0);
  
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
    const basePool = filteredPool.length > 0 ? filteredPool : (allNames || []);
    const pool = basePool.filter((p) => !p.name.includes('-mega') && !p.name.includes('-primal') && !p.name.includes('-ultra'));
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
    if (gameState === 'finished') return;
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
  }, [allNames, getNextPokemon, isDaily, dailyIndex, gameState]);

  const startGame = async (challenge: QuizChallenge, mode: GameMode = 'marathon', daily: boolean = false) => {
    setGameState('loading');
    setIsDaily(daily);
    setDailyIndex(0);
    setQuizChallenge(challenge);
    setGameMode(mode);
    
    let pool: Array<{ name: string; url?: string }> = allNames
      ?.map((p) => ({ name: p.name }))
      .filter((p) => !p.name.includes('-mega') && !p.name.includes('-primal') && !p.name.includes('-ultra')) || [];
    
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
    setWrongAnswers(0);
    
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
          setTimeout(startNewRound, 2000);
          return l - 1;
        });
      } else if (gameMode === 'marathon') {
        setWrongAnswers(w => {
          const newW = w + 1;
          if (newW >= 5) {
            setGameState('finished');
            return 5;
          }
          setTimeout(startNewRound, 2000);
          return newW;
        });
      }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden pb-20">
      <Header />
      
      {/* Decorative background orbs like HeroSection */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/15 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/3 w-[200px] h-[100px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '-1.5s' }} />
        <div className="absolute top-2/3 right-1/4 w-[150px] h-[80px] bg-purple-500/8 rounded-full blur-[60px] animate-pulse-glow" style={{ animationDelay: '-3s' }} />
      </div>
      
      <main className="container mx-auto px-4 py-8 relative z-10 max-w-4xl text-center">
        {gameState === 'idle' || gameState === 'finished' ? (
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12 pt-14 flex flex-col items-center"
          >
            {/* Pill badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl mb-6 shadow-[0_0_15px_rgba(227,53,13,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/40">
                PrimeDex Challenge
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="inline-block p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-6 relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gamepad2 className="w-10 h-10 text-primary relative z-10" />
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-[0.9]">
              <span className="gradient-text-hero uppercase italic px-2">{t('quiz.title')}</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
              {t('quiz.subtitle')}
            </motion.p>
            
            {/* Decorative line */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mt-8 w-full">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
            </motion.div>
          </motion.section>
        ) : null}

        <div className="max-w-3xl mx-auto pt-4 relative">
          {gameState === 'idle' || gameState === 'finished' ? (
            <div className="space-y-8">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel p-6 md:p-12 rounded-[3rem] space-y-8 relative overflow-hidden"
              >
                {/* Inner glows */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[100px] pointer-events-none rounded-full" />

                {gameState === 'finished' && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { type: 'spring', bounce: 0.5 } }}
                    className="space-y-4 relative z-10"
                  >
                    <div className="flex justify-center">
                      <div className="p-6 bg-yellow-500/10 rounded-full border border-yellow-500/30 animate-pulse relative hover:scale-110 transition-transform cursor-default">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                        <Trophy className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] relative z-10" />
                      </div>
                    </div>
                    <h3 className="text-4xl font-black gradient-text-primary uppercase tracking-tighter">{t('quiz.game_over')}</h3>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground/50">
                      {isDaily ? t('quiz.daily_score') : t('quiz.final_score')} 
                    </p>
                    <p className="text-6xl font-black text-foreground drop-shadow-lg">{score}</p>
                  </motion.div>
                )}

                <div className="relative z-10 space-y-8">
                  {/* Daily Challenge */}
                  <button 
                    onClick={() => startGame('classic', 'marathon', true)}
                    className="w-full h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 border-none shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 pointer-events-none mix-blend-overlay" />
                    <Calendar className="w-6 h-6" />
                    {t('quiz.daily')}
                  </button>

                  {/* Filters */}
                  <div className="space-y-6 bg-black/20 p-6 md:p-8 rounded-[2rem] border border-white/5 text-center relative overflow-hidden backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <Filter className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{t('quiz.customize')}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-left relative">
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40 ml-2">{t('filters.generation')}</p>
                        <select 
                          value={selectedGen || ''} 
                          onChange={(e) => setSelectedGen(e.target.value || null)}
                          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm font-bold appearance-none cursor-pointer focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all hover:bg-white/10"
                        >
                          <option value="">{t('quiz.all_generations')}</option>
                          {GENERATIONS.map(gen => (
                            <option key={gen.id} value={gen.id} className="bg-background text-foreground">{gen.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 bottom-4 pointer-events-none text-foreground/30 text-xs">▼</div>
                      </div>

                      <div className="space-y-2 text-left relative">
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40 ml-2">{t('filters.types')}</p>
                        <select 
                          value={selectedType || ''} 
                          onChange={(e) => setSelectedType(e.target.value || null)}
                          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm font-bold appearance-none cursor-pointer focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all hover:bg-white/10"
                        >
                          <option value="">{t('quiz.all_types')}</option>
                          {TYPES.map(type => (
                            <option key={type} value={type} className="bg-background text-foreground">{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 bottom-4 pointer-events-none text-foreground/30 text-xs">▼</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'classic' as QuizChallenge, name: t('quiz.classic'), icon: <Gamepad2 className="w-5 h-5 group-hover:text-primary transition-colors" />, desc: t('quiz.classic_desc') || 'Show image' },
                      { id: 'silhouette' as QuizChallenge, name: t('quiz.silhouette'), icon: <EyeOff className="w-5 h-5 group-hover:text-primary transition-colors" />, desc: t('quiz.silhouette_desc') || 'Who\'s that?' },
                      { id: 'stats' as QuizChallenge, name: t('quiz.stats_mode'), icon: <BarChart3 className="w-5 h-5 group-hover:text-primary transition-colors" />, desc: t('quiz.stats_desc') || 'Base stats' }
                    ].map((mode) => (
                      <button 
                        key={mode.id}
                        onClick={() => startGame(mode.id)} 
                        className="glass-btn h-24 md:h-28 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-primary/40 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="flex items-center gap-2 font-black uppercase tracking-[0.15em] text-[10px] md:text-xs">
                          {mode.icon}
                          {mode.name}
                        </div>
                        <span className="text-[8px] md:text-[9px] opacity-40 font-bold tracking-wider">{mode.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => startGame(quizChallenge, 'time-attack')} 
                      className="glass-btn h-16 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-2 font-black uppercase tracking-[0.1em] text-[9px] md:text-[10px]">
                        <Timer className="w-4 h-4 group-hover:text-primary transition-colors" />
                        {t('quiz.time_attack')} <span className="opacity-50 ml-1">(30s)</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => startGame(quizChallenge, 'survival')} 
                      className="glass-btn h-16 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:border-red-500/40 hover:bg-red-500/5"
                    >
                      <div className="flex items-center gap-2 font-black uppercase tracking-[0.1em] text-[9px] md:text-[10px]">
                        <Heart className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                        {t('quiz.survival')} <span className="opacity-50 ml-1">(3 {t('quiz.lives')})</span>
                      </div>
                    </button>
                  </div>

                  {quizHighScores && (
                    <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-2 sm:gap-4 mt-8">
                      <div className="bg-black/20 rounded-xl p-3 text-center border border-white/5 hover:border-white/10 transition-colors">
                        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">{t('quiz.classic')}</p>
                        <p className="text-lg md:text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(227,53,13,0.3)]">{quizHighScores.classic}</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 text-center border border-white/5 hover:border-white/10 transition-colors">
                        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">{t('quiz.silhouette')}</p>
                        <p className="text-lg md:text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(227,53,13,0.3)]">{quizHighScores.silhouette}</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 text-center border border-white/5 hover:border-white/10 transition-colors">
                        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">{t('quiz.stats_mode')}</p>
                        <p className="text-lg md:text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(227,53,13,0.3)]">{quizHighScores.stats}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Badges Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel p-6 md:p-10 rounded-[3rem] space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 text-foreground/60">
                  <div className="w-6 md:w-8 h-px bg-gradient-to-r from-transparent to-yellow-500/50" />
                  <Trophy className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                  {t('quiz.achievements')}
                  <div className="w-6 md:w-8 h-px bg-gradient-to-l from-transparent to-yellow-500/50" />
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { id: 'quiz-novice', name: t('quiz.badge_novice'), icon: <Gamepad2 className="w-6 h-6" />, desc: t('quiz.badge_novice_desc') },
                    { id: 'quiz-master', name: t('quiz.badge_master'), icon: <Trophy className="w-6 h-6" />, desc: t('quiz.badge_master_desc') },
                    { id: 'speed-demon', name: t('quiz.badge_speed_demon'), icon: <Zap className="w-6 h-6" />, desc: t('quiz.badge_speed_demon_desc') },
                    { id: 'eagle-eye', name: t('quiz.badge_eagle_eye'), icon: <EyeOff className="w-6 h-6" />, desc: t('quiz.badge_eagle_eye_desc') },
                    { id: 'professor', name: t('quiz.badge_professor'), icon: <BrainCircuit className="w-6 h-6" />, desc: t('quiz.badge_professor_desc') },
                  ].map(badge => {
                    const isUnlocked = badges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={cn(
                          "relative p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border transition-all duration-500 flex flex-col items-center gap-3 text-center overflow-hidden group",
                          isUnlocked 
                            ? "bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary shadow-[inset_0_0_20px_rgba(227,53,13,0.05)] hover:shadow-[inset_0_0_30px_rgba(227,53,13,0.1)]" 
                            : "bg-black/20 border-white/5 text-foreground/20 hover:bg-black/30"
                        )}
                      >
                        {isUnlocked && <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 blur-[15px] rounded-full pointer-events-none" />}
                        <div className={cn("p-3 rounded-2xl transition-transform duration-500", isUnlocked ? "bg-primary/20 shadow-[0_0_15px_rgba(227,53,13,0.3)] group-hover:scale-110 group-hover:-rotate-3" : "bg-white/5 grayscale")}>
                          {badge.icon}
                        </div>
                        <div className="space-y-1">
                          <div className={cn("text-[9px] font-black uppercase tracking-[0.1em]", isUnlocked ? "text-primary" : "text-foreground/30")}>
                            {badge.name}
                          </div>
                          {isUnlocked && <div className="text-[8px] font-bold opacity-60 leading-relaxed text-foreground min-h-[2.5rem] flex items-center justify-center">{badge.desc}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 animate-fade-in-up">
              {/* Game HUD */}
              <div className="glass-panel px-4 md:px-6 py-4 rounded-[2rem] flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/20 border-white/10 relative overflow-hidden">
                {/* HUD ambient glow */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                
                <div className="flex gap-2 sm:gap-4 flex-wrap w-full lg:w-auto overflow-hidden justify-center lg:justify-start">
                  <div className="bg-black/40 px-4 py-2.5 md:py-3 rounded-[1.25rem] flex items-center gap-3 border border-white/5 min-w-[100px] md:min-w-[120px] backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {gameMode === 'marathon' ? <Flame className="w-5 h-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" /> : <Trophy className="w-5 h-5 text-yellow-500 shadow-yellow-500" />}
                    <div className="flex flex-col items-start leading-[1.1]">
                      <span className="text-[7px] font-black text-foreground/50 uppercase tracking-[0.2em]">{t('quiz.score_current')}</span>
                      <span className="font-black text-xl md:text-2xl tabular-nums text-white drop-shadow-md">{score}</span>
                    </div>
                  </div>

                  <div className="bg-black/40 px-4 py-2.5 md:py-3 rounded-[1.25rem] flex items-center gap-3 border border-white/5 opacity-80 min-w-[100px] md:min-w-[120px] backdrop-blur-sm">
                    <Gamepad2 className="w-5 h-5 text-primary/70" />
                    <div className="flex flex-col items-start leading-[1.1]">
                      <span className="text-[7px] font-black text-foreground/50 uppercase tracking-[0.2em]">{t('quiz.score_high')}</span>
                      <span className="font-black text-xl md:text-2xl tabular-nums text-foreground/80">{isDaily ? '-' : quizHighScores[quizChallenge]}</span>
                    </div>
                  </div>
                  
                  {gameMode === 'time-attack' && (
                    <div className={cn(
                      "bg-black/40 px-4 py-2.5 md:py-3 rounded-[1.25rem] flex items-center gap-3 border transition-colors min-w-[100px] md:min-w-[120px] backdrop-blur-sm",
                      timeLeft < 10 ? "border-red-500/50 bg-red-500/10 text-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]" : "border-white/5"
                    )}>
                      <Timer className={cn("w-5 h-5", timeLeft < 10 ? "animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-blue-400")} />
                      <div className="flex flex-col items-start leading-[1.1]">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-60">Timer</span>
                        <span className="font-black text-xl md:text-2xl tabular-nums tracking-tighter">{timeLeft}s</span>
                      </div>
                    </div>
                  )}

                  {gameMode === 'survival' && (
                    <div className="bg-black/40 px-4 py-2.5 md:py-3 rounded-[1.25rem] flex items-center border border-white/5 h-full backdrop-blur-sm min-h-[52px]">
                      <div className="flex gap-1.5 items-center">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart 
                            key={i} 
                            className={cn("w-4 h-4 md:w-5 md:h-5 transition-all duration-300", i < lives ? "text-red-500 fill-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "text-white/10 scale-90")} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {gameMode === 'marathon' && (
                    <div className="bg-black/40 px-4 py-2.5 md:py-3 rounded-[1.25rem] flex items-center gap-3 border border-white/5 backdrop-blur-sm">
                      <div className="flex flex-col items-start leading-[1.1]">
                        <span className="text-[7px] font-black text-red-400/60 uppercase tracking-[0.2em]">{t('quiz.errors')}</span>
                        <span className="font-black text-xl md:text-2xl tabular-nums text-red-400">{wrongAnswers}<span className="text-sm text-foreground/30">/5</span></span>
                      </div>
                    </div>
                  )}

                  {isDaily && (
                    <div className="bg-orange-500/10 px-4 py-2.5 md:py-3 rounded-[1.25rem] flex items-center gap-3 border border-orange-500/20 backdrop-blur-sm">
                      <div className="flex flex-col items-start leading-[1.1]">
                        <span className="text-[7px] font-black text-orange-500/80 uppercase tracking-[0.2em]">{t('quiz.progress')}</span>
                        <span className="font-black text-xl md:text-2xl tabular-nums text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">{dailyIndex}<span className="text-sm text-orange-500/40">/10</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Game Stage */}
              <div className="relative min-h-[22rem] md:min-h-[26rem] flex flex-col items-center justify-center p-6 md:p-8 rounded-[3rem] border border-white/[0.08] overflow-hidden group">
                {/* Stage background */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-[2px]" />
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {/* Stage spotlight */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 blur-[100px] rounded-full pointer-events-none transition-all duration-1000 group-hover:scale-110 group-hover:bg-primary/15" />
                
                <AnimatePresence mode="wait">
                  {gameState === 'loading' ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center gap-4 relative z-10"
                    >
                      <Loader2 className="w-16 h-16 animate-spin text-primary/40 drop-shadow-[0_0_15px_rgba(227,53,13,0.3)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 animate-pulse">Loading Stage...</span>
                    </motion.div>
                  ) : currentPokemon ? (
                    <motion.div
                      key={currentPokemon.id}
                      initial={{ scale: 0.5, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                      className="w-full flex flex-col items-center relative z-10"
                    >
                      {quizChallenge === 'stats' ? (
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] w-full max-w-[20rem] md:max-w-md space-y-4 md:space-y-5 shadow-2xl relative">
                          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-foreground/60 mb-4 md:mb-6 text-center">{t('quiz.who_stats')}</p>
                          {[
                            { label: t('stats.hp_short'), val: currentPokemon.stats[0].base_stat, color: '#FF4757' },
                            { label: t('stats.attack_short'), val: currentPokemon.stats[1].base_stat, color: '#FFA502' },
                            { label: t('stats.defense_short'), val: currentPokemon.stats[2].base_stat, color: '#ECCC68' },
                            { label: t('stats.special_attack_short'), val: currentPokemon.stats[3].base_stat, color: '#3742FA' },
                            { label: t('stats.special_defense_short'), val: currentPokemon.stats[4].base_stat, color: '#7BED9F' },
                            { label: t('stats.speed_short'), val: currentPokemon.stats[5].base_stat, color: '#FF6B81' },
                          ].map(s => (
                            <div key={s.label} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest text-foreground/80">
                                <span>{s.label}</span>
                                <span className={gameState === 'answered' ? 'text-primary drop-shadow-[0_0_5px_rgba(227,53,13,0.5)]' : 'opacity-30'}>
                                  {gameState === 'answered' ? s.val : '???'}
                                </span>
                              </div>
                              <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(s.val / 255) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}80` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative w-56 h-56 md:w-80 md:h-80 drop-shadow-2xl flex items-center justify-center float-particle">
                          <div className={cn(
                            "absolute inset-0 bg-primary/20 blur-[60px] rounded-full transition-opacity duration-700",
                            gameState === 'answered' && isCorrect ? "opacity-100 bg-green-500/30" : "opacity-0"
                          )} />
                          <Image 
                            src={currentPokemon.sprites.other['official-artwork'].front_default || currentPokemon.sprites.front_default} 
                            alt="Mystery Pokemon"
                            fill
                            className={cn(
                              "object-contain transition-all duration-700 ease-out",
                              gameState === 'playing' && quizChallenge === 'silhouette' ? "brightness-0 contrast-100 opacity-90 drop-shadow-[0_0_15px_rgba(0,0,0,1)]" : "brightness-100 drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
                            )}
                          />
                        </div>
                      )}
                      
                      <div className="h-14 md:h-16 flex items-center justify-center mt-4">
                        {gameState === 'answered' && (
                          <motion.div 
                            initial={{ scale: 0, rotate: -5, y: 15 }}
                            animate={{ scale: 1, rotate: 0, y: 0 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                          >
                            {isCorrect ? (
                              <div className="bg-green-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.3)] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs border border-green-400">
                                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> {t('quiz.correct')}
                              </div>
                            ) : (
                              <div className="bg-red-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full shadow-[0_10px_30px_rgba(239,68,68,0.3)] flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs border border-red-400">
                                <AlertCircle className="w-4 h-4 md:w-5 md:h-5" /> {t('quiz.wrong')}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isActualAnswer = option === currentPokemon?.name;
                  const isRevealed = gameState === 'answered';
                  
                  let buttonStateClass = "glass-btn border-white/10 hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98] shadow-lg";
                  
                  if (isRevealed) {
                    if (isActualAnswer) {
                      buttonStateClass = "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                    } else if (isSelected) {
                      buttonStateClass = "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
                    } else {
                      buttonStateClass = "bg-black/30 border-white/5 opacity-40 grayscale pointer-events-none";
                    }
                  }

                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.1, duration: 0.5, ease: "easeOut" } }}
                      disabled={gameState !== 'playing'}
                      onClick={() => handleAnswer(option)}
                      className={cn(
                        "h-16 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs md:text-sm transition-all duration-300 border-2 relative overflow-hidden group",
                        buttonStateClass
                      )}
                    >
                      {!isRevealed && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />}
                      <span className="relative z-10 drop-shadow-md">{getLocalizedName(option)}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
