'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Gauge, Info, Sparkles, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getMovePokemonLearners } from '@/lib/api/graphql';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TYPE_COLORS, MoveListItem, MovePokemonLearner } from '@/types/pokemon';
import { usePrimeDexStore } from '@/store/primedex';
import { useState } from 'react';

interface MoveDetailModalProps {
  move: MoveListItem | null;
  open: boolean;
  onClose: () => void;
}

export default function MoveDetailModal({ move, open, onClose }: MoveDetailModalProps) {
  const { t } = useTranslation();
  const getLanguageId = usePrimeDexStore((s) => s.getLanguageId);
  const languageId = getLanguageId();

  const { data: learnersData, isLoading: learnersLoading } = useQuery({
    queryKey: ['move-learners', move?.name, languageId],
    queryFn: () => getMovePokemonLearners(move!.name, languageId),
    enabled: !!move && open,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const learners: MovePokemonLearner[] = (learnersData || [])
    .filter((entry) => entry.pokemon_v2_pokemon !== null)
    .map((entry) => {
      const pokemon = entry.pokemon_v2_pokemon!;
      return {
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
        localizedName: pokemon.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.[0]?.name || pokemon.name,
      };
    });

  if (!move) return null;

  const typeColor = TYPE_COLORS[move.type] || '#6B7280';

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-background/95 backdrop-blur-3xl p-0 gap-0">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/5">
          <div
            className="absolute inset-0 opacity-10 rounded-t-3xl"
            style={{ background: `linear-gradient(135deg, ${typeColor}40, transparent)` }}
          />
          <div className="relative flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-black tracking-tight capitalize pr-8">
                {move.localizedName}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t('moves_page.effect')} {move.description}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  className="text-white text-xs font-bold px-3 py-1"
                  style={{ backgroundColor: typeColor }}
                >
                  {t(`types.${move.type}`)}
                </Badge>
                <Badge variant="outline" className="text-xs font-bold border-white/20 text-foreground/70">
                  {t(`moves.damage_class.${move.damage_class}`)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox
            icon={<Trophy className="w-5 h-5 text-orange-400" />}
            label={t('moves.power_short')}
            value={move.power !== null ? String(move.power) : '—'}
          />
          <StatBox
            icon={<Target className="w-5 h-5 text-green-400" />}
            label={t('moves.accuracy_short')}
            value={move.accuracy !== null ? `${move.accuracy}%` : '—'}
          />
          <StatBox
            icon={<Zap className="w-5 h-5 text-blue-400" />}
            label={t('moves_page.pp')}
            value={move.pp !== null ? String(move.pp) : '—'}
          />
          <StatBox
            icon={<Gauge className="w-5 h-5 text-purple-400" />}
            label={t('moves_page.priority')}
            value={String(move.priority)}
          />
        </div>

        {/* Description */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-foreground/40" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground/40">
              {t('moves_page.effect')}
            </span>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">
            {move.description || t('moves_page.no_description')}
          </p>
        </div>

        {/* Generation */}
        {move.generation_id !== null && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground/40" />
              <span className="text-xs font-bold text-foreground/50">
                {t('moves_page.generation')}: {move.generation_id}
              </span>
            </div>
          </div>
        )}

        {/* Learners */}
        <div className="border-t border-white/5">
          <div className="p-6 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-foreground/40" />
              <span className="text-xs font-black uppercase tracking-widest text-foreground/40">
                {t('moves_page.learners_title')}
              </span>
              {!learnersLoading && (
                <Badge variant="outline" className="text-[10px] border-white/10 text-foreground/50 ml-auto">
                  {t('moves_page.learners_count', { count: learners.length })}
                </Badge>
              )}
            </div>

            {learnersLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : learners.length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-4">
                {t('moves_page.no_learners')}
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {learners.map((pokemon) => (
                  <PokemonLearnerCard key={pokemon.id} pokemon={pokemon} onClose={onClose} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PokemonLearnerCard({ pokemon, onClose }: { pokemon: MovePokemonLearner; onClose: () => void }) {
  const [imgSrc, setImgSrc] = useState(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);
  const fallbackImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  return (
    <Link
      href={`/pokemon/${pokemon.name}`}
      onClick={onClose}
      className="group"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
      >
        <div className="relative w-12 h-12 mb-1">
          <Image
            src={imgSrc}
            alt={pokemon.localizedName}
            fill
            className="object-contain drop-shadow-lg"
            sizes="48px"
            loading="lazy"
            onError={() => setImgSrc(fallbackImg)}
          />
        </div>
        <span className="text-[10px] font-bold text-foreground/60 truncate w-full text-center capitalize group-hover:text-foreground transition-colors">
          {pokemon.localizedName}
        </span>
        <div className="flex gap-0.5 mt-0.5">
          {pokemon.types.map((type) => (
            <div
              key={type}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[type] || '#6B7280' }}
            />
          ))}
        </div>
      </motion.div>
    </Link>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{label}</span>
      <span className="text-lg font-black text-foreground">{value}</span>
    </div>
  );
}
