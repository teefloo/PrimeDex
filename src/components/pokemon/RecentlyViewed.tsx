'use client';

import { usePokedexStore } from '@/store/pokedex';
import { History, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatId } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function RecentlyViewed() {
  const { history, clearHistory } = usePokedexStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <section className="mt-20 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/50 rounded-xl">
            <History className="w-5 h-5 text-foreground/60" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Recently Viewed</h3>
            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5">Your last {history.length} explorations</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearHistory}
          className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
        {history.map((p, idx) => (
          <Link key={`${p.id}-${idx}`} href={`/pokemon/${p.name}`}>
            <motion.div 
              whileHover={{ y: -5, scale: 1.05 }}
              className="glass-panel p-3 rounded-2xl flex flex-col items-center text-center gap-2 group border-white/5 hover:border-primary/20 transition-all"
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-lg group-hover:bg-primary/10 transition-colors" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} 
                  alt={p.name} 
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-sm"
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-foreground/30">{formatId(p.id)}</p>
                <p className="text-[10px] font-black capitalize truncate max-w-full text-foreground/70 group-hover:text-primary transition-colors">{p.name}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
