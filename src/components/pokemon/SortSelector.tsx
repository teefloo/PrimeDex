'use client';

import { usePokedexStore } from '@/store/pokedex';
import { ArrowDownAZ, ArrowUpAZ, Hash, ListOrdered, ArrowDown10, ArrowUp10, Scale } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from 'react-i18next';

export default function SortSelector() {
  const { sortBy, setSortBy } = usePokedexStore();
  const { t } = useTranslation();

  const options = [
    { value: 'id-asc', label: t('sort.id-asc'), icon: Hash },
    { value: 'id-desc', label: t('sort.id-desc'), icon: ListOrdered },
    { value: 'name-asc', label: t('sort.name-asc'), icon: ArrowDownAZ },
    { value: 'name-desc', label: t('sort.name-desc'), icon: ArrowUpAZ },
    { value: 'height-asc', label: t('sort.height-asc'), icon: ArrowDown10 },
    { value: 'height-desc', label: t('sort.height-desc'), icon: ArrowUp10 },
    { value: 'weight-asc', label: t('sort.weight-asc'), icon: Scale },
    { value: 'weight-desc', label: t('sort.weight-desc'), icon: Scale },
  ] as const;

  type SortValue = typeof options[number]['value'];

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 hidden sm:block">{t('sort.label')}</span>
      <Select value={sortBy} onValueChange={(val: SortValue | null) => val && setSortBy(val as any)}>
        <SelectTrigger className="w-[200px] rounded-full bg-secondary/40 backdrop-blur-md border-white/10 text-xs font-bold uppercase tracking-wider h-10 focus:ring-primary/30">
          <SelectValue placeholder={t('sort.placeholder')} />
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl p-1">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value} 
              value={opt.value}
              className="rounded-xl focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer py-2.5"
            >
              <div className="flex items-center gap-2">
                <opt.icon className="w-3.5 h-3.5 opacity-50" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
