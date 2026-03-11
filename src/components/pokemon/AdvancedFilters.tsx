'use client';

import { usePokedexStore } from '@/store/pokedex';
import { TYPE_COLORS } from '@/types/pokemon';
import { cn } from '@/lib/utils';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Check
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

const GENERATIONS = [
  { name: 'Gen 1', id: 1, region: 'Kanto' },
  { name: 'Gen 2', id: 2, region: 'Johto' },
  { name: 'Gen 3', id: 3, region: 'Hoenn' },
  { name: 'Gen 4', id: 4, region: 'Sinnoh' },
  { name: 'Gen 5', id: 5, region: 'Unova' },
  { name: 'Gen 6', id: 6, region: 'Kalos' },
  { name: 'Gen 7', id: 7, region: 'Alola' },
  { name: 'Gen 8', id: 8, region: 'Galar' },
  { name: 'Gen 9', id: 9, region: 'Paldea' },
];

const EGG_GROUPS = [
  'monster', 'bug', 'flying', 'field', 'fairy', 'grass', 'human-like', 
  'water1', 'water2', 'water3', 'mineral', 'amorphous', 'dragon', 'no-eggs'
];

const COLORS = [
  'red', 'blue', 'yellow', 'green', 'black', 'brown', 'purple', 'gray', 'white', 'pink'
];

const SHAPES = [
  'ball', 'squiggle', 'fish', 'arms', 'blob', 'upright', 'legs', 
  'wings', 'tentacles', 'heads', 'humanoid', 'bug-wings', 'armor'
];

export default function AdvancedFilters() {
  const { 
    selectedTypes, 
    toggleType, 
    selectedGeneration, 
    setSelectedGeneration,
    selectedEggGroups,
    toggleEggGroup,
    selectedColors,
    toggleColor,
    selectedShapes,
    toggleShape,
    isLegendary,
    setIsLegendary,
    isMythical,
    setIsMythical,
    minBaseStats,
    setMinBaseStats,
    minAttack,
    setMinAttack,
    minDefense,
    setMinDefense,
    minSpeed,
    setMinSpeed,
    minHp,
    setMinHp,
    heightRange,
    setHeightRange,
    weightRange,
    setWeightRange,
    resetFilters
  } = usePokedexStore();
  const { t } = useTranslation();

  const activeFiltersCount = [
    selectedTypes.length > 0,
    selectedGeneration !== null,
    selectedEggGroups.length > 0,
    selectedColors.length > 0,
    selectedShapes.length > 0,
    isLegendary !== null,
    isMythical !== null,
    minBaseStats > 0,
    minAttack > 0,
    minDefense > 0,
    minSpeed > 0,
    minHp > 0,
    heightRange[0] > 0 || heightRange[1] < 20,
    weightRange[0] > 0 || weightRange[1] < 1000
  ].filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger 
        render={
          <Button 
            variant="outline" 
            className="relative glass-btn px-6 py-6 rounded-2xl gap-2 group hover:border-primary/50 transition-all duration-300"
          />
        }
      >
        <SlidersHorizontal className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span className="font-bold uppercase tracking-widest text-xs">{t('filters.button')}</span>
        {activeFiltersCount > 0 && (
          <Badge 
            variant="default" 
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0 rounded-full bg-primary text-white border-2 border-background animate-in zoom-in"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background/95 backdrop-blur-2xl border-l border-white/10 flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-primary" />
              {t('filters.title')}
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={resetFilters}
              className="hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
              title={t('filters.reset')}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-10 pb-10">
            {/* Generation Filter */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                {t('filters.generation')}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {GENERATIONS.map((gen) => {
                  const isActive = selectedGeneration === gen.id;
                  return (
                    <button
                      key={gen.id}
                      onClick={() => setSelectedGeneration(isActive ? null : gen.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
                        isActive 
                          ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(255,50,50,0.1)]" 
                          : "bg-secondary/20 border-white/5 text-foreground/60 hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      <span className="text-xs font-black">{gen.name}</span>
                      <span className="text-[9px] font-medium opacity-60 uppercase">{gen.region}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Types Filter */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                {t('filters.types')}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(TYPE_COLORS).map((type) => {
                  const isActive = selectedTypes.includes(type);
                  const color = TYPE_COLORS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 overflow-hidden group",
                        isActive 
                          ? "text-white border-transparent" 
                          : "bg-secondary/20 border-white/5 text-foreground/60 hover:border-white/20 hover:text-foreground"
                      )}
                      style={isActive ? { backgroundColor: color } : {}}
                    >
                      {isActive && <Check className="w-3 h-3 relative z-10" />}
                      <span className="text-[10px] font-black uppercase tracking-wider relative z-10">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legendary & Mythical Status */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                {t('filters.special')}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold">{t('filters.legendary')}</span>
                    <span className="text-[10px] text-foreground/40 font-medium">{t('filters.legendary_desc')}</span>
                  </div>
                  <Switch 
                    checked={isLegendary === true}
                    onCheckedChange={(checked) => setIsLegendary(checked ? true : null)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold">Mythical</span>
                    <span className="text-[10px] text-foreground/40 font-medium">Show only Mythical Pokémon</span>
                  </div>
                  <Switch 
                    checked={isMythical === true}
                    onCheckedChange={(checked) => setIsMythical(checked ? true : null)}
                  />
                </div>
              </div>
            </div>

            {/* Egg Groups Filter */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                Egg Groups
              </h4>
              <div className="flex flex-wrap gap-2">
                {EGG_GROUPS.map((group) => {
                  const isActive = selectedEggGroups.includes(group);
                  return (
                    <button
                      key={group}
                      onClick={() => toggleEggGroup(group)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-200",
                        isActive 
                          ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20" 
                          : "bg-secondary/20 border-white/5 text-foreground/60 hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors Filter */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                Colors
              </h4>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => {
                  const isActive = selectedColors.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-200",
                        isActive 
                          ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20" 
                          : "bg-secondary/20 border-white/5 text-foreground/60 hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shapes Filter */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                Shapes
              </h4>
              <div className="flex flex-wrap gap-2">
                {SHAPES.map((shape) => {
                  const isActive = selectedShapes.includes(shape);
                  return (
                    <button
                      key={shape}
                      onClick={() => toggleShape(shape)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-200",
                        isActive 
                          ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20" 
                          : "bg-secondary/20 border-white/5 text-foreground/60 hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      {shape}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min BST Slider */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                  {t('filters.min_bst')}
                </h4>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-black border-none">
                  {minBaseStats}+
                </Badge>
              </div>
              <Slider
                value={[minBaseStats]}
                onValueChange={(val) => setMinBaseStats(Array.isArray(val) ? val[0] : val as number)}
                max={800}
                step={10}
                className="py-4"
              />
              <div className="flex justify-between text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                <span>0</span>
                <span>400 ({t('filters.avg')})</span>
                <span>800</span>
              </div>
            </div>

            {/* Individual Stats Sliders */}
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                Minimum Base Stats
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">HP</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-black border-none text-[10px]">
                    {minHp}+
                  </Badge>
                </div>
                <Slider
                  value={[minHp]}
                  onValueChange={(val) => setMinHp(Array.isArray(val) ? val[0] : val as number)}
                  max={255}
                  step={5}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Attack</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-black border-none text-[10px]">
                    {minAttack}+
                  </Badge>
                </div>
                <Slider
                  value={[minAttack]}
                  onValueChange={(val) => setMinAttack(Array.isArray(val) ? val[0] : val as number)}
                  max={255}
                  step={5}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Defense</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-black border-none text-[10px]">
                    {minDefense}+
                  </Badge>
                </div>
                <Slider
                  value={[minDefense]}
                  onValueChange={(val) => setMinDefense(Array.isArray(val) ? val[0] : val as number)}
                  max={255}
                  step={5}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase">Speed</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-black border-none text-[10px]">
                    {minSpeed}+
                  </Badge>
                </div>
                <Slider
                  value={[minSpeed]}
                  onValueChange={(val) => setMinSpeed(Array.isArray(val) ? val[0] : val as number)}
                  max={255}
                  step={5}
                />
              </div>
            </div>

            {/* Height Slider */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                  {t('filters.height')}
                </h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="font-black border-white/10">{heightRange[0]}m</Badge>
                  <span className="text-foreground/20">-</span>
                  <Badge variant="outline" className="font-black border-white/10">{heightRange[1]}m</Badge>
                </div>
              </div>
              <Slider
                value={heightRange}
                onValueChange={(val) => setHeightRange(val as [number, number])}
                max={20}
                step={0.1}
                className="py-4 cursor-pointer"
              />
            </div>

            {/* Weight Slider */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                  {t('filters.weight')}
                </h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="font-black border-white/10">{weightRange[0]}kg</Badge>
                  <span className="text-foreground/20">-</span>
                  <Badge variant="outline" className="font-black border-white/10">{weightRange[1]}kg</Badge>
                </div>
              </div>
              <Slider
                value={weightRange}
                onValueChange={(val) => setWeightRange(val as [number, number])}
                max={1000}
                step={1}
                className="py-4 cursor-pointer"
              />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-white/5 bg-background/50">
          <SheetClose render={<Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_8px_30px_rgb(255,50,50,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all" />}>
            {t('filters.apply')}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
