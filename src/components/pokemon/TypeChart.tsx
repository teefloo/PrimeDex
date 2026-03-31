'use client';

import { useMemo, useState, useCallback } from 'react';
import { TYPE_COLORS } from '@/types/pokemon';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';

// Canonical Gen VI+ type effectiveness chart
// Rows = attacking type, Columns = defending type
// 0 = no effect, 0.5 = not very effective, 1 = normal, 2 = super effective
const TYPE_ORDER = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;

type TypeName = typeof TYPE_ORDER[number];

// effectiveness[attacking][defending]
const EFFECTIVENESS: Record<TypeName, Record<TypeName, number>> = {
  normal:   { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  fire:     { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1 },
  water:    { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  electric: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  grass:    { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1 },
  ice:      { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1 },
  fighting: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2 },
  ground:   { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1 },
  flying:   { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  psychic:  { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1 },
  bug:      { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  ghost:    { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1 },
  dragon:   { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0 },
  dark:     { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 0.5, fairy: 0.5 },
  steel:    { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2 },
  fairy:    { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1 },
};

function getCellStyle(value: number): { bg: string; text: string; label: string } {
  switch (value) {
    case 2:   return { bg: 'bg-green-500/80', text: 'text-white font-black', label: '2' };
    case 0.5: return { bg: 'bg-red-500/60', text: 'text-white/90 font-bold', label: '½' };
    case 0:   return { bg: 'bg-zinc-900/80', text: 'text-zinc-500 font-bold', label: '0' };
    default:  return { bg: 'bg-transparent', text: 'text-foreground/20', label: '' };
  }
}

interface TypeChartProps {
  onTypeClick?: (type: string) => void;
}

export default function TypeChart({ onTypeClick }: TypeChartProps) {
  const { t } = useTranslation();
  const [hoveredCell, setHoveredCell] = useState<{ atk: string; def: string } | null>(null);

  const handleCellHover = useCallback((atk: string, def: string) => {
    setHoveredCell({ atk, def });
  }, []);

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const isHighlighted = useCallback((type: string) => {
    if (!hoveredCell) return false;
    return type === hoveredCell.atk || type === hoveredCell.def;
  }, [hoveredCell]);

  const tooltipInfo = useMemo(() => {
    if (!hoveredCell) return null;
    const val = EFFECTIVENESS[hoveredCell.atk as TypeName][hoveredCell.def as TypeName];
    return { atk: hoveredCell.atk, def: hoveredCell.def, value: val };
  }, [hoveredCell]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel p-4 md:p-6 lg:p-8 rounded-[2.5rem] relative"
    >
      <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Grid3x3 className="w-6 h-6 text-primary" />
        </div>
        {t('types_page.type_chart')}
      </h3>
      <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest mb-6">
        {t('types_page.type_chart_desc')}
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: t('types_page.super_effective'), color: 'bg-green-500/80' },
          { label: t('types_page.normal_damage'), color: 'bg-white/5 border border-white/10' },
          { label: t('types_page.not_very_effective'), color: 'bg-red-500/60' },
          { label: t('types_page.no_effect'), color: 'bg-zinc-900/80' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn('w-4 h-4 rounded-md', item.color)} />
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltipInfo && (
        <div className="mb-4 px-4 py-2 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl inline-flex items-center gap-3 text-xs">
          <span className="font-black uppercase text-[10px]" style={{ color: TYPE_COLORS[tooltipInfo.atk] }}>
            {t(`types.${tooltipInfo.atk}`)}
          </span>
          <span className="text-foreground/30">→</span>
          <span className="font-black uppercase text-[10px]" style={{ color: TYPE_COLORS[tooltipInfo.def] }}>
            {t(`types.${tooltipInfo.def}`)}
          </span>
          <span className="text-foreground/30">=</span>
          <span className={cn(
            'font-black',
            tooltipInfo.value === 2 && 'text-green-400',
            tooltipInfo.value === 0.5 && 'text-red-400',
            tooltipInfo.value === 0 && 'text-zinc-500',
            tooltipInfo.value === 1 && 'text-foreground/50',
          )}>
            {tooltipInfo.value}×
          </span>
        </div>
      )}

      {/* Matrix */}
      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 pb-2">
        <div className="min-w-[650px]">
          <table className="w-full border-collapse" role="grid" aria-label={t('types_page.type_chart')}>
            <thead>
              <tr>
                {/* Corner cell: ATK \ DEF */}
                <th className="p-1 sticky left-0 z-20 bg-background/90 backdrop-blur-sm">
                  <div className="w-full h-full flex items-center justify-center text-[8px] md:text-[9px] font-black text-foreground/30 uppercase tracking-wider">
                    <span className="text-primary/60">{t('types_page.atk_label')}</span>
                    <span className="mx-0.5 text-foreground/20">╲</span>
                    <span className="text-foreground/40">{t('types_page.def_label')}</span>
                  </div>
                </th>
                {/* Column headers (defending types) */}
                {TYPE_ORDER.map((defType) => (
                  <th
                    key={defType}
                    className={cn(
                      'p-0.5 md:p-1 transition-all duration-200',
                      isHighlighted(defType) && 'scale-105'
                    )}
                  >
                    <button
                      onClick={() => onTypeClick?.(defType)}
                      className={cn(
                        'w-full flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-lg transition-all duration-200 hover:bg-white/5',
                        isHighlighted(defType) && 'bg-white/10'
                      )}
                      aria-label={t(`types.${defType}`)}
                    >
                      <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: TYPE_COLORS[defType] }}
                      />
                      <span className="text-[6px] md:text-[7px] font-black uppercase tracking-tight text-foreground/50 leading-none">
                        {t(`types.${defType}`).slice(0, 3)}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TYPE_ORDER.map((atkType) => (
                <tr key={atkType} className="group">
                  {/* Row header (attacking type) */}
                  <td className={cn(
                    'p-0.5 md:p-1 sticky left-0 z-10 bg-background/90 backdrop-blur-sm transition-all duration-200',
                    isHighlighted(atkType) && 'bg-white/5'
                  )}>
                    <button
                      onClick={() => onTypeClick?.(atkType)}
                      className={cn(
                        'flex items-center gap-1 md:gap-1.5 py-1 px-1 md:px-2 rounded-lg transition-all duration-200 hover:bg-white/5 w-full',
                        isHighlighted(atkType) && 'bg-white/10'
                      )}
                      aria-label={t(`types.${atkType}`)}
                    >
                      <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm flex-shrink-0"
                        style={{ backgroundColor: TYPE_COLORS[atkType] }}
                      />
                      <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tight text-foreground/60 leading-none truncate">
                        {t(`types.${atkType}`).slice(0, 4)}
                      </span>
                    </button>
                  </td>
                  {/* Effectiveness cells */}
                  {TYPE_ORDER.map((defType) => {
                    const val = EFFECTIVENESS[atkType][defType];
                    const style = getCellStyle(val);
                    return (
                      <td
                        key={defType}
                        className="p-[1px] md:p-0.5"
                        onMouseEnter={() => handleCellHover(atkType, defType)}
                        onMouseLeave={handleCellLeave}
                      >
                        <div
                          className={cn(
                            'w-full aspect-square rounded-[4px] md:rounded-md flex items-center justify-center transition-all duration-150',
                            style.bg,
                            style.text,
                            'text-[8px] md:text-[10px]',
                            hoveredCell?.atk === atkType && hoveredCell?.def === defType
                              ? 'ring-2 ring-primary/60 scale-110 z-10 relative shadow-lg'
                              : 'hover:scale-105',
                            val === 1 && 'border border-white/[0.03]'
                          )}
                          role="gridcell"
                          aria-label={`${t(`types.${atkType}`)} vs ${t(`types.${defType}`)}: ${val}×`}
                        >
                          {style.label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
