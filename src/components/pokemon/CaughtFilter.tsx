'use client';

import { usePrimeDexStore } from '@/store/primedex';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SVGProps } from 'react';
import { useTranslation } from '@/lib/i18n';

export default function CaughtFilter() {
  const { showCaughtOnly, setShowCaughtOnly } = usePrimeDexStore();
  const { t } = useTranslation();

  const modes: { id: 'all' | 'caught' | 'uncaught', label: string }[] = [
    { id: 'all', label: t('caught_filter.all') },
    { id: 'caught', label: t('caught_filter.caught') },
    { id: 'uncaught', label: t('caught_filter.missing') }
  ];

  return (
    <div className="flex bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-full p-1">
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCaughtOnly(mode.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-400",
            showCaughtOnly === mode.id
              ? "bg-primary text-white shadow-[0_4px_16px_-4px_rgba(227,53,13,0.4)]" 
              : "text-foreground/35 hover:text-foreground/60"
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
