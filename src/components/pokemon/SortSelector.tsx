'use client';

import { usePokedexStore } from '@/store/pokedex';
import { ArrowDownAZ, ArrowUpAZ, Hash, ListOrdered } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SortSelector() {
  const { sortBy, setSortBy } = usePokedexStore();

  const options = [
    { value: 'id-asc', label: 'ID (Low to High)', icon: Hash },
    { value: 'id-desc', label: 'ID (High to Low)', icon: ListOrdered },
    { value: 'name-asc', label: 'Name (A-Z)', icon: ArrowDownAZ },
    { value: 'name-desc', label: 'Name (Z-A)', icon: ArrowUpAZ },
  ] as const;

  type SortValue = typeof options[number]['value'];

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 hidden sm:block">Sort By</span>
      <Select value={sortBy} onValueChange={(val: SortValue | null) => val && setSortBy(val)}>
        <SelectTrigger className="w-[180px] rounded-full bg-secondary/40 backdrop-blur-md border-white/10 text-xs font-bold uppercase tracking-wider h-10 focus:ring-primary/30">
          <SelectValue placeholder="Sort by" />
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
