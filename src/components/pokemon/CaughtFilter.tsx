'use client';

import { usePokedexStore } from '@/store/pokedex';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SVGProps } from 'react';

export default function CaughtFilter() {
  const { showCaughtOnly, setShowCaughtOnly } = usePokedexStore();

  const modes: { id: 'all' | 'caught' | 'uncaught', label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'caught', label: 'Caught' },
    { id: 'uncaught', label: 'Missing' }
  ];

  return (
    <div className="flex bg-secondary/40 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-sm">
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCaughtOnly(mode.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
            showCaughtOnly === mode.id
              ? "bg-primary text-white shadow-lg shadow-primary/20" 
              : "text-foreground/40 hover:text-foreground/70"
          )}
        >
          {mode.id === 'caught' && <PokeballIcon className="w-3 h-3" />}
          <span>{mode.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function PokeballIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
